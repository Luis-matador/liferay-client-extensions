
---

## 📝 Paso 1: Acceder a Custom Objects

1. Inicia sesión como **Administrador** en Liferay Portal
2. Haz clic en el **menú de aplicaciones** (icono de cuadrícula) en la esquina superior derecha
3. Ve a **Control Panel** → **Object**
4. Haz clic en el botón **"New Custom Object"** o **"Añadir"** (➕)

---

## 🏗️ Paso 2: Crear el Object Definition

### Información Básica

Completa los siguientes campos:

| Campo | Valor |
|-------|-------|
| **Label** | `Flight Ticket` |
| **Plural Label** | `Flight Tickets` |
| **Object Name** | `FlightTicket`  |
| **Storage Type** | `Default` |

✅ Haz clic en **"Save"** o **"Guardar"**

---

## 🔧 Paso 3: Añadir Campos (Fields)

Una vez creado el objeto, ve a la pestaña **"Fields"** y añade los siguientes campos:

### 📊 Tabla de Campos Requeridos

| # | Label | Field Name | Type | Required | Default Value | Notes |
|---|-------|------------|------|----------|---------------|-------|
| 1 | Owner User ID | `ownerUserId` | Text | ✅ Sí | - | ID del usuario propietario |
| 2 | Flight Number | `flightNumber` | Text | ✅ Sí | - | Número de vuelo completo |
| 3 | Flight IATA | `flightIATA` | Text | ✅ Sí | - | Código IATA del vuelo (ej: IB1234) |
| 4 | Airline Name | `airlineName` | Text | ✅ Sí | - | Nombre de la aerolínea |
| 5 | Airline IATA | `airlineIATA` | Text | ✅ Sí | - | Código IATA aerolínea (ej: IB) |
| 6 | Departure Airport | `departureAirport` | Text | ✅ Sí | - | Nombre del aeropuerto de salida |
| 7 | Departure IATA | `departureIATA` | Text | ✅ Sí | - | Código IATA salida (ej: MAD) |
| 8 | Departure City | `departureCity` | Text | ✅ Sí | - | Ciudad de salida |
| 9 | Departure Date | `departureDate` | Text | ✅ Sí | - | Fecha de salida (YYYY-MM-DD) |
| 10 | Departure Time | `departureTime` | Text | ✅ Sí | - | Hora de salida (HH:MM) |
| 11 | Arrival Airport | `arrivalAirport` | Text | ✅ Sí | - | Nombre del aeropuerto de llegada |
| 12 | Arrival IATA | `arrivalIATA` | Text | ✅ Sí | - | Código IATA llegada (ej: BCN) |
| 13 | Arrival City | `arrivalCity` | Text | ✅ Sí | - | Ciudad de llegada |
| 14 | Arrival Date | `arrivalDate` | Text | ✅ Sí | - | Fecha de llegada (YYYY-MM-DD) |
| 15 | Arrival Time | `arrivalTime` | Text | ✅ Sí | - | Hora de llegada (HH:MM) |
| 16 | Passenger Name | `passengerName` | Text | ✅ Sí | - | Nombre completo del pasajero |
| 17 | Passenger Document | `passengerDocument` | Text | ✅ Sí | - | Documento de identidad |
| 18 | Seat Number | `seatNumber` | Text | ✅ Sí | - | Número de asiento (ej: 12A) |
| 19 | Ticket Class | `ticketClass` | Picklist | ✅ Sí | `economy` | Ver opciones abajo ⬇️ |
| 20 | Price | `price` | Decimal | ✅ Sí | - | Precio del billete |
| 21 | Currency | `currency` | Text | ❌ No | `EUR` | Código de moneda |
| 22 | Booking Reference | `bookingReference` | Text | ✅ Sí | - | Código de reserva (6 chars) |
| 23 | Purchase Date | `purchaseDate` | Text | ✅ Sí | - | Fecha y hora de compra (ISO 8601) |
| 24 | Ticket Status | `ticketStatus` | Picklist | ✅ Sí | `confirmed` | Ver opciones abajo ⬇️ |

---

### 🎯 Configuración de Picklists

#### **Campo 19: Ticket Class (ticketClass)**

Tipo: **Picklist**

Añade las siguientes opciones:

| Value | Label |
|-------|-------|
| `economy` | Economy / Turista |
| `business` | Business |
| `first` | First Class / Primera Clase |

- Marca `economy` como **Default Value**

#### **Campo 24: Ticket Status (ticketStatus)**

Tipo: **Picklist**

Añade las siguientes opciones:

| Value | Label |
|-------|-------|
| `confirmed` | Confirmed / Confirmado |
| `cancelled` | Cancelled / Cancelado |
| `pending` | Pending / Pendiente |

- Marca `confirmed` como **Default Value**

---

## 📌 Paso 4: Configurar Detalles del Objeto

Ve a la pestaña **"Details"** y configura:

### Scope
- **Scope**: `Company` (para que esté disponible en toda la instancia)

### Title Field
- Selecciona el campo **`bookingReference`** como título
- Esto mostrará la referencia de reserva en las listas

### Panel Category Link
- **Enable**: ✅ Activado
- **Category Key**: `control_panel.object` (o el que prefieras)

---

## 🔐 Paso 5: Configurar Permisos

Ve a la pestaña **"Permissions"** o después de publicar:

### Permisos Recomendados

Para **Authenticated Users** (Usuarios Autenticados):
- ✅ `VIEW` - Ver billetes
- ✅ `ADD_OBJECT_ENTRY` - Crear billetes
- ✅ `UPDATE` - Actualizar sus propios billetes
- ✅ `DELETE` - Eliminar sus propios billetes

Para **Administrators**:
- ✅ Todos los permisos

---

## ✅ Paso 6: Publicar el Object

1. Una vez configurados todos los campos, ve a la parte superior
2. Haz clic en el botón **"Publish"** o **"Publicar"**
3. Confirma la publicación
---
