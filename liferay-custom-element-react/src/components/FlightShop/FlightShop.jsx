import { useState, useEffect } from 'react';
import { Plane, Calendar, MapPin, Search, TrendingUp, Clock, Euro, ShoppingCart, RefreshCw } from 'lucide-react';

import PurchaseTicketForm from '../PurchaseTicketForm/PurchaseTicketForm';
import FlightCard from './FlightCard';
import { commercialFlightService } from '../../services/commercialFlightService';
import { formatDate } from '../../utils/formatters';
import styles from './FlightShop.module.css';

const FlightShop = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    cabinClass: 'economy'
  });
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  useEffect(() => {
    loadFeaturedFlightsFromCache();
  }, []);

  const loadFeaturedFlightsFromCache = async () => {
    try {
      const cached = sessionStorage.getItem('flight_cache_featured_flights');
      if (cached) {
        const { data } = JSON.parse(cached);
        if (data && data.data) {
          setFlights(data.data || []);
          setLoading(false);
          console.log('✅ Vuelos cargados desde sessionStorage');
          return;
        }
      }
    } catch (error) {
      console.warn('⚠️ Error cargando caché:', error);
    }
    
    // Si no hay caché, hacer una llamada inicial a la API
    console.log('🔄 No hay caché - Cargando vuelos desde API...');
    await loadFeaturedFlights(true);
  };

  const loadFeaturedFlights = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const response = await commercialFlightService.getFeaturedFlights(forceRefresh);
      setFlights(response.data || []);
    } catch (error) {
      console.error('Error cargando vuelos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Si no hay ningún criterio de búsqueda, mostrar todos
      if (!searchParams.origin && !searchParams.destination && !searchParams.departureDate) {
        await loadFeaturedFlightsFromCache();
        return;
      }
      
      // Si hay criterios de búsqueda pero no son completos, filtrar localmente
      if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
        // Obtener todos los vuelos
        const allFlightsResponse = await commercialFlightService.getFeaturedFlights();
        const allFlights = allFlightsResponse.data || [];
        
        // Filtrar localmente
        const filtered = allFlights.filter(flight => {
          let matches = true;
          
          if (searchParams.origin && flight.origin.iata !== searchParams.origin.toUpperCase()) {
            matches = false;
          }
          
          if (searchParams.destination && flight.destination.iata !== searchParams.destination.toUpperCase()) {
            matches = false;
          }
          
          if (searchParams.departureDate && flight.departure.date !== searchParams.departureDate) {
            matches = false;
          }
          
          return matches;
        });
        
        setFlights(filtered);
        console.log(`🔍 Filtrados ${filtered.length} vuelos de ${allFlights.length} totales`);
        return;
      }
      
      // Búsqueda completa en la API
      const response = await commercialFlightService.searchFlights(searchParams);
      setFlights(response.data || []);
    } catch (error) {
      console.error('Error buscando vuelos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyFlight = (flight, selectedClass) => {
    // Adaptar formato del vuelo comercial al formato esperado por PurchaseTicketForm
    const flightForPurchase = {
      flight: {
        iata: flight.flightIATA,
        number: flight.flightNumber
      },
      airline: {
        name: flight.airline.name,
        iata: flight.airline.iata
      },
      departure: {
        airport: flight.origin.airport,
        iata: flight.origin.iata,
        city: flight.origin.city,
        scheduled: flight.departure.dateTime
      },
      arrival: {
        airport: flight.destination.airport,
        iata: flight.destination.iata,
        city: flight.destination.city,
        estimated: flight.arrival.dateTime,
        scheduled: flight.arrival.dateTime
      },
      // Datos adicionales para compra
      _commercialOffer: {
        selectedClass,
        price: flight.prices[selectedClass],
        availableSeats: flight.availableSeats[selectedClass]
      }
    };

    setSelectedFlight(flightForPurchase);
    setShowPurchaseForm(true);
  };

  const getMinPrice = (flight) => {
    return Math.min(flight.prices.economy, flight.prices.business, flight.prices.first);
  };

  // Obtener fecha mínima (hoy + 1 día)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading && flights.length === 0) {
    return (
      <div className={styles.flightShop}>
        <div className={styles.shopHeader}>
          <h1><ShoppingCart size={32} /> Comprar Billetes de Vuelo</h1>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando vuelos disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.flightShop}>
      <div className={styles.shopHeader}>
        <div className={styles.headerContent}>
          <div>
            <h1>
              <ShoppingCart size={32} />
              Comprar Billetes de Vuelo
            </h1>
            <p className={styles.headerSubtitle}>Vuelos comerciales futuros disponibles</p>
          </div>
          <button
            onClick={() => loadFeaturedFlights(true)}
            disabled={loading}
            className={styles.refreshButton}
          >
            <RefreshCw size={20} className={loading ? styles.spinning : ''} />
            <span>Actualizar Vuelos</span>
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className={styles.searchSection}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label>
                <MapPin size={18} />
                Origen (IATA)
              </label>
              <input
                type="text"
                placeholder="Ej: MAD, BCN, LHR..."
                value={searchParams.origin}
                onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value.toUpperCase() }))}
                maxLength={3}
              />
            </div>

            <div className={styles.formField}>
              <label>
                <MapPin size={18} />
                Destino (IATA)
              </label>
              <input
                type="text"
                placeholder="Ej: MAD, BCN, LHR..."
                value={searchParams.destination}
                onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value.toUpperCase() }))}
                maxLength={3}
              />
            </div>

            <div className={styles.formField}>
              <label>
                <Calendar size={18} />
                Fecha de Salida
              </label>
              <input
                type="date"
                value={searchParams.departureDate}
                onChange={(e) => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
                min={getMinDate()}
              />
            </div>

            <div className={styles.formField}>
              <label>
                <TrendingUp size={18} />
                Clase
              </label>
              <select
                value={searchParams.cabinClass}
                onChange={(e) => setSearchParams(prev => ({ ...prev, cabinClass: e.target.value }))}
              >
                <option value="economy">Turista</option>
                <option value="business">Business</option>
                <option value="first">Primera</option>
              </select>
            </div>
          </div>

          <div className={styles.searchActions}>
            <button type="submit" className={styles.btnSearch} disabled={loading}>
              <Search size={20} />
              {loading ? 'Buscando...' : 'Buscar Vuelos'}
            </button>
            <button 
              type="button" 
              className={styles.btnReset}
              onClick={() => {
                setSearchParams({ origin: '', destination: '', departureDate: '', cabinClass: 'economy' });
                loadFeaturedFlightsFromCache();
              }}
            >
              Ver Todos los Vuelos
            </button>
          </div>
        </form>
      </div>

      {/* Lista de vuelos */}
      <div className={styles.flightsList}>
        <div className={styles.listHeader}>
          <h2>{flights.length} vuelos disponibles</h2>
        </div>

        {flights.length === 0 ? (
          <div className={styles.emptyResults}>
            <Plane size={64} />
            <h3>No se encontraron vuelos</h3>
            <p>Intenta con otros criterios de búsqueda</p>
          </div>
        ) : (
          <div className={styles.flightsStacker}>
            {flights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onBuyClick={handleBuyFlight}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de compra */}
      {showPurchaseForm && selectedFlight && (
        <PurchaseTicketForm
          flight={selectedFlight}
          onClose={() => {
            setShowPurchaseForm(false);
            setSelectedFlight(null);
          }}
          onSuccess={() => {
            setShowPurchaseForm(false);
            setSelectedFlight(null);
            // El modal ya muestra el mensaje de éxito, no necesitamos alert adicional
          }}
        />
      )}
    </div>
  );
};

export default FlightShop;
