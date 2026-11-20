import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plane } from 'lucide-react';

import { flightSimulator } from '../../services/flightSimulator';
import { useScrollLock } from '../../hooks';
import TargetCursor from '../TargetCursor/TargetCursor';

// Sub-componentes extraídos
import FlightMarker from './FlightMarker';
import FlightsPanel from './FlightsPanel';
import { MapController, MapClickHandler, MAP_CONFIG, getMapTilerUrl } from './MapHelpers';

import styles from './RealTimeMap.module.css';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/** Intervalo de actualización en ms */
const UPDATE_INTERVAL = 2000;

// Mapa en tiempo real con vuelos activos, marcadores animados y panel lateral
const RealTimeMap = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [followingFlight, setFollowingFlight] = useState(null);
  
  const mapRef = useRef(null);
  const followIntervalRef = useRef(null);

  // Hook para bloquear scroll del body
  useScrollLock(true);

  // Carga vuelos iniciales del simulador
  const loadInitialFlights = useCallback(async () => {
    try {
      setLoading(true);
      const allFlights = flightSimulator.getAllFlights();
      const activeSimulatedFlights = allFlights.filter(
        f => f.live && f.live.latitude && f.live.longitude
      );
      setFlights(activeSimulatedFlights);
    } catch (err) {
      console.error('❌ Error loading flights:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Centra el mapa en un vuelo específico
  const centerMapOnFlight = useCallback((flight, zoom = 8) => {
    if (!mapRef.current || !flight?.live) return;
    
    const lat = Number(flight.live.latitude);
    const lng = Number(flight.live.longitude);
    
    if (isNaN(lat) || isNaN(lng)) return;
    
    mapRef.current.setView([lat, lng], zoom, {
      animate: true,
      duration: 0.8
    });
  }, []);

  // Mueve el cursor visual al avión
  const moveCursorToFlight = useCallback((flight) => {
    const flightId = flight.id || flight.flightNumber;
    const planeMarker = document.querySelector(`[data-flight-id="${flightId}"]`);
    
    if (planeMarker) {
      const rect = planeMarker.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      window.dispatchEvent(new CustomEvent('move-cursor-to', {
        detail: { x: centerX, y: centerY }
      }));
    }
  }, []);

  // Efecto principal: carga inicial y actualización periódica
  useEffect(() => {
    loadInitialFlights();
    
    // Handler para lock de cursor en aviones
    const handlePlaneLock = (event) => {
      const planeElement = event.detail.target;
      if (!planeElement) return;
      
      const allFlights = flightSimulator.getAllFlights().filter(f => f.live);
      const flightId = planeElement.getAttribute('data-flight-id');
      
      if (flightId) {
        const flight = allFlights.find(f => 
          f.id === flightId || 
          f.flightNumber === flightId ||
          `flight-${allFlights.indexOf(f)}` === flightId
        );
        
        if (flight) {
          console.log('🎯 Cursor locked en avión:', flight.flightNumber);
          setFollowingFlight(flight);
          setSelectedFlight(flight);
          centerMapOnFlight(flight);
        }
      }
    };
    
    window.addEventListener('plane-lock', handlePlaneLock);
    
    // Intervalo de actualización
    const intervalId = setInterval(() => {
      const updatedFlights = flightSimulator.getAllFlights().filter(f => f.live);
      setFlights(updatedFlights);
      
      // Actualizar posición si estamos siguiendo un vuelo
      if (followingFlight && mapRef.current) {
        const currentFlight = updatedFlights.find(f => 
          (f.id || f.flightNumber) === (followingFlight.id || followingFlight.flightNumber)
        );
        
        if (currentFlight?.live) {
          const lat = currentFlight.live.latitude;
          const lng = currentFlight.live.longitude;
          
          if (!isNaN(lat) && !isNaN(lng)) {
            mapRef.current.setView([lat, lng], mapRef.current.getZoom(), {
              animate: true,
              duration: 0.5
            });
            
            setTimeout(() => moveCursorToFlight(currentFlight), 100);
          }
        }
      }
    }, UPDATE_INTERVAL);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('plane-lock', handlePlaneLock);
      if (followIntervalRef.current) {
        clearInterval(followIntervalRef.current);
      }
    };
  }, [followingFlight, loadInitialFlights, centerMapOnFlight, moveCursorToFlight]);

  // Handler para click en marcador de vuelo
  const handleFlightMarkerClick = useCallback((flight) => {
    setSelectedFlight(flight);
  }, []);

  // Handler para click en item de la lista
  const handleFlightListClick = useCallback((flight, lat, lng) => {
    console.log('🎯 Click en tarjeta:', flight.flightNumber || flight.flight?.iata);
    
    setFollowingFlight(flight);
    setSelectedFlight(flight);
    
    if (mapRef.current && !isNaN(lat) && !isNaN(lng)) {
      console.log('✈️ Iniciando seguimiento del vuelo en:', [lat, lng]);
      mapRef.current.setView([lat, lng], 8, {
        animate: true,
        duration: 0.8
      });
    }
  }, []);

  // Handler para click en el mapa (detiene seguimiento)
  const handleMapClick = useCallback(() => {
    console.log('🛑 Deteniendo seguimiento del avión');
    setFollowingFlight(null);
  }, []);

  // Estado de carga
  if (loading && flights.length === 0) {
    return (
      <div className={styles.realtimeMapContainer}>
        <div className={styles.mapLoading}>
          <Plane size={48} className={styles.spinningPlane} />
          <p>Cargando vuelos en tiempo real...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.realtimeMapContainer}>
      <TargetCursor 
        targetSelector=".cursor-target"
        radarEffect={true}
        enableSpin={true}
      />

      <div className={styles.mapWrapper}>
        <MapContainer
          center={MAP_CONFIG.center}
          zoom={MAP_CONFIG.zoom}
          minZoom={MAP_CONFIG.minZoom}
          maxZoom={MAP_CONFIG.maxZoom}
          maxBounds={MAP_CONFIG.maxBounds}
          maxBoundsViscosity={MAP_CONFIG.maxBoundsViscosity}
          zoomSnap={MAP_CONFIG.zoomSnap}
          zoomDelta={MAP_CONFIG.zoomDelta}
          style={{ height: '100%', width: '100%', background: '#000000' }}
          zoomControl={false}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
        >
          <MapClickHandler onMapClick={handleMapClick} />
          
          <TileLayer
            attribution=''
            url={getMapTilerUrl(import.meta.env.VITE_MAPTILER_API_KEY)}
            tileSize={512}
            zoomOffset={-1}
          />
          
          <MapController mapRef={mapRef} />
          
          {flights.map((flight, index) => (
            <FlightMarker
              key={flight.id || flight.flightNumber || `flight-${index}`}
              flight={flight}
              index={index}
              onClick={handleFlightMarkerClick}
            />
          ))}
        </MapContainer>
        
        <FlightsPanel
          flights={flights}
          followingFlight={followingFlight}
          onFlightClick={handleFlightListClick}
        />
      </div>
    </div>
  );
};

export default RealTimeMap;
