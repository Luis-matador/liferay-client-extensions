import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MetricsOverviewComponent } from './components/metrics-overview/metrics-overview.component';
import { QuotationChartComponent } from './components/quotation-chart/quotation-chart.component';
import { RecentQuotationsComponent } from './components/recent-quotations/recent-quotations.component';
import { StatusKanbanComponent } from './components/status-kanban/status-kanban.component';
import { CreateQuotationDialogComponent } from './components/create-quotation-dialog/create-quotation-dialog.component';
import { LiferayApiService } from './services/liferay-api.service';
import { QuotationEventsService } from './services/quotation-events.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    MatDialogModule,
    MetricsOverviewComponent,
    QuotationChartComponent,
    RecentQuotationsComponent,
    StatusKanbanComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  activeTab = 0;
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private liferayApi = inject(LiferayApiService);
  private quotationEvents = inject(QuotationEventsService);

  ngOnInit(): void {
    console.log('✅ Quotation Dashboard inicializado - Conectado a Liferay API');
  }

  onTabChange(index: number): void {
    this.activeTab = index;
    
    // Disparar evento de actualización al cambiar de tab
    // Esto asegura que los componentes se refresquen correctamente
    this.quotationEvents.notifyQuotationChanged();
    console.log(`🔄 Tab cambiado a: ${index} - Refrescando componentes`);
  }

  createNewQuotation(): void {
    const dialogRef = this.dialog.open(CreateQuotationDialogComponent, {
      width: '600px',
      disableClose: false,
      panelClass: 'quotation-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // result contiene los datos del formulario
        this.liferayApi.createQuotation(result).subscribe(
          createdQuotation => {
            if (createdQuotation) {
              this.snackBar.open(
                `✅ Cotización #${createdQuotation.id} creada exitosamente en Liferay`, 
                'Cerrar', 
                {
                  duration: 4000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                  panelClass: ['success-snackbar']
                }
              );
              
              // Notificar cambio a todos los componentes
              this.quotationEvents.notifyQuotationChanged();
              console.log('Cotización creada:', createdQuotation);
            } else {
              this.snackBar.open(
                '❌ Error al crear la cotización en Liferay', 
                'Cerrar', 
                {
                  duration: 4000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                  panelClass: ['error-snackbar']
                }
              );
            }
          },
          error => {
            console.error('Error al crear cotización:', error);
            this.snackBar.open(
              '❌ Error de conexión con Liferay', 
              'Cerrar', 
              {
                duration: 4000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['error-snackbar']
              }
            );
          }
        );
      }
    });
  }
}
