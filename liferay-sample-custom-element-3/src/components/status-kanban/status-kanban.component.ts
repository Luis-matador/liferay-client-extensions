import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { LiferayApiService, Quotation } from '../../services/liferay-api.service';
import { QuotationEventsService } from '../../services/quotation-events.service';
import { formatCurrency, formatDate } from '../../utils/format.utils';

interface KanbanColumn {
  id: string;
  title: string;
  quotations: Quotation[];
  color: string;
}

@Component({
  selector: 'app-status-kanban',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule, MatSnackBarModule, DragDropModule],
  templateUrl: './status-kanban.component.html',
  styleUrls: ['./status-kanban.component.scss']
})
export class StatusKanbanComponent implements OnInit, OnDestroy {
  private liferayApi = inject(LiferayApiService);
  private snackBar = inject(MatSnackBar);
  private quotationEvents = inject(QuotationEventsService);
  private subscription?: Subscription;

  columns: KanbanColumn[] = [
    { id: 'draft', title: 'Borrador', quotations: [], color: '#9e9e9e' },
    { id: 'pending', title: 'Pendiente', quotations: [], color: '#ff9800' },
    { id: 'revision', title: 'En Revisión', quotations: [], color: '#2196f3' },
    { id: 'approved', title: 'Aprobada', quotations: [], color: '#4caf50' },
    { id: 'rejected', title: 'Rechazada', quotations: [], color: '#f44336' }
  ];

  loading = true;

  ngOnInit(): void {
    this.loadQuotations();
    
    // Suscribirse a cambios en cotizaciones
    this.subscription = this.quotationEvents.quotationChanged$.subscribe(() => {
      console.log('📋 Kanban: Recargando cotizaciones por cambio detectado');
      this.loadQuotations();
    });
  }

  ngOnDestroy(): void {
    // Limpiar suscripción
    this.subscription?.unsubscribe();
  }

  /**
   * Cargar todas las cotizaciones desde la API de Liferay
   */
  loadQuotations(): void {
    this.loading = true;
    
    this.liferayApi.getQuotations(1, 1000).subscribe(response => {
      // Limpiar columnas
      this.columns.forEach(col => col.quotations = []);
      
      // Distribuir cotizaciones por estado usando quotationStatus.key
      response.items.forEach(quotation => {
        const column = this.columns.find(col => col.id === quotation.quotationStatus.key);
        if (column) {
          column.quotations.push(quotation);
        }
      });
      
      this.loading = false;
      console.log('✅ Cotizaciones cargadas desde Liferay:', response.totalCount);
    });
  }

  drop(event: CdkDragDrop<Quotation[]>, targetColumn: KanbanColumn): void {
    if (event.previousContainer === event.container) {
      // Mover dentro de la misma columna
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Mover a otra columna
      const quotation = event.previousContainer.data[event.previousIndex];
      const newStatusKey = targetColumn.id as 'draft' | 'pending' | 'revision' | 'approved' | 'rejected';

      // Mapear el key al nombre correspondiente
      const statusNames: {[key: string]: string} = {
        'draft': 'Borrador',
        'pending': 'Pendiente',
        'revision': 'En Revisión',
        'approved': 'Aprobada',
        'rejected': 'Rechazada'
      };

      // Actualizar en el servidor de Liferay (enviar solo el key como string)
      this.liferayApi.updateQuotation(quotation.id, { quotationStatus: newStatusKey } as any).subscribe(
        result => {
          if (result) {
            // Actualización exitosa - mover en la UI
            transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              event.previousIndex,
              event.currentIndex
            );

            // Actualizar estado local con el objeto completo
            quotation.quotationStatus = {
              key: newStatusKey,
              name: statusNames[newStatusKey]
            };

            this.snackBar.open(
              `✅ Cotización #${quotation.id} movida a ${targetColumn.title}`,
              'Cerrar',
              { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' }
            );
            
            // Notificar cambio a todos los componentes
            this.quotationEvents.notifyQuotationChanged();
          } else {
            this.snackBar.open(
              '❌ Error al actualizar el estado',
              'Cerrar',
              { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' }
            );
          }
        },
        error => {
          console.error('Error al actualizar cotización:', error);
          this.snackBar.open(
            '❌ Error de conexión con Liferay',
            'Cerrar',
            { duration: 3000, horizontalPosition: 'center', verticalPosition: 'top' }
          );
        }
      );
    }
  }

  // Exponer utilidades para uso en template
  formatCurrency = formatCurrency;
  formatDate = formatDate;
}
