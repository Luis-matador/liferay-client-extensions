import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

// Componente para mantener referencia al mapa
export const MapController = ({ mapRef }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);
  
  return null;
};

// Componente para manejar eventos de click en el mapa
export const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: () => {
      console.log('🛑 Click detectado en el mapa');
      onMapClick();
    }
  });
  
  return null;
};

// Configuración del mapa por defecto
export const MAP_CONFIG = {
  center: [55.0, 15.0], // Centro de Europa
  zoom: 4,
  minZoom: 3,
  maxZoom: 10,
  maxBounds: [
    [35.0, -15.0], // Esquina suroeste
    [72.0, 40.0]   // Esquina noreste
  ],
  maxBoundsViscosity: 1.0,
  zoomSnap: 0.5,
  zoomDelta: 0.5
};

// URL del tile layer: MapTiler (satélite) si hay clave en .env (VITE_MAPTILER_API_KEY);
// si no, mapa estándar de OpenStreetMap, que no necesita clave
export const getMapTilerUrl = (apiKey) => {
  if (!apiKey) {
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }
  return `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${apiKey}`;
};
