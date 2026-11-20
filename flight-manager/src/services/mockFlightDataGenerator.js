// Mock Flight Data Generator - Datos de prueba para desarrollo sin consumir API

// Genera 20 vuelos de prueba: 8 activos, 6 programados, 6 aterrizados
export function generateMockFlights() {
  const now = new Date();
  
  // Definición de vuelos con datos fijos y consistentes
  const mockFlights = [
    // ========== VUELOS ACTIVOS (8) ==========
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'active',
      flight: {
        number: '1234',
        iata: 'IB1234',
        icao: 'IBE1234'
      },
      airline: {
        name: 'Iberia',
        iata: 'IB',
        icao: 'IBE'
      },
      departure: {
        airport: 'Adolfo Suárez Madrid-Barajas Airport',
        iata: 'MAD',
        icao: 'LEMD',
        timezone: 'Europe/Madrid',
        city: 'Madrid',
        scheduled: getTimeOffset(-2, 0), // Salió hace 2 horas
        actual: getTimeOffset(-2, 2)
      },
      arrival: {
        airport: 'Barcelona-El Prat Airport',
        iata: 'BCN',
        icao: 'LEBL',
        timezone: 'Europe/Madrid',
        city: 'Barcelona',
        scheduled: getTimeOffset(0, 15), // Llega en 15 minutos
        estimated: getTimeOffset(0, 12)
      },
      aircraft: {
        iata: 'A320',
        icao: 'A320',
        registration: 'EC-ABC'
      },
      live: {
        latitude: 41.5,
        longitude: 1.2,
        altitude: 32000,
        speed: 520,
        speed_horizontal: 520,
        speed_vertical: 0,
        direction: 65,
        is_ground: false,
        updated: now.toISOString()
      }
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'active',
      flight: {
        number: '5678',
        iata: 'VY5678',
        icao: 'VLG5678'
      },
      airline: {
        name: 'Vueling',
        iata: 'VY',
        icao: 'VLG'
      },
      departure: {
        airport: 'Barcelona-El Prat Airport',
        iata: 'BCN',
        icao: 'LEBL',
        timezone: 'Europe/Madrid',
        city: 'Barcelona',
        scheduled: getTimeOffset(-1, -30),
        actual: getTimeOffset(-1, -28)
      },
      arrival: {
        airport: 'London Heathrow Airport',
        iata: 'LHR',
        icao: 'EGLL',
        timezone: 'Europe/London',
        city: 'London',
        scheduled: getTimeOffset(0, 45),
        estimated: getTimeOffset(0, 50)
      },
      aircraft: {
        iata: 'A321',
        icao: 'A321',
        registration: 'EC-XYZ'
      },
      live: {
        latitude: 43.2,
        longitude: 0.8,
        altitude: 38000,
        speed: 540,
        speed_horizontal: 540,
        speed_vertical: 0,
        direction: 320,
        is_ground: false,
        updated: now.toISOString()
      }
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'active',
      flight: {
        number: '2345',
        iata: 'FR2345',
        icao: 'RYR2345'
      },
      airline: {
        name: 'Ryanair',
        iata: 'FR',
        icao: 'RYR'
      },
      departure: {
        airport: 'London Heathrow Airport',
        iata: 'LHR',
        icao: 'EGLL',
        timezone: 'Europe/London',
        city: 'London',
        scheduled: getTimeOffset(-2, -15),
        actual: getTimeOffset(-2, -10)
      },
      arrival: {
        airport: 'Charles de Gaulle Airport',
        iata: 'CDG',
        icao: 'LFPG',
        timezone: 'Europe/Paris',
        city: 'Paris',
        scheduled: getTimeOffset(0, 5),
        estimated: getTimeOffset(0, 8)
      },
      aircraft: {
        iata: 'B738',
        icao: 'B738',
        registration: 'EI-DEF'
      },
      live: {
        latitude: 49.8,
        longitude: 1.5,
        altitude: 35000,
        speed: 510,
        speed_horizontal: 510,
        speed_vertical: -500,
        direction: 135,
        is_ground: false,
        updated: now.toISOString()
      }
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'active',
      flight: {
        number: '7890',
        iata: 'BA7890',
        icao: 'BAW7890'
      },
      airline: {
        name: 'British Airways',
        iata: 'BA',
        icao: 'BAW'
      },
      departure: {
        airport: 'Charles de Gaulle Airport',
        iata: 'CDG',
        icao: 'LFPG',
        timezone: 'Europe/Paris',
        city: 'Paris',
        scheduled: getTimeOffset(-1, -45),
        actual: getTimeOffset(-1, -42)
      },
      arrival: {
        airport: 'Frankfurt Airport',
        iata: 'FRA',
        icao: 'EDDF',
        timezone: 'Europe/Berlin',
        city: 'Frankfurt',
        scheduled: getTimeOffset(0, 20),
        estimated: getTimeOffset(0, 25)
      },
      aircraft: {
        iata: 'A319',
        icao: 'A319',
        registration: 'G-ABC'
      },
      live: {
        latitude: 49.5,
        longitude: 7.2,
        altitude: 34000,
        speed: 495,
        speed_horizontal: 495,
        speed_vertical: 0,
        direction: 85,
        is_ground: false,
        updated: now.toISOString()
      }
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'active',
      flight: {
        number: '3456',
        iata: 'LH3456',
        icao: 'DLH3456'
      },
      airline: {
        name: 'Lufthansa',
        iata: 'LH',
        icao: 'DLH'
      },
      departure: {
        airport: 'Frankfurt Airport',
        iata: 'FRA',
        icao: 'EDDF',
        timezone: 'Europe/Berlin',
        city: 'Frankfurt',
        scheduled: getTimeOffset(-2, -20),
        actual: getTimeOffset(-2, -18)
      },
      arrival: {
        airport: 'Amsterdam Airport Schiphol',
        iata: 'AMS',
        icao: 'EHAM',
        timezone: 'Europe/Amsterdam',
        city: 'Amsterdam',
        scheduled: getTimeOffset(0, 10),
        estimated: getTimeOffset(0, 12)
      },
      aircraft: {
        iata: 'A320',
        icao: 'A320',
        registration: 'D-AIJK'
      },
      live: {
        latitude: 51.2,
        longitude: 5.8,
        altitude: 28000,
        speed: 480,
        speed_horizontal: 480,
        speed_vertical: -800,
        direction: 310,
        is_ground: false,
        updated: now.toISOString()
      }
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'active',
      flight: {
        number: '4567',
        iata: 'IB4567',
        icao: 'IBE4567'
      },
      airline: {
        name: 'Iberia',
        iata: 'IB',
        icao: 'IBE'
      },
      departure: {
        airport: 'Amsterdam Airport Schiphol',
        iata: 'AMS',
        icao: 'EHAM',
        timezone: 'Europe/Amsterdam',
        city: 'Amsterdam',
        scheduled: getTimeOffset(-1, -20),
        actual: getTimeOffset(-1, -15)
      },
      arrival: {
        airport: 'Leonardo da Vinci-Fiumicino Airport',
        iata: 'FCO',
        icao: 'LIRF',
        timezone: 'Europe/Rome',
        city: 'Rome',
        scheduled: getTimeOffset(0, 55),
        estimated: getTimeOffset(1, 0)
      },
      aircraft: {
        iata: 'A321',
        icao: 'A321',
        registration: 'EC-LMN'
      },
      live: {
        latitude: 46.8,
        longitude: 9.5,
        altitude: 39000,
        speed: 550,
        speed_horizontal: 550,
        speed_vertical: 0,
        direction: 155,
        is_ground: false,
        updated: now.toISOString()
      }
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'active',
      flight: {
        number: '6789',
        iata: 'VY6789',
        icao: 'VLG6789'
      },
      airline: {
        name: 'Vueling',
        iata: 'VY',
        icao: 'VLG'
      },
      departure: {
        airport: 'Leonardo da Vinci-Fiumicino Airport',
        iata: 'FCO',
        icao: 'LIRF',
        timezone: 'Europe/Rome',
        city: 'Rome',
        scheduled: getTimeOffset(-1, -50),
        actual: getTimeOffset(-1, -48)
      },
      arrival: {
        airport: 'Vienna International Airport',
        iata: 'VIE',
        icao: 'LOWW',
        timezone: 'Europe/Vienna',
        city: 'Vienna',
        scheduled: getTimeOffset(0, 30),
        estimated: getTimeOffset(0, 32)
      },
      aircraft: {
        iata: 'A320',
        icao: 'A320',
        registration: 'EC-OPQ'
      },
      live: {
        latitude: 45.2,
        longitude: 14.5,
        altitude: 36000,
        speed: 525,
        speed_horizontal: 525,
        speed_vertical: 0,
        direction: 45,
        is_ground: false,
        updated: now.toISOString()
      }
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'active',
      flight: {
        number: '8901',
        iata: 'FR8901',
        icao: 'RYR8901'
      },
      airline: {
        name: 'Ryanair',
        iata: 'FR',
        icao: 'RYR'
      },
      departure: {
        airport: 'Vienna International Airport',
        iata: 'VIE',
        icao: 'LOWW',
        timezone: 'Europe/Vienna',
        city: 'Vienna',
        scheduled: getTimeOffset(-2, -5),
        actual: getTimeOffset(-2, 0)
      },
      arrival: {
        airport: 'Adolfo Suárez Madrid-Barajas Airport',
        iata: 'MAD',
        icao: 'LEMD',
        timezone: 'Europe/Madrid',
        city: 'Madrid',
        scheduled: getTimeOffset(0, 25),
        estimated: getTimeOffset(0, 30)
      },
      aircraft: {
        iata: 'B738',
        icao: 'B738',
        registration: 'EI-RST'
      },
      live: {
        latitude: 44.5,
        longitude: 5.8,
        altitude: 37000,
        speed: 535,
        speed_horizontal: 535,
        speed_vertical: 0,
        direction: 250,
        is_ground: false,
        updated: now.toISOString()
      }
    },

    // ========== VUELOS PROGRAMADOS (6) ==========
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'scheduled',
      flight: {
        number: '1111',
        iata: 'IB1111',
        icao: 'IBE1111'
      },
      airline: {
        name: 'Iberia',
        iata: 'IB',
        icao: 'IBE'
      },
      departure: {
        airport: 'Adolfo Suárez Madrid-Barajas Airport',
        iata: 'MAD',
        icao: 'LEMD',
        timezone: 'Europe/Madrid',
        city: 'Madrid',
        scheduled: getTimeOffset(1, 30), // Sale en 1h 30min
        estimated: getTimeOffset(1, 30)
      },
      arrival: {
        airport: 'Charles de Gaulle Airport',
        iata: 'CDG',
        icao: 'LFPG',
        timezone: 'Europe/Paris',
        city: 'Paris',
        scheduled: getTimeOffset(3, 45),
        estimated: getTimeOffset(3, 45)
      },
      aircraft: {
        iata: 'A320',
        icao: 'A320',
        registration: 'EC-UVW'
      },
      live: null
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'scheduled',
      flight: {
        number: '2222',
        iata: 'BA2222',
        icao: 'BAW2222'
      },
      airline: {
        name: 'British Airways',
        iata: 'BA',
        icao: 'BAW'
      },
      departure: {
        airport: 'Barcelona-El Prat Airport',
        iata: 'BCN',
        icao: 'LEBL',
        timezone: 'Europe/Madrid',
        city: 'Barcelona',
        scheduled: getTimeOffset(2, 0),
        estimated: getTimeOffset(2, 0)
      },
      arrival: {
        airport: 'London Heathrow Airport',
        iata: 'LHR',
        icao: 'EGLL',
        timezone: 'Europe/London',
        city: 'London',
        scheduled: getTimeOffset(4, 20),
        estimated: getTimeOffset(4, 20)
      },
      aircraft: {
        iata: 'A319',
        icao: 'A319',
        registration: 'G-XYZ'
      },
      live: null
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'scheduled',
      flight: {
        number: '3333',
        iata: 'LH3333',
        icao: 'DLH3333'
      },
      airline: {
        name: 'Lufthansa',
        iata: 'LH',
        icao: 'DLH'
      },
      departure: {
        airport: 'Frankfurt Airport',
        iata: 'FRA',
        icao: 'EDDF',
        timezone: 'Europe/Berlin',
        city: 'Frankfurt',
        scheduled: getTimeOffset(2, 45),
        estimated: getTimeOffset(2, 45)
      },
      arrival: {
        airport: 'Vienna International Airport',
        iata: 'VIE',
        icao: 'LOWW',
        timezone: 'Europe/Vienna',
        city: 'Vienna',
        scheduled: getTimeOffset(4, 15),
        estimated: getTimeOffset(4, 15)
      },
      aircraft: {
        iata: 'A320',
        icao: 'A320',
        registration: 'D-LMNO'
      },
      live: null
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'scheduled',
      flight: {
        number: '4444',
        iata: 'VY4444',
        icao: 'VLG4444'
      },
      airline: {
        name: 'Vueling',
        iata: 'VY',
        icao: 'VLG'
      },
      departure: {
        airport: 'Amsterdam Airport Schiphol',
        iata: 'AMS',
        icao: 'EHAM',
        timezone: 'Europe/Amsterdam',
        city: 'Amsterdam',
        scheduled: getTimeOffset(3, 15),
        estimated: getTimeOffset(3, 15)
      },
      arrival: {
        airport: 'Barcelona-El Prat Airport',
        iata: 'BCN',
        icao: 'LEBL',
        timezone: 'Europe/Madrid',
        city: 'Barcelona',
        scheduled: getTimeOffset(5, 30),
        estimated: getTimeOffset(5, 30)
      },
      aircraft: {
        iata: 'A321',
        icao: 'A321',
        registration: 'EC-PQR'
      },
      live: null
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'scheduled',
      flight: {
        number: '5555',
        iata: 'FR5555',
        icao: 'RYR5555'
      },
      airline: {
        name: 'Ryanair',
        iata: 'FR',
        icao: 'RYR'
      },
      departure: {
        airport: 'Leonardo da Vinci-Fiumicino Airport',
        iata: 'FCO',
        icao: 'LIRF',
        timezone: 'Europe/Rome',
        city: 'Rome',
        scheduled: getTimeOffset(4, 0),
        estimated: getTimeOffset(4, 0)
      },
      arrival: {
        airport: 'Adolfo Suárez Madrid-Barajas Airport',
        iata: 'MAD',
        icao: 'LEMD',
        timezone: 'Europe/Madrid',
        city: 'Madrid',
        scheduled: getTimeOffset(6, 30),
        estimated: getTimeOffset(6, 30)
      },
      aircraft: {
        iata: 'B738',
        icao: 'B738',
        registration: 'EI-STU'
      },
      live: null
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'scheduled',
      flight: {
        number: '6666',
        iata: 'IB6666',
        icao: 'IBE6666'
      },
      airline: {
        name: 'Iberia',
        iata: 'IB',
        icao: 'IBE'
      },
      departure: {
        airport: 'London Heathrow Airport',
        iata: 'LHR',
        icao: 'EGLL',
        timezone: 'Europe/London',
        city: 'London',
        scheduled: getTimeOffset(4, 45),
        estimated: getTimeOffset(4, 45)
      },
      arrival: {
        airport: 'Frankfurt Airport',
        iata: 'FRA',
        icao: 'EDDF',
        timezone: 'Europe/Berlin',
        city: 'Frankfurt',
        scheduled: getTimeOffset(6, 5),
        estimated: getTimeOffset(6, 5)
      },
      aircraft: {
        iata: 'A320',
        icao: 'A320',
        registration: 'EC-VWX'
      },
      live: null
    },

    // ========== VUELOS ATERRIZADOS (6) ==========
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'landed',
      flight: {
        number: '7777',
        iata: 'BA7777',
        icao: 'BAW7777'
      },
      airline: {
        name: 'British Airways',
        iata: 'BA',
        icao: 'BAW'
      },
      departure: {
        airport: 'Adolfo Suárez Madrid-Barajas Airport',
        iata: 'MAD',
        icao: 'LEMD',
        timezone: 'Europe/Madrid',
        city: 'Madrid',
        scheduled: getTimeOffset(-5, -30), // Aterrizó hace 3h
        actual: getTimeOffset(-5, -28)
      },
      arrival: {
        airport: 'Amsterdam Airport Schiphol',
        iata: 'AMS',
        icao: 'EHAM',
        timezone: 'Europe/Amsterdam',
        city: 'Amsterdam',
        scheduled: getTimeOffset(-3, 0),
        actual: getTimeOffset(-2, -55)
      },
      aircraft: {
        iata: 'A319',
        icao: 'A319',
        registration: 'G-DEF'
      },
      live: null
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'landed',
      flight: {
        number: '8888',
        iata: 'LH8888',
        icao: 'DLH8888'
      },
      airline: {
        name: 'Lufthansa',
        iata: 'LH',
        icao: 'DLH'
      },
      departure: {
        airport: 'Barcelona-El Prat Airport',
        iata: 'BCN',
        icao: 'LEBL',
        timezone: 'Europe/Madrid',
        city: 'Barcelona',
        scheduled: getTimeOffset(-6, -15),
        actual: getTimeOffset(-6, -10)
      },
      arrival: {
        airport: 'Vienna International Airport',
        iata: 'VIE',
        icao: 'LOWW',
        timezone: 'Europe/Vienna',
        city: 'Vienna',
        scheduled: getTimeOffset(-4, 0),
        actual: getTimeOffset(-3, -58)
      },
      aircraft: {
        iata: 'A320',
        icao: 'A320',
        registration: 'D-PQRS'
      },
      live: null
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'landed',
      flight: {
        number: '9999',
        iata: 'VY9999',
        icao: 'VLG9999'
      },
      airline: {
        name: 'Vueling',
        iata: 'VY',
        icao: 'VLG'
      },
      departure: {
        airport: 'Charles de Gaulle Airport',
        iata: 'CDG',
        icao: 'LFPG',
        timezone: 'Europe/Paris',
        city: 'Paris',
        scheduled: getTimeOffset(-4, -45),
        actual: getTimeOffset(-4, -42)
      },
      arrival: {
        airport: 'Leonardo da Vinci-Fiumicino Airport',
        iata: 'FCO',
        icao: 'LIRF',
        timezone: 'Europe/Rome',
        city: 'Rome',
        scheduled: getTimeOffset(-2, -30),
        actual: getTimeOffset(-2, -28)
      },
      aircraft: {
        iata: 'A321',
        icao: 'A321',
        registration: 'EC-YZA'
      },
      live: null
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'landed',
      flight: {
        number: '1010',
        iata: 'FR1010',
        icao: 'RYR1010'
      },
      airline: {
        name: 'Ryanair',
        iata: 'FR',
        icao: 'RYR'
      },
      departure: {
        airport: 'Frankfurt Airport',
        iata: 'FRA',
        icao: 'EDDF',
        timezone: 'Europe/Berlin',
        city: 'Frankfurt',
        scheduled: getTimeOffset(-5, 0),
        actual: getTimeOffset(-4, -58)
      },
      arrival: {
        airport: 'Barcelona-El Prat Airport',
        iata: 'BCN',
        icao: 'LEBL',
        timezone: 'Europe/Madrid',
        city: 'Barcelona',
        scheduled: getTimeOffset(-2, -45),
        actual: getTimeOffset(-2, -42)
      },
      aircraft: {
        iata: 'B738',
        icao: 'B738',
        registration: 'EI-BCD'
      },
      live: null
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'landed',
      flight: {
        number: '2020',
        iata: 'IB2020',
        icao: 'IBE2020'
      },
      airline: {
        name: 'Iberia',
        iata: 'IB',
        icao: 'IBE'
      },
      departure: {
        airport: 'Vienna International Airport',
        iata: 'VIE',
        icao: 'LOWW',
        timezone: 'Europe/Vienna',
        city: 'Vienna',
        scheduled: getTimeOffset(-6, -30),
        actual: getTimeOffset(-6, -25)
      },
      arrival: {
        airport: 'London Heathrow Airport',
        iata: 'LHR',
        icao: 'EGLL',
        timezone: 'Europe/London',
        city: 'London',
        scheduled: getTimeOffset(-3, -45),
        actual: getTimeOffset(-3, -40)
      },
      aircraft: {
        iata: 'A320',
        icao: 'A320',
        registration: 'EC-EFG'
      },
      live: null
    },
    {
      flight_date: now.toISOString().split('T')[0],
      flight_status: 'landed',
      flight: {
        number: '3030',
        iata: 'BA3030',
        icao: 'BAW3030'
      },
      airline: {
        name: 'British Airways',
        iata: 'BA',
        icao: 'BAW'
      },
      departure: {
        airport: 'Amsterdam Airport Schiphol',
        iata: 'AMS',
        icao: 'EHAM',
        timezone: 'Europe/Amsterdam',
        city: 'Amsterdam',
        scheduled: getTimeOffset(-5, -15),
        actual: getTimeOffset(-5, -12)
      },
      arrival: {
        airport: 'Adolfo Suárez Madrid-Barajas Airport',
        iata: 'MAD',
        icao: 'LEMD',
        timezone: 'Europe/Madrid',
        city: 'Madrid',
        scheduled: getTimeOffset(-2, -50),
        actual: getTimeOffset(-2, -48)
      },
      aircraft: {
        iata: 'A319',
        icao: 'A319',
        registration: 'G-HIJ'
      },
      live: null
    }
  ];

  // Estructura de respuesta compatible con AviationStack API
  return {
    pagination: {
      limit: 20,
      offset: 0,
      count: 20,
      total: 20
    },
    data: mockFlights
  };
}

// Calcula una fecha/hora relativa al momento actual
function getTimeOffset(hours, minutes) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}
