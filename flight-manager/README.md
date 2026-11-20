# ✈️ Flight Manager - Liferay Client Extension

Sistema de gestión de vuelos integrado como Custom Element en Liferay DXP.

## 🎯 Vistas de la Aplicación

| Vista | Descripción |
|-------|-------------|
| **Dashboard** | Panel con 20 vuelos europeos, estadísticas en tiempo real y lista interactiva |
| **Mapa GPS** | Visualización de aviones sobre Europa con simulación de movimiento cada 2s |
| **Tienda** | Búsqueda de vuelos comerciales con precios reales (Amadeus API) |
| **Wallet** | Billetes comprados con opción de cancelación |
| **Búsqueda** | Filtrado rápido de vuelos por número, aerolínea o ruta |

## 🔌 APIs Integradas

- **AviationStack** - Datos de vuelos reales (100 req/mes gratis)
- **Amadeus** - Búsqueda de vuelos comerciales con precios (2000 req/mes gratis)
- **MapTiler** - Tiles de mapa híbrido (satélite + etiquetas)
- **Liferay Headless** - Persistencia de billetes en Custom Objects

## 🚀 Stack Tecnológico

- React 19.1 + Vite 7.1 (rolldown)
- Leaflet + React-Leaflet (mapas)
- CSS Modules + Framer Motion
- GSAP (animaciones complejas)

## ⚙️ Configuración

```env
# .env.local
VITE_AVIATION_API_KEY=tu_api_key
VITE_AMADEUS_CLIENT_ID=tu_client_id
VITE_AMADEUS_CLIENT_SECRET=tu_client_secret
VITE_MAPTILER_API_KEY=tu_api_key
VITE_USE_MOCK_FLIGHTS=true  # false para usar API real
```

## 📦 Comandos

```bash
npm install    # Instalar dependencias
npm run dev    # Desarrollo local (localhost:5173)
npm run build  # Build para producción
```

## 📁 Estructura del Proyecto

```
src/
├── components/     # 21 componentes React
├── hooks/          # 5 hooks personalizados
├── services/       # Servicios de API y simulador
├── constants/      # Constantes y configuración
├── config/         # Z-index, breakpoints
├── styles/         # Variables CSS globales
└── utils/          # Utilidades (formatters, status)
```

## 🎨 Características Técnicas

- ✅ Code splitting con React.lazy
- ✅ CSS Modules (sin !important)
- ✅ Hooks personalizados extraídos
- ✅ Web Component con cleanup correcto
- ✅ Cache en SessionStorage
- ✅ Simulador de vuelos GPS

## 🔧 Custom Object en Liferay

Crear objeto `FlightTicket` con campos:
- Datos de vuelo (IATA, aerolínea, ruta, horarios)
- Datos de pasajero (nombre, documento)
- Datos de compra (clase, asiento, precio, referencia)
- Estado (Picklist: confirmed, cancelled, pending)

---

