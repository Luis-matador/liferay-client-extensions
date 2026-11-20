import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Servicio para comunicar eventos entre componentes
 * Utiliza RxJS Subject para broadcasting de eventos
 */
@Injectable({
  providedIn: 'root'
})
export class QuotationEventsService {
  
  // Subject para notificar cambios en cotizaciones
  private quotationChangedSubject = new Subject<void>();
  
  // Observable público para suscribirse a cambios
  quotationChanged$ = this.quotationChangedSubject.asObservable();

  /**
   * Notificar que una cotización ha cambiado (crear, editar, eliminar, mover)
   */
  notifyQuotationChanged(): void {
    this.quotationChangedSubject.next();
    console.log('🔔 Evento: Cotización modificada - notificando a componentes');
  }
}
