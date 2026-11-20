// Configuración de la API de AviationStack

export const AVIATIONSTACK_CONFIG = {
  // La clave se lee solo de .env (VITE_AVIATION_API_KEY); nunca se guarda en el código
  API_KEY: import.meta.env.VITE_AVIATION_API_KEY || '',
  BASE_URL: 'https://api.aviationstack.com/v1',
  LIMITS: {
    REQUESTS_PER_MONTH: 100,
    REQUESTS_PER_SESSION: 1
  }
};

// Modo desarrollo: true = datos mock | false = API real (configurar VITE_USE_MOCK_FLIGHTS en .env)
// Sin clave configurada se usan siempre los datos simulados
export const USE_MOCK_FLIGHTS = import.meta.env.VITE_USE_MOCK_FLIGHTS === 'true' || !AVIATIONSTACK_CONFIG.API_KEY;
