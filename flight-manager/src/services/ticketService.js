// Servicio de gestión de billetes (Liferay Headless API)

import axios from 'axios';
import { liferayAuthService } from './liferayAuthService';

class TicketService {
  constructor() {
    this.objectDefinitionName = 'FlightTicket';
    this.mockMode = true;
    this.mockTickets = this._loadMockTickets();
    this.initialized = false;
    // Auto-inicializar
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    await liferayAuthService.initialize();
    this.mockMode = !liferayAuthService.isLiferay();
    this.initialized = true;
    
    // COMENTADO: No forzar modo mock - dejar que liferayAuthService decida
    // if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    //   this.mockMode = true;
    // }
    
    if (this.mockMode) {
      console.log('🎭 Servicio de billetes en modo MOCK (desarrollo)');
    } else {
      console.log('✅ Servicio de billetes conectado a Liferay');
    }
  }

  // Obtiene billetes del usuario
  async getUserTickets() {
    await this.initialize();
    
    const userId = liferayAuthService.getCurrentUserId();
    
    if (!userId && !this.mockMode) {
      throw new Error('Usuario no autenticado');
    }

    if (this.mockMode) {
      return this._getMockTickets(userId || 'mock-user-default');
    }

    try {
      const baseURL = liferayAuthService.getBaseURL();
      const headers = liferayAuthService.getAuthHeaders();

      // Llamada a Headless API de Liferay para Custom Objects
      const response = await axios.get(
        `${baseURL}/o/c/${this.objectDefinitionName.toLowerCase()}s`,
        {
          headers,
          params: {
            filter: `ownerUserId eq '${userId}'`,
            sort: 'purchaseDate:desc',
            pageSize: 100
          }
        }
      );

      // Normalizar los datos de Liferay (Picklists vienen como objetos)
      const tickets = (response.data.items || []).map(ticket => ({
        ...ticket,
        ticketClass: typeof ticket.ticketClass === 'object' ? ticket.ticketClass.key : ticket.ticketClass,
        ticketStatus: typeof ticket.ticketStatus === 'object' ? ticket.ticketStatus.key : ticket.ticketStatus
      }));

      return tickets;
    } catch (error) {
      console.error('❌ Error obteniendo billetes:', error);
      throw error;
    }
  }

  // Obtiene billete por ID
  async getTicketById(ticketId) {
    if (this.mockMode) {
      const ticket = this.mockTickets.find(t => t.id === ticketId);
      return ticket || null;
    }

    try {
      const baseURL = liferayAuthService.getBaseURL();
      const headers = liferayAuthService.getAuthHeaders();

      const response = await axios.get(
        `${baseURL}/o/c/${this.objectDefinitionName.toLowerCase()}s/${ticketId}`,
        { headers }
      );

      // Normalizar Picklists
      const ticket = response.data;
      return {
        ...ticket,
        ticketClass: typeof ticket.ticketClass === 'object' ? ticket.ticketClass.key : ticket.ticketClass,
        ticketStatus: typeof ticket.ticketStatus === 'object' ? ticket.ticketStatus.key : ticket.ticketStatus
      };
    } catch (error) {
      console.error('❌ Error obteniendo billete:', error);
      throw error;
    }
  }

  // Crea un billete
  async createTicket(ticketData) {
    // Asegurar inicialización PRIMERO
    await this.initialize();
    
    console.log('🔍 Estado de mockMode:', this.mockMode);
    console.log('🔍 Hostname:', window.location.hostname);
    
    const userId = liferayAuthService.getCurrentUserId();
    
    if (!userId) {
      // En modo mock, crear un userId temporal
      const mockUserId = 'mock-user-' + Date.now();
      console.log('⚠️ Usuario no autenticado, usando ID temporal:', mockUserId);
    }

    const ticket = {
      ownerUserId: userId || 'mock-user-' + Date.now(),
      flightNumber: ticketData.flightNumber,
      flightIATA: ticketData.flightIATA,
      airlineName: ticketData.airlineName,
      airlineIATA: ticketData.airlineIATA,
      departureAirport: ticketData.departureAirport,
      departureIATA: ticketData.departureIATA,
      departureCity: ticketData.departureCity,
      departureDate: ticketData.departureDate,
      departureTime: ticketData.departureTime,
      arrivalAirport: ticketData.arrivalAirport,
      arrivalIATA: ticketData.arrivalIATA,
      arrivalCity: ticketData.arrivalCity,
      arrivalDate: ticketData.arrivalDate,
      arrivalTime: ticketData.arrivalTime,
      passengerName: ticketData.passengerName,
      passengerDocument: ticketData.passengerDocument,
      seatNumber: ticketData.seatNumber,
      ticketClass: ticketData.ticketClass || 'economy',
      price: ticketData.price,
      currency: ticketData.currency || 'EUR',
      bookingReference: ticketData.bookingReference || this._generateBookingReference(),
      purchaseDate: new Date().toISOString(),
      ticketStatus: ticketData.ticketStatus || 'confirmed'
    };

    // VERIFICAR MODO MOCK DESPUÉS DE INICIALIZAR
    if (this.mockMode) {
      console.log('🎭 Creando billete en modo MOCK...');
      return this._createMockTicket(ticket);
    }

    console.log('🌐 Creando billete en Liferay...');
    try {
      const baseURL = liferayAuthService.getBaseURL();
      const headers = liferayAuthService.getAuthHeaders();

      const response = await axios.post(
        `${baseURL}/o/c/${this.objectDefinitionName.toLowerCase()}s`,
        ticket,
        { headers }
      );

      // Normalizar Picklists en la respuesta
      const createdTicket = response.data;
      return {
        ...createdTicket,
        ticketClass: typeof createdTicket.ticketClass === 'object' ? createdTicket.ticketClass.key : createdTicket.ticketClass,
        ticketStatus: typeof createdTicket.ticketStatus === 'object' ? createdTicket.ticketStatus.key : createdTicket.ticketStatus
      };
    } catch (error) {
      console.error('❌ Error creando billete:', error);
      throw error;
    }
  }

  // Actualiza un billete
  async updateTicket(ticketId, updates) {
    if (this.mockMode) {
      return this._updateMockTicket(ticketId, updates);
    }

    try {
      const baseURL = liferayAuthService.getBaseURL();
      const headers = liferayAuthService.getAuthHeaders();

      const response = await axios.patch(
        `${baseURL}/o/c/${this.objectDefinitionName.toLowerCase()}s/${ticketId}`,
        updates,
        { headers }
      );

      // Normalizar Picklists
      const updatedTicket = response.data;
      return {
        ...updatedTicket,
        ticketClass: typeof updatedTicket.ticketClass === 'object' ? updatedTicket.ticketClass.key : updatedTicket.ticketClass,
        ticketStatus: typeof updatedTicket.ticketStatus === 'object' ? updatedTicket.ticketStatus.key : updatedTicket.ticketStatus
      };
    } catch (error) {
      console.error('❌ Error actualizando billete:', error);
      throw error;
    }
  }

  // Cancela un billete
  async cancelTicket(ticketId) {
    return await this.updateTicket(ticketId, { ticketStatus: 'cancelled' });
  }

  // Elimina un billete
  async deleteTicket(ticketId) {
    if (this.mockMode) {
      return this._deleteMockTicket(ticketId);
    }

    try {
      const baseURL = liferayAuthService.getBaseURL();
      const headers = liferayAuthService.getAuthHeaders();

      await axios.delete(
        `${baseURL}/o/c/${this.objectDefinitionName.toLowerCase()}s/${ticketId}`,
        { headers }
      );

      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando billete:', error);
      throw error;
    }
  }

  // Busca billetes por vuelo
  async getTicketsByFlight(flightNumber) {
    const userId = liferayAuthService.getCurrentUserId();
    
    if (this.mockMode) {
      return this.mockTickets.filter(
        t => t.ownerUserId === userId && t.flightIATA === flightNumber
      );
    }

    try {
      const baseURL = liferayAuthService.getBaseURL();
      const headers = liferayAuthService.getAuthHeaders();

      const response = await axios.get(
        `${baseURL}/o/c/${this.objectDefinitionName.toLowerCase()}s`,
        {
          headers,
          params: {
            filter: `ownerUserId eq '${userId}' and flightIATA eq '${flightNumber}'`,
            sort: 'purchaseDate:desc'
          }
        }
      );

      // Normalizar Picklists
      const tickets = (response.data.items || []).map(ticket => ({
        ...ticket,
        ticketClass: typeof ticket.ticketClass === 'object' ? ticket.ticketClass.key : ticket.ticketClass,
        ticketStatus: typeof ticket.ticketStatus === 'object' ? ticket.ticketStatus.key : ticket.ticketStatus
      }));

      return tickets;
    } catch (error) {
      console.error('❌ Error buscando billetes por vuelo:', error);
      throw error;
    }
  }

  // Métodos MOCK para desarrollo

  _loadMockTickets() {
    const stored = localStorage.getItem('mock_flight_tickets');
    return stored ? JSON.parse(stored) : [];
  }

  _saveMockTickets() {
    localStorage.setItem('mock_flight_tickets', JSON.stringify(this.mockTickets));
  }

  _getMockTickets(userId) {
    console.log('🔍 Buscando billetes para userId:', userId);
    console.log('🔍 Total de billetes en mock:', this.mockTickets.length);
    console.log('🔍 Todos los billetes:', this.mockTickets);
    const filtered = this.mockTickets.filter(t => t.ownerUserId === userId);
    console.log('🔍 Billetes filtrados:', filtered);
    return filtered;
  }

  _createMockTicket(ticket) {
    const newTicket = {
      ...ticket,
      id: 'TICKET-' + Date.now()
    };
    console.log('✅ Creando billete mock:', newTicket);
    this.mockTickets.push(newTicket);
    this._saveMockTickets();
    console.log('✅ Billete creado (mock):', newTicket.id);
    console.log('✅ Total de billetes después de crear:', this.mockTickets.length);
    return newTicket;
  }

  _updateMockTicket(ticketId, updates) {
    const index = this.mockTickets.findIndex(t => t.id === ticketId);
    if (index === -1) {
      throw new Error('Billete no encontrado');
    }
    
    this.mockTickets[index] = {
      ...this.mockTickets[index],
      ...updates
    };
    this._saveMockTickets();
    console.log('✅ Billete actualizado (mock):', ticketId);
    return this.mockTickets[index];
  }

  _deleteMockTicket(ticketId) {
    const index = this.mockTickets.findIndex(t => t.id === ticketId);
    if (index === -1) {
      throw new Error('Billete no encontrado');
    }
    
    this.mockTickets.splice(index, 1);
    this._saveMockTickets();
    console.log('✅ Billete eliminado (mock):', ticketId);
    return { success: true };
  }

  _generateBookingReference() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ref = '';
    for (let i = 0; i < 6; i++) {
      ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
  }
}

// Exportar instancia singleton
export const ticketService = new TicketService();
