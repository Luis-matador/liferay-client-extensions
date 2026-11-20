// Servicio de vuelos comerciales futuros (Amadeus API)

import axios from 'axios';

const FLIGHT_OFFERS_CONFIG = {
  // Amadeus for Developers API (2000 req/mes gratuitas)
  AUTH_URL: 'https://test.api.amadeus.com/v1/security/oauth2/token',
  BASE_URL: 'https://test.api.amadeus.com/v2',
  // Credenciales solo desde .env (VITE_AMADEUS_CLIENT_ID / VITE_AMADEUS_CLIENT_SECRET)
  CLIENT_ID: import.meta.env.VITE_AMADEUS_CLIENT_ID || '',
  CLIENT_SECRET: import.meta.env.VITE_AMADEUS_CLIENT_SECRET || '',
  CACHE_DURATION_HOURS: 12, // Caché más largo para evitar tantas llamadas
  DELAY_BETWEEN_CALLS_MS: 0 // Sin espera - Amadeus test permite 10 req/s
};

class CommercialFlightService {
  constructor() {
    this.cache = new Map();
    this.lastCallTime = 0;
    this.accessToken = null;
    this.tokenExpiry = 0;
  }

  // Obtiene token de acceso de Amadeus
  async _getAccessToken() {
    const now = Date.now();
    
    // Reutilizar token si no ha expirado
    if (this.accessToken && this.tokenExpiry > now) {
      return this.accessToken;
    }

    console.log('🔐 Obteniendo token de Amadeus...');

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', FLIGHT_OFFERS_CONFIG.CLIENT_ID);
      params.append('client_secret', FLIGHT_OFFERS_CONFIG.CLIENT_SECRET);

      const response = await axios.post(
        FLIGHT_OFFERS_CONFIG.AUTH_URL,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token expira en ~1800 segundos, renovar 5 min antes
      this.tokenExpiry = now + (response.data.expires_in - 300) * 1000;
      
      console.log('✅ Token de Amadeus obtenido');
      return this.accessToken;

    } catch (error) {
      console.error('❌ Error obteniendo token de Amadeus:', error.message);
      throw new Error('No se pudo autenticar con Amadeus API');
    }
  }

  // Obtiene datos de caché de sessionStorage
  _getCachedData(key) {
    try {
      const cached = sessionStorage.getItem(`flight_cache_${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const cacheAge = now - timestamp;
      const maxAge = FLIGHT_OFFERS_CONFIG.CACHE_DURATION_HOURS * 60 * 60 * 1000;

      if (cacheAge < maxAge) {
        console.log(`✅ Usando caché (${Math.round(cacheAge / 60000)} min antiguo)`);
        return data;
      } else {
        sessionStorage.removeItem(`flight_cache_${key}`);
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  // Guarda en caché
  _setCachedData(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(`flight_cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('⚠️ No se pudo guardar en caché:', error.message);
    }
  }

  // Espera para respetar rate limit
  async _waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    const minDelay = FLIGHT_OFFERS_CONFIG.DELAY_BETWEEN_CALLS_MS;

    if (timeSinceLastCall < minDelay) {
      const waitTime = minDelay - timeSinceLastCall;
      console.log(`⏳ Esperando ${waitTime}ms para respetar rate limit...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastCallTime = Date.now();
  }

  // Añade días a una fecha (formato YYYY-MM-DD)
  _addDays(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  // Busca vuelos comerciales
  async searchFlights(searchParams) {
    const { origin = null, destination = null, departureDate = null, adults = 1 } = searchParams;

    console.log('🔍 Buscando vuelos comerciales:', searchParams);

    try {
      // Si no hay origen ni destino, devolver vuelos destacados
      if (!origin && !destination) {
        return await this.getFeaturedFlights();
      }
      
      // Si hay búsqueda específica, usar la función de búsqueda
      return await this._searchAmadeusFlights(searchParams);
    } catch (error) {
      console.error('❌ Error buscando vuelos:', error);
      return { 
        data: [], 
        count: 0, 
        error: 'Error al buscar vuelos. Por favor, inténtalo de nuevo.' 
      };
    }
  }

  // Obtiene vuelos destacados (rutas aleatorias con caché y throttling)
  async getFeaturedFlights(forceRefresh = false) {
    console.log('⭐ Obteniendo vuelos destacados desde Amadeus API...');

    // Verificar caché primero (si no es refresh forzado)
    const cacheKey = 'featured_flights';
    const cached = this._getCachedData(cacheKey);
    
    if (!forceRefresh && cached && cached.source === 'amadeus-api') {
      return cached;
    }

    // Limpiar caché viejo de Kiwi.com si existe
    if (cached && cached.source !== 'amadeus-api') {
      sessionStorage.removeItem(`flight_cache_${cacheKey}`);
      console.log('🧹 Limpiado caché obsoleto de Kiwi.com');
    }

    try {
      const today = new Date();
      const daysAhead = 7;
      
      // Aeropuertos principales de Europa
      const majorAirports = ['MAD', 'BCN', 'LHR', 'CDG', 'FRA', 'AMS', 'FCO', 'MUC', 'LIS', 'VIE', 'ZRH', 'DUB', 'BRU', 'CPH', 'ARN'];
      
      // Generar TODAS las combinaciones posibles
      const allCombinations = [];
      for (let i = 0; i < majorAirports.length; i++) {
        for (let j = 0; j < majorAirports.length; j++) {
          if (i !== j) {
            allCombinations.push({
              origin: majorAirports[i],
              destination: majorAirports[j]
            });
          }
        }
      }
      
      // Mezclar aleatoriamente para máxima diversidad
      const shuffled = allCombinations.sort(() => Math.random() - 0.5);
      
      // Tomar las primeras 20 rutas aleatorias con fechas variadas
      const routes = shuffled.slice(0, 20).map((route, index) => {
        const dayOffset = Math.floor(index / 7); // 0, 1, 2 (3 fechas diferentes)
        const departureDate = new Date(today);
        departureDate.setDate(departureDate.getDate() + daysAhead + dayOffset);
        return {
          ...route,
          date: departureDate.toISOString().split('T')[0]
        };
      });

      const allFlights = [];
      const seenFlightKeys = new Set();

      // Hacer llamadas en LOTES de 5 para no saturar la API (10 era demasiado)
      const BATCH_SIZE = 5;
      console.log(`📊 Buscando en ${routes.length} rutas (lotes de ${BATCH_SIZE})...`);
      
      for (let i = 0; i < routes.length; i += BATCH_SIZE) {
        const batch = routes.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(routes.length / BATCH_SIZE);
        
        console.log(`🔄 Procesando lote ${batchNumber}/${totalBatches} (${batch.length} rutas)...`);
        
        const batchPromises = batch.map(route => 
          this.searchFlights({
            origin: route.origin,
            destination: route.destination,
            departureDate: route.date,
            adults: 1
          })
          .then(result => {
            if (result.data && result.data.length > 0) {
              const cheapest = result.data[0];
              const key = `${cheapest.origin.iata}-${cheapest.destination.iata}-${cheapest.departure.date}`;
              
              if (!seenFlightKeys.has(key)) {
                seenFlightKeys.add(key);
                console.log(`✅ ${route.origin}→${route.destination}: ${cheapest.prices.economy}€`);
                return cheapest;
              }
            }
            return null;
          })
          .catch(error => {
            console.warn(`⚠️ ${route.origin}→${route.destination}: ${error.message}`);
            return null;
          })
        );

        // Esperar que termine este lote
        const batchResults = await Promise.all(batchPromises);
        allFlights.push(...batchResults.filter(f => f !== null));
        
        // Pausa de 1 segundo entre lotes (reducido de 2s)
        if (i + BATCH_SIZE < routes.length) {
          console.log(`⏳ Esperando 1 segundo antes del siguiente lote...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Limitar a 20 vuelos
      allFlights.splice(20);

      console.log(`✅ ${allFlights.length} vuelos cargados en lotes`);

      const result = {
        data: allFlights,
        count: allFlights.length,
        source: 'amadeus-api'
      };

      // Guardar en caché
      this._setCachedData(cacheKey, result);

      return result;
    } catch (error) {
      console.error('❌ Error obteniendo vuelos destacados:', error);
      return { data: [], count: 0, error: error.message };
    }
  }

  // Busca vuelos en Amadeus API (con caché y throttling)
  async _searchAmadeusFlights(searchParams) {
    const { origin, destination, departureDate, adults = 1 } = searchParams;

    if (!origin) throw new Error('Se requiere aeropuerto de origen');
    if (!destination) throw new Error('Se requiere aeropuerto de destino');
    if (!departureDate) throw new Error('Se requiere fecha de salida');

    // Verificar caché primero
    const cacheKey = `${origin}_${destination}_${departureDate}_${adults}`;
    const cached = this._getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    console.log(`📡 Consultando Amadeus: ${origin} → ${destination} el ${departureDate}`);

    // Esperar antes de la llamada
    await this._waitForRateLimit();

    try {
      // Obtener token de acceso
      const token = await this._getAccessToken();

      const response = await axios.get(`${FLIGHT_OFFERS_CONFIG.BASE_URL}/shopping/flight-offers`, {
        params: {
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: departureDate,
          adults: adults,
          currencyCode: 'EUR',
          max: 20
        },
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 15000
      });

      console.log('✅ Respuesta de Amadeus recibida');
      const result = this._normalizeAmadeusResponse(response.data);

      // Guardar en caché
      this._setCachedData(cacheKey, result);

      return result;

    } catch (error) {
      console.error('❌ Error llamando a Amadeus API:', error.message);
      console.error('📋 Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (error.response?.status === 429) {
        throw new Error('Límite de llamadas API excedido. Espera un momento e intenta de nuevo.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Error de autenticación con Amadeus. Verifica las credenciales.');
      }

      throw new Error('Error al buscar vuelos: ' + error.message);
    }
  }

  // Normaliza respuesta de Amadeus al formato de la app
  _normalizeAmadeusResponse(data) {
    if (!data || !data.data || data.data.length === 0) {
      console.warn('⚠️ No hay vuelos disponibles en Amadeus');
      return { data: [], count: 0 };
    }

    const seenIds = new Set();
    let globalIndex = 0;
    
    const flights = data.data
      .map((offer) => {
        // Amadeus puede tener múltiples segmentos (escalas)
        const firstSegment = offer.itineraries[0].segments[0];
        const lastSegment = offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1];
        const numSegments = offer.itineraries[0].segments.length;
        
        const departure = new Date(firstSegment.departure.at);
        const arrival = new Date(lastSegment.arrival.at);
        
        // Duración REAL calculada
        const durationMinutes = Math.floor((arrival - departure) / 1000 / 60);
        
        // Filtrar solo vuelos absurdamente largos (>24h = error de datos)
        if (durationMinutes > 1440) {
          console.warn(`⚠️ Vuelo descartado: ${firstSegment.departure.iataCode}-${lastSegment.arrival.iataCode} (>24h es error de datos)`);
          return null;
        }

        // ID único global (timestamp + contador)
        const uniqueId = `AMADEUS-${Date.now()}-${globalIndex++}`;
        if (seenIds.has(uniqueId)) {
          return null;
        }
        seenIds.add(uniqueId);

        const basePrice = parseFloat(offer.price.total);
        const hasStops = numSegments > 1;

        return {
          id: uniqueId,
          flightNumber: firstSegment.number,
          flightIATA: `${firstSegment.carrierCode}${firstSegment.number}`,
          airline: {
            iata: firstSegment.carrierCode,
            name: data.dictionaries?.carriers?.[firstSegment.carrierCode] || firstSegment.carrierCode
          },
          origin: {
            iata: firstSegment.departure.iataCode,
            city: data.dictionaries?.locations?.[firstSegment.departure.iataCode]?.cityCode || firstSegment.departure.iataCode,
            country: data.dictionaries?.locations?.[firstSegment.departure.iataCode]?.countryCode || '',
            airport: firstSegment.departure.iataCode
          },
          destination: {
            iata: lastSegment.arrival.iataCode,
            city: data.dictionaries?.locations?.[lastSegment.arrival.iataCode]?.cityCode || lastSegment.arrival.iataCode,
            country: data.dictionaries?.locations?.[lastSegment.arrival.iataCode]?.countryCode || '',
            airport: lastSegment.arrival.iataCode
          },
          departure: {
            date: departure.toISOString().split('T')[0],
            time: departure.toTimeString().substring(0, 5),
            dateTime: departure.toISOString()
          },
          arrival: {
            date: arrival.toISOString().split('T')[0],
            time: arrival.toTimeString().substring(0, 5),
            dateTime: arrival.toISOString()
          },
          duration: {
            minutes: durationMinutes,
            hours: Math.floor(durationMinutes / 60),
            formatted: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
          },
          prices: {
            economy: basePrice,
            business: basePrice * 2.5,
            first: basePrice * 4
          },
          availableSeats: {
            economy: parseInt(offer.numberOfBookableSeats) || 9,
            business: Math.floor((parseInt(offer.numberOfBookableSeats) || 9) / 3),
            first: Math.floor((parseInt(offer.numberOfBookableSeats) || 9) / 5)
          },
          stops: numSegments - 1,
          hasStops: hasStops,
          currency: offer.price.currency || 'EUR',
          bookable: true,
          validatingAirline: offer.validatingAirlineCodes?.[0] || firstSegment.carrierCode
        };
      })
      .filter(f => f !== null);

    console.log(`✅ ${flights.length} vuelos de Amadeus normalizados (sin duplicados)`);

    return {
      data: flights,
      count: flights.length,
      source: 'amadeus-api'
    };
  }

  // Normaliza respuesta de Kiwi.com al formato de la app (compatibilidad)
  _normalizeKiwiResponse(data) {
    if (!data || !data.data || data.data.length === 0) {
      console.warn('⚠️ No hay datos en la respuesta de Kiwi.com');
      return { data: [], count: 0 };
    }

    const flights = data.data.map((flight, index) => {
      const route = flight.route && flight.route.length > 0 ? flight.route[0] : null;
      
      if (!route) {
        console.warn('⚠️ Vuelo sin información de ruta:', flight);
        return null;
      }

      const departure = new Date(route.local_departure || route.utc_departure);
      const arrival = new Date(route.local_arrival || route.utc_arrival);
      const durationMinutes = Math.floor((arrival - departure) / 1000 / 60);

      return {
        id: `KIWI-${flight.id || index}`,
        flightNumber: route.flight_no || Math.floor(1000 + Math.random() * 8000),
        flightIATA: `${route.airline || 'XX'}${route.flight_no || Math.floor(1000 + Math.random() * 8000)}`,
        airline: {
          iata: route.airline || 'XX',
          name: flight.airlines?.[0] || route.airline || 'Aerolínea'
        },
        origin: {
          iata: route.flyFrom || flight.flyFrom || 'XXX',
          city: route.cityFrom || flight.cityFrom || 'Ciudad',
          country: route.countryFrom?.name || flight.countryFrom?.name || 'País',
          airport: route.flyFrom || flight.flyFrom || 'Aeropuerto'
        },
        destination: {
          iata: route.flyTo || flight.flyTo || 'YYY',
          city: route.cityTo || flight.cityTo || 'Ciudad',
          country: route.countryTo?.name || flight.countryTo?.name || 'País',
          airport: route.flyTo || flight.flyTo || 'Aeropuerto'
        },
        departure: {
          date: departure.toISOString().split('T')[0],
          time: departure.toTimeString().substring(0, 5),
          dateTime: departure.toISOString()
        },
        arrival: {
          date: arrival.toISOString().split('T')[0],
          time: arrival.toTimeString().substring(0, 5),
          dateTime: arrival.toISOString()
        },
        duration: {
          minutes: durationMinutes,
          hours: Math.floor(durationMinutes / 60),
          formatted: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
        },
        prices: {
          economy: parseFloat(flight.price) || 100,
          business: parseFloat(flight.price * 2.5) || 250,
          first: parseFloat(flight.price * 4) || 400
        },
        availableSeats: {
          economy: flight.availability?.seats || 100,
          business: Math.floor((flight.availability?.seats || 100) / 3),
          first: Math.floor((flight.availability?.seats || 100) / 5)
        },
        currency: 'EUR',
        bookable: true
      };
    }).filter(f => f !== null);

    console.log(`✅ ${flights.length} vuelos normalizados`);

    return {
      data: flights,
      count: flights.length,
      source: 'kiwi-api'
    };
  }
}

export const commercialFlightService = new CommercialFlightService();
