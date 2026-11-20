# Liferay DXP · Client Extensions

Dos Client Extensions de tipo *Custom Element* para Liferay DXP 7.4, desarrolladas como proyectos personales.

| Proyecto | Qué es | Stack |
| --- | --- | --- |
| [Flight Manager](liferay-custom-element-react) | Gestor de vuelos: panel con vuelos europeos, mapa en tiempo real, tienda de billetes con selección de asiento y cartera de billetes guardados en Custom Objects. | React 19, Vite, Leaflet, Framer Motion, GSAP |
| [Dashboard de cotizaciones](liferay-sample-custom-element-3) | Gestión del ciclo de vida de presupuestos comerciales (borrador, revisión, aprobación) con métricas, gráficas y tablero kanban. | Angular 18, TypeScript |

Ambas se integran con la **API Headless** de Liferay y guardan sus datos en **Custom Objects**, usando el token CSRF de la sesión del portal.

## Flight Manager: APIs externas

- **AviationStack**: datos de vuelos reales.
- **Amadeus for Developers**: búsqueda de vuelos comerciales con precios.
- **MapTiler**: mapa de satélite (sin clave se usa OpenStreetMap).

Las claves se configuran en un fichero `.env` local (ver `.env.example`) y nunca se suben al repositorio. Sin claves, la aplicación funciona con datos simulados.

## Créditos

Algunos componentes visuales animados de Flight Manager (`ChromaGrid`, `TargetCursor`, `ScrollStack`, `FlipCard`, `Folder` y similares) están basados en [React Bits](https://reactbits.dev) y adaptados al proyecto.
