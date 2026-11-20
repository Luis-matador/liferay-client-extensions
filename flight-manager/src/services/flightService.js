import axios from 'axios';
import { AVIATIONSTACK_CONFIG, USE_MOCK_FLIGHTS } from '../config/aviationstack.config';
import { getAirportCoordinates } from '../constants/airports';
import { flightSimulator } from './flightSimulator';
import { generateMockFlights } from './mockFlightDataGenerator';

// Cliente HTTP para AviationStack
const aviationStackClient = axios.create({
  baseURL: AVIATIONSTACK_CONFIG.BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

console.log('✈️ Flight Tracker - Sistema de Vuelos Reales con AviationStack API');

const STORAGE_KEY = 'flight_tracker_data';

// Aeropuertos europeos principales (IATA codes)
const EUROPEAN_AIRPORTS = [
  // España
  'MAD', 'BCN', 'AGP', 'PMI', 'VLC', 'SVQ', 'BIO', 'ALC', 'TFS', 'LPA',
  // Reino Unido
  'LHR', 'LGW', 'MAN', 'STN', 'LTN', 'EDI', 'BHX', 'GLA', 'BRS',
  // Francia
  'CDG', 'ORY', 'NCE', 'LYS', 'MRS', 'TLS', 'BOD', 'NTE',
  // Alemania
  'FRA', 'MUC', 'TXL', 'BER', 'DUS', 'HAM', 'CGN', 'STR', 'LEJ',
  // Italia
  'FCO', 'MXP', 'LIN', 'VCE', 'NAP', 'BGY', 'CIA', 'BLQ', 'PSA', 'CTA',
  // Países Bajos
  'AMS', 'RTM', 'EIN',
  // Bélgica
  'BRU', 'CRL',
  // Suiza
  'ZRH', 'GVA', 'BSL',
  // Austria
  'VIE',
  // Portugal
  'LIS', 'OPO', 'FAO',
  // Escandinavia
  'CPH', 'ARN', 'OSL', 'HEL', 'BGO', 'GOT',
  // Europa del Este
  'WAW', 'PRG', 'BUD', 'OTP', 'SOF', 'BEG',
  // Grecia
  'ATH', 'SKG', 'HER', 'RHO',
  // Irlanda
  'DUB', 'ORK', 'SNN',
  // Otros
  'ZAG', 'LJU', 'RIX', 'TLL', 'VNO', 'KRK', 'KTW', 'GDN', 'BTS'
];

// Verifica si un aeropuerto está en Europa
const isEuropeanAirport = (iataCode) => {
  return EUROPEAN_AIRPORTS.includes(iataCode?.toUpperCase());
};

// Servicio principal de vuelos con datos de AviationStack
export const flightService = {
  // Obtiene 20 vuelos reales y los adapta para hoy (con persistencia en sessionStorage)
  async getAllFlights(forceRefresh = false) {
    console.log('✈️ Obteniendo vuelos desde AviationStack API...');
    
    // Intentar cargar desde sessionStorage primero
    const stored = this._loadFromStorage();
    
    if (stored && !forceRefresh) {
      // Actualizar estados automáticamente según la hora actual
      const updated = this._updateFlightStates(stored.data);
      
      // Verificar si necesitamos refrescar (todos finalizados)
      const allLanded = updated.every(f => f.flight_status === 'landed');
      if (allLanded) {
        console.log('⚠️ Todos los vuelos han finalizado - Obteniendo nuevos...');
        return await this._fetchNewFlights();
      }
      
      return {
        data: updated,
        pagination: {
          limit: updated.length,
          offset: 0,
          count: updated.length,
          total: updated.length
        },
        fromStorage: true,
        source: 'sessionstorage-updated'
      };
    }
    
    // Si forzamos actualización o no hay datos guardados, obtener nuevos
    console.log(forceRefresh ? '🔄 Actualización forzada - Obteniendo nuevos vuelos...' : '📡 No hay vuelos guardados - Obteniendo datos iniciales...');
    return await this._fetchNewFlights();
  },

  // Fuerza actualización de vuelos desde la API
  async refreshFlights() {
    console.log('🔄 Actualizando vuelos desde AviationStack...');
    return await this.getAllFlights(true);
  },

  // Obtiene nuevos vuelos desde AviationStack (o mock si está activado)
  async _fetchNewFlights() {
    try {
      // ⚠️ MODO DESARROLLO - Usar datos mock si está activado
      if (USE_MOCK_FLIGHTS) {
        console.log('🧪 MODO DESARROLLO: Usando datos MOCK de vuelos (no se consume AviationStack API)');
        console.log('   ℹ️  Para usar API real: Cambiar VITE_USE_MOCK_FLIGHTS=false en archivo .env');
        
        // Obtener datos mock del generador
        const mockResponse = generateMockFlights();
        const mockFlights = mockResponse.data;
        
        console.log(`✅ ${mockFlights.length} vuelos mock cargados (datos determinísticos para debugging)`);
        console.log('📊 Distribución de vuelos mock:');
        console.log(`   - Finalizados: ${mockFlights.filter(f => f.flight_status === 'landed').length}`);
        console.log(`   - En vuelo: ${mockFlights.filter(f => f.flight_status === 'active').length}`);
        console.log(`   - Programados: ${mockFlights.filter(f => f.flight_status === 'scheduled').length}`);
        
        // Adaptar fechas para hoy (usa la misma lógica que con datos reales)
        const adaptedFlights = this._adaptFlightsToToday(mockFlights);
        
        const result = {
          data: adaptedFlights,
          pagination: {
            limit: adaptedFlights.length,
            offset: 0,
            count: adaptedFlights.length,
            total: adaptedFlights.length
          },
          fromStorage: false,
          source: 'mock-data'
        };

        // Guardar en sessionStorage
        this._saveToStorage(result);
        
        return result;
      }
      
      // ========== CÓDIGO ORIGINAL CON API REAL ==========
      console.log('📡 Obteniendo vuelos europeos de AviationStack...');
      
      // Aeropuertos europeos diversos - 2 por país para variedad
      const europeanHubsByRegion = [
        // España
        'MAD', 'BCN',
        // Reino Unido
        'LHR', 'MAN',
        // Francia
        'CDG', 'LYS',
        // Alemania
        'FRA', 'MUC',
        // Italia
        'FCO', 'MXP',
        // Países Bajos
        'AMS',
        // Escandinavia
        'CPH', 'ARN',
        // Europa del Este
        'WAW', 'PRG',
        // Otros
        'VIE', 'ZRH', 'BRU', 'DUB', 'ATH'
      ];
      
      // Seleccionar 5-7 aeropuertos aleatorios para mayor variedad
      const selectedHubs = this._selectRandomFlights(europeanHubsByRegion, 7);
      console.log(`🌍 Consultando vuelos desde: ${selectedHubs.join(', ')}`);
      
      let allFlights = [];
      let hubsQueried = 0;
      
      // Hacer múltiples llamadas a hubs europeos
      for (const hub of selectedHubs) {
        if (allFlights.length >= 40) break; // Recoger más para eliminar duplicados
        
        try {
          console.log(`🔍 Consultando vuelos desde ${hub}...`);
          
          const response = await aviationStackClient.get('/flights', {
            params: {
              access_key: AVIATIONSTACK_CONFIG.API_KEY,
              dep_iata: hub, // Vuelos que salen de este aeropuerto
              limit: 15
            }
          });
          
          if (response.data?.data) {
            // Filtrar solo vuelos con destino también europeo
            const europeanFlights = response.data.data.filter(f => 
              f.departure && f.arrival && 
              f.departure.iata && f.arrival.iata &&
              f.flight && f.flight.iata &&
              isEuropeanAirport(f.arrival.iata) // Destino en Europa
            );
            
            allFlights.push(...europeanFlights);
            hubsQueried++;
            console.log(`  ✅ ${europeanFlights.length} vuelos europeos desde ${hub}`);
          }
          
          // Pequeña pausa entre llamadas para no saturar la API
          await new Promise(resolve => setTimeout(resolve, 600));
          
        } catch (error) {
          console.warn(`  ⚠️ Error consultando ${hub}:`, error.message);
          continue;
        }
      }

      console.log(`✅ Total: ${allFlights.length} vuelos europeos obtenidos de ${hubsQueried} aeropuertos`);
      
      if (allFlights.length === 0) {
        console.warn('⚠️ No se encontraron vuelos europeos');
        return this._emptyResponse('No hay vuelos europeos disponibles en este momento');
      }
      
      // Eliminar duplicados por número de vuelo
      const uniqueFlights = [];
      const seenFlights = new Set();
      
      for (const flight of allFlights) {
        const flightKey = `${flight.flight.iata}_${flight.departure.iata}_${flight.arrival.iata}`;
        if (!seenFlights.has(flightKey)) {
          seenFlights.add(flightKey);
          uniqueFlights.push(flight);
        }
      }
      
      console.log(`🔄 ${uniqueFlights.length} vuelos únicos después de eliminar duplicados`);
      
      // Seleccionar 20 vuelos aleatorios
      const selectedFlights = this._selectRandomFlights(uniqueFlights, 20);
      console.log(`📊 Seleccionados ${selectedFlights.length} vuelos europeos para el tracker`);
      
      // Adaptar fechas y horas para el día de hoy
      const adaptedFlights = this._adaptFlightsToToday(selectedFlights);
      
      console.log('✅ Vuelos adaptados para hoy:');
      console.log(`   - Finalizados: ${adaptedFlights.filter(f => f.flight_status === 'landed').length}`);
      console.log(`   - En vuelo: ${adaptedFlights.filter(f => f.flight_status === 'active').length}`);
      console.log(`   - Programados: ${adaptedFlights.filter(f => f.flight_status === 'scheduled').length}`);

      const result = {
        data: adaptedFlights,
        pagination: {
          limit: adaptedFlights.length,
          offset: 0,
          count: adaptedFlights.length,
          total: adaptedFlights.length
        },
        fromStorage: false,
        source: 'aviationstack-adapted'
      };

      // Guardar en sessionStorage
      this._saveToStorage(result);
      
      return result;

    } catch (error) {
      console.error('❌ Error obteniendo vuelos de AviationStack:', error.message);
      return this._handleError(error);
    }
  },


  // Obtiene solo vuelos activos (para el mapa en tiempo real)
  async getActiveFlights(forceRefresh = false) {
    const allFlightsResponse = await this.getAllFlights(forceRefresh);
    
    if (allFlightsResponse.error) {
      return allFlightsResponse;
    }
    
    // Filtrar solo vuelos activos con datos GPS
    const activeFlights = allFlightsResponse.data.filter(
      flight => flight.flight_status === 'active' && flight.live
    );
    
    console.log(`✈️ Vuelos activos para el mapa: ${activeFlights.length}`);
    
    // Inicializar simulador con vuelos activos
    if (activeFlights.length > 0) {
      flightSimulator.clear();
      flightSimulator.initializeFlights(activeFlights);
      // El simulador se iniciará automáticamente desde el componente
      console.log('📊 Vuelos listos para simulación en mapa');
    }
    
    return {
      data: activeFlights,
      pagination: {
        limit: activeFlights.length,
        offset: 0,
        count: activeFlights.length,
        total: activeFlights.length
      },
      fromStorage: allFlightsResponse.fromStorage,
      source: 'aviationstack-adapted'
    };
  },


  // Busca un vuelo específico por número
  async searchFlight(flightNumber) {
    try {
      const allFlights = await this.getAllFlights();
      const searchTerm = flightNumber.toUpperCase().trim();
      
      console.log('🔍 Buscando vuelo:', searchTerm);
      console.log('📊 Total vuelos disponibles:', allFlights.data.length);

      const filtered = allFlights.data.filter(flight => {
        const flightIata = (flight.flight?.iata || '').toUpperCase();
        const flightIcao = (flight.flight?.icao || '').toUpperCase();
        const flightNum = (flight.flightNumber || '').toUpperCase();

        return flightIata.includes(searchTerm) || 
               flightIcao.includes(searchTerm) || 
               flightNum.includes(searchTerm);
      });
      
      console.log('✅ Vuelos encontrados:', filtered.length);

      return { data: filtered, fromStorage: false };

    } catch (error) {
      console.error('❌ Error en búsqueda:', error.message);
      return { data: [], fromStorage: false, error: error.message };
    }
  },

  // Obtiene vuelos por aeropuerto (salida o llegada)
  async getFlightsByAirport(airportCode, type = 'departure') {
    try {
      const allFlights = await this.getAllFlights();
      const searchTerm = airportCode.toUpperCase().trim();
      
      const filtered = allFlights.data.filter(flight => {
        const departureIata = (flight.departure?.iata || '').toUpperCase();
        const arrivalIata = (flight.arrival?.iata || '').toUpperCase();
        const departureCity = (flight.departure?.city || '').toUpperCase();
        const arrivalCity = (flight.arrival?.city || '').toUpperCase();
        const departureAirport = (flight.departure?.airport || '').toUpperCase();
        const arrivalAirport = (flight.arrival?.airport || '').toUpperCase();
        
        if (type === 'departure') {
          return departureIata.includes(searchTerm) || 
                 departureCity.includes(searchTerm) ||
                 departureAirport.includes(searchTerm);
        } else if (type === 'arrival') {
          return arrivalIata.includes(searchTerm) || 
                 arrivalCity.includes(searchTerm) ||
                 arrivalAirport.includes(searchTerm);
        } else {
          return departureIata.includes(searchTerm) || 
                 arrivalIata.includes(searchTerm) ||
                 departureCity.includes(searchTerm) ||
                 arrivalCity.includes(searchTerm) ||
                 departureAirport.includes(searchTerm) ||
                 arrivalAirport.includes(searchTerm);
        }
      });
      
      return { data: filtered, fromStorage: false };
    } catch (error) {
      console.error('❌ Error buscando por aeropuerto:', error.message);
      return { data: [], fromStorage: false, error: error.message };
    }
  },

  // Selecciona vuelos aleatorios de una lista
  _selectRandomFlights(flights, count) {
    const shuffled = [...flights].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  // Adapta vuelos reales para que parezcan de hoy (mantiene datos reales, solo cambia fechas)
  _adaptFlightsToToday(flights) {
    const now = new Date();
    const adapted = [];
    
    // Distribuir: 40% activos, 30% programados, 30% finalizados
    const totalFlights = flights.length;
    const numActive = Math.ceil(totalFlights * 0.4);
    const numScheduled = Math.ceil(totalFlights * 0.3);
    
    flights.forEach((flight, index) => {
      // Normalizar estructura de vuelo
      const normalizedFlight = {
        id: flight.flight_date + '_' + flight.flight.iata,
        flightNumber: flight.flight.iata,
        flight: {
          iata: flight.flight.iata,
          icao: flight.flight.icao,
          number: flight.flight.number
        },
        airline: {
          name: flight.airline.name,
          iata: flight.airline.iata,
          icao: flight.airline.icao
        },
        departure: {
          airport: typeof flight.departure.airport === 'string' 
            ? flight.departure.airport 
            : flight.departure.airport?.name || flight.departure.iata,
          iata: flight.departure.iata,
          icao: flight.departure.icao,
          timezone: flight.departure.timezone,
          city: flight.departure.city
        },
        arrival: {
          airport: typeof flight.arrival.airport === 'string' 
            ? flight.arrival.airport 
            : flight.arrival.airport?.name || flight.arrival.iata,
          iata: flight.arrival.iata,
          icao: flight.arrival.icao,
          timezone: flight.arrival.timezone,
          city: flight.arrival.city
        },
        aircraft: flight.aircraft
      };
      
      // Calcular duración real del vuelo basada en aeropuertos
      const originCoords = getAirportCoordinates(flight.departure.iata);
      const destCoords = getAirportCoordinates(flight.arrival.iata);
      const flightDurationHours = this._calculateFlightDuration(originCoords, destCoords);
      
      if (index < numActive) {
        // VUELOS ACTIVOS: Despegaron hace 20%-80% de su duración, llegarán en el resto
        normalizedFlight.flight_status = 'active';
        normalizedFlight.flight_status_label = 'En Vuelo';
        
        const progress = 0.2 + Math.random() * 0.6; // 20%-80% completado
        const elapsedHours = flightDurationHours * progress;
        const remainingHours = flightDurationHours * (1 - progress);
        
        normalizedFlight.departure.scheduled = new Date(now.getTime() - elapsedHours * 3600000).toISOString();
        normalizedFlight.departure.actual = normalizedFlight.departure.scheduled;
        normalizedFlight.departure.scheduledTime = normalizedFlight.departure.scheduled;
        
        normalizedFlight.arrival.estimated = new Date(now.getTime() + remainingHours * 3600000).toISOString();
        normalizedFlight.arrival.scheduled = normalizedFlight.arrival.estimated;
        normalizedFlight.arrival.estimatedTime = normalizedFlight.arrival.estimated;
        
        // Crear datos GPS para simulación
        normalizedFlight.live = this._createLiveData(
          originCoords,
          destCoords,
          progress,
          flight.departure.iata,
          flight.arrival.iata
        );
        
        console.log(`  ✈️ ${normalizedFlight.flightNumber}: ${flight.departure.iata} → ${flight.arrival.iata} | Progreso: ${(progress*100).toFixed(0)}% | En vuelo`);
        
      } else if (index < numActive + numScheduled) {
        // VUELOS PROGRAMADOS: Despegan en 1-5 horas
        normalizedFlight.flight_status = 'scheduled';
        normalizedFlight.flight_status_label = 'Programado';
        
        const hoursAhead = 1 + Math.random() * 4; // 1-5 horas
        
        normalizedFlight.departure.scheduled = new Date(now.getTime() + hoursAhead * 3600000).toISOString();
        normalizedFlight.departure.estimated = normalizedFlight.departure.scheduled;
        normalizedFlight.departure.scheduledTime = normalizedFlight.departure.scheduled;
        
        normalizedFlight.arrival.scheduled = new Date(now.getTime() + (hoursAhead + flightDurationHours) * 3600000).toISOString();
        normalizedFlight.arrival.estimated = normalizedFlight.arrival.scheduled;
        normalizedFlight.arrival.estimatedTime = normalizedFlight.arrival.scheduled;
        
        normalizedFlight.live = null; // Programados no tienen GPS
        
        console.log(`  🕐 ${normalizedFlight.flightNumber}: ${flight.departure.iata} → ${flight.arrival.iata} | Despega en ${hoursAhead.toFixed(1)}h`);
        
      } else {
        // VUELOS FINALIZADOS: Aterrizaron hace 1-6 horas
        normalizedFlight.flight_status = 'landed';
        normalizedFlight.flight_status_label = 'Aterrizado';
        
        const hoursAgo = 1 + Math.random() * 5; // 1-6 horas
        
        normalizedFlight.arrival.actual = new Date(now.getTime() - hoursAgo * 3600000).toISOString();
        normalizedFlight.arrival.scheduled = normalizedFlight.arrival.actual;
        normalizedFlight.arrival.estimatedTime = normalizedFlight.arrival.actual;
        
        normalizedFlight.departure.actual = new Date(now.getTime() - (hoursAgo + flightDurationHours) * 3600000).toISOString();
        normalizedFlight.departure.scheduled = normalizedFlight.departure.actual;
        normalizedFlight.departure.scheduledTime = normalizedFlight.departure.actual;
        
        normalizedFlight.live = null; // Aterrizados no tienen GPS
        
        console.log(`  ✅ ${normalizedFlight.flightNumber}: ${flight.departure.iata} → ${flight.arrival.iata} | Aterrizó hace ${hoursAgo.toFixed(1)}h`);
      }
      
      adapted.push(normalizedFlight);
    });
    
    return adapted;
  },

  // Calcula duración estimada de vuelo basada en distancia (Haversine)
  _calculateFlightDuration(originCoords, destCoords) {
    if (!originCoords || !destCoords) {
      return 2 + Math.random() * 3; // 2-5 horas por defecto
    }
    
    // Calcular distancia en km usando fórmula de Haversine
    const R = 6371; // Radio de la Tierra en km
    const dLat = (destCoords.lat - originCoords.lat) * Math.PI / 180;
    const dLon = (destCoords.lng - originCoords.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(originCoords.lat * Math.PI / 180) * 
              Math.cos(destCoords.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Velocidad promedio de crucero: 800 km/h
    const duration = distance / 800;
    
    return Math.max(0.5, duration); // Mínimo 30 minutos
  },

  // Crea datos GPS simulados basados en progreso del vuelo
  _createLiveData(originCoords, destCoords, progress, originIata, destIata) {
    if (!originCoords || !destCoords) {
      // Si no tenemos coordenadas, usar ubicación aleatoria en Europa
      return {
        latitude: 40 + Math.random() * 25,
        longitude: -10 + Math.random() * 40,
        altitude: 30000 + Math.random() * 12000,
        speed: 450 + Math.random() * 150,
        speed_horizontal: 450 + Math.random() * 150,
        speed_vertical: (Math.random() - 0.5) * 10,
        direction: Math.random() * 360,
        is_ground: false,
        updated: new Date().toISOString()
      };
    }
    
    // Calcular posición actual basada en progreso
    const latitude = originCoords.lat + (destCoords.lat - originCoords.lat) * progress;
    const longitude = originCoords.lng + (destCoords.lng - originCoords.lng) * progress;
    
    // Calcular dirección hacia el destino
    const deltaLat = destCoords.lat - latitude;
    const deltaLng = destCoords.lng - longitude;
    const direction = (Math.atan2(deltaLng, deltaLat) * 180 / Math.PI + 360) % 360;
    
    return {
      latitude,
      longitude,
      altitude: 30000 + Math.random() * 12000, // 30k-42k pies
      speed: 450 + Math.random() * 150, // 450-600 km/h
      speed_horizontal: 450 + Math.random() * 150,
      speed_vertical: (Math.random() - 0.5) * 10,
      direction,
      is_ground: false,
      updated: new Date().toISOString()
    };
  },


  // Respuesta vacía estándar
  _emptyResponse(errorMessage = null) {
    return { 
      data: [], 
      pagination: { limit: 0, offset: 0, count: 0, total: 0 }, 
      fromCache: false,
      error: errorMessage
    };
  },

  // Maneja errores de la API
  _handleError(error) {
    console.error('❌ Error API:', error.message);

    if (error.response?.status === 429) {
      console.error('🚫 LÍMITE API EXCEDIDO (100 solicitudes/mes)');
      return {
        data: [],
        pagination: { limit: 0, offset: 0, count: 0, total: 0 },
        fromStorage: false,
        error: '🚫 LÍMITE API ALCANZADO (100/mes). El límite se resetea cada mes.'
      };
    }

    return {
      data: [],
      pagination: { limit: 0, offset: 0, count: 0, total: 0 },
      fromStorage: false,
      error: `❌ Error: ${error.message}`
    };
  },

  // Guarda vuelos en sessionStorage
  _saveToStorage(result) {
    try {
      const dataToStore = {
        data: result.data,
        timestamp: Date.now(),
        source: result.source
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.warn('⚠️ No se pudo guardar en sessionStorage:', error.message);
    }
  },

  // Carga vuelos desde sessionStorage
  _loadFromStorage() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      
      // Verificar que tenga datos válidos
      if (!parsed.data || !Array.isArray(parsed.data) || parsed.data.length === 0) {
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn('⚠️ Error cargando desde sessionStorage:', error.message);
      return null;
    }
  },

  // Actualiza estados de vuelos según la hora actual
  _updateFlightStates(flights) {
    const now = Date.now();
    
    return flights.map(flight => {
      const departureTime = new Date(flight.departure.scheduled).getTime();
      const arrivalTime = new Date(flight.arrival.estimated || flight.arrival.scheduled).getTime();
      
      // Determinar estado actual según la hora
      let newStatus = flight.flight_status;
      
      if (now >= arrivalTime) {
        // Ya pasó la hora de llegada → finalizado
        newStatus = 'landed';
      } else if (now >= departureTime && now < arrivalTime) {
        // Entre salida y llegada → en vuelo
        newStatus = 'active';
      } else {
        // Antes de la salida → programado
        newStatus = 'scheduled';
      }
      
      // Si cambió el estado, actualizar
      if (newStatus !== flight.flight_status) {
        console.log(`🔄 ${flight.flightNumber}: ${flight.flight_status} → ${newStatus}`);
        return {
          ...flight,
          flight_status: newStatus
        };
      }
      
      return flight;
    });
  },

  // Limpia sessionStorage
  clearStorage() {
    sessionStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ SessionStorage limpiado - Próxima carga obtendrá vuelos europeos nuevos');
  }
};
