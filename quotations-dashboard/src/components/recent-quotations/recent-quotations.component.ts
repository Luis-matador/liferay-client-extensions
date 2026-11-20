import { Component, OnInit, ViewChild, inject, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar} from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { LiferayApiService, Quotation } from '../../services/liferay-api.service';
import { QuotationEventsService } from '../../services/quotation-events.service';
import { ViewQuotationDialogComponent } from '../view-quotation-dialog/view-quotation-dialog.component';
import { EditQuotationDialogComponent } from '../edit-quotation-dialog/edit-quotation-dialog.component';
import { formatCurrency, formatDate, getStatusName } from '../../utils/format.utils';

@Component({
  selector: 'app-recent-quotations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './recent-quotations.component.html',
  styleUrls: ['./recent-quotations.component.scss']
})
export class RecentQuotationsComponent implements OnInit, AfterViewInit, OnDestroy {
  private liferayApi = inject(LiferayApiService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private quotationEvents = inject(QuotationEventsService);
  private cdr = inject(ChangeDetectorRef);
  private subscription?: Subscription;

  displayedColumns: string[] = ['id', 'clientName', 'projectName', 'amount', 'status', 'createdDate', 'actions'];
  dataSource = new MatTableDataSource<Quotation>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = true;

  ngOnInit(): void {
    this.loadQuotations();
    
    // Suscribirse a cambios en cotizaciones
    this.subscription = this.quotationEvents.quotationChanged$.subscribe(() => {
      console.log('📊 Tabla: Recargando cotizaciones por cambio detectado');
      this.loadQuotations();
    });
  }

  ngAfterViewInit(): void {
    // Conectar paginator
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadQuotations(): void {
    this.loading = true;
    
    this.liferayApi.getQuotations(1, 50).subscribe(response => {
      this.dataSource.data = response.items;
      this.loading = false;
      
      // Reconectar paginator después de cargar datos
      setTimeout(() => {
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage();
        }
      }, 0);
      
      console.log('✅ Cotizaciones recientes cargadas:', response.totalCount);
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'approved': 'accent',
      'in_review': 'primary',
      'pending': 'warn',
      'draft': '',
      'rejected': ''
    };
    return colors[status] || '';
  }

  // Exponer utilidades para uso en template
  formatCurrency = formatCurrency;
  formatDate = formatDate;

  getStatusLabel(status: string): string {
    return getStatusName(status);
  }

  viewDetails(quotation: Quotation): void {
    const dialogRef = this.dialog.open(ViewQuotationDialogComponent, {
      width: '600px',
      data: quotation
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'edit') {
        // Si el usuario hizo clic en "Editar" desde el diálogo de detalles
        this.editQuotation(quotation);
      }
    });
  }

  editQuotation(quotation: Quotation): void {
    const dialogRef = this.dialog.open(EditQuotationDialogComponent, {
      width: '600px',
      data: quotation
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Actualizar la quotation en Liferay
        this.liferayApi.updateQuotation(quotation.id, result).subscribe(
          updated => {
            if (updated) {
              this.snackBar.open(
                `✅ Cotización #${quotation.id} actualizada correctamente`,
                'Cerrar',
                { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' }
              );
              // Notificar cambio a todos los componentes
              this.quotationEvents.notifyQuotationChanged();
            } else {
              this.snackBar.open(
                '❌ Error al actualizar la cotización',
                'Cerrar',
                { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' }
              );
            }
          },
          error => {
            console.error('Error al actualizar:', error);
            this.snackBar.open(
              '❌ Error de conexión con Liferay',
              'Cerrar',
              { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' }
            );
          }
        );
      }
    });
  }

  deleteQuotation(quotation: Quotation): void {
    if (confirm(`¿Estás seguro de eliminar la cotización #${quotation.id} - ${quotation.projectName}?`)) {
      this.liferayApi.deleteQuotation(quotation.id).subscribe(success => {
        if (success) {
          this.snackBar.open(
            `🗑️ Cotización ${quotation.id} eliminada de Liferay`, 
            'Cerrar', 
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            }
          );
          // Notificar cambio a todos los componentes
          this.quotationEvents.notifyQuotationChanged();
        } else {
          this.snackBar.open(
            '❌ Error al eliminar la cotización', 
            'Cerrar', 
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            }
          );
        }
      });
    }
  }
}
