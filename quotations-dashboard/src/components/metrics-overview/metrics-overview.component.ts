import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { LiferayApiService } from '../../services/liferay-api.service';
import { QuotationEventsService } from '../../services/quotation-events.service';
import { formatCurrency } from '../../utils/format.utils';

@Component({
  selector: 'app-metrics-overview',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './metrics-overview.component.html',
  styleUrls: ['./metrics-overview.component.scss']
})
export class MetricsOverviewComponent implements OnInit, OnDestroy {
  private liferayApi = inject(LiferayApiService);
  private quotationEvents = inject(QuotationEventsService);
  private subscription?: Subscription;

  metrics = {
    totalQuotations: 0,
    totalAmount: 0,
    conversionRate: 0,
    avgResponseTime: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0
  };

  loading = true;

  ngOnInit(): void {
    this.loadMetrics();
    
    // Suscribirse a cambios en cotizaciones
    this.subscription = this.quotationEvents.quotationChanged$.subscribe(() => {
      console.log('📈 Métricas: Recargando por cambio detectado');
      this.loadMetrics();
    });
  }

  ngOnDestroy(): void {
    // Limpiar suscripción
    this.subscription?.unsubscribe();
  }

  loadMetrics(): void {
    this.loading = true;
    
    this.liferayApi.getQuotationStats().subscribe(stats => {
      this.metrics = {
        totalQuotations: stats.totalQuotations,
        totalAmount: stats.totalAmount,
        conversionRate: stats.conversionRate,
        avgResponseTime: 24, // Esto lo puedes calcular según tu lógica
        pendingCount: stats.pendingCount,
        approvedCount: stats.approvedCount,
        rejectedCount: stats.rejectedCount
      };
      
      this.loading = false;
      console.log('✅ Métricas cargadas desde Liferay:', stats);
    });
  }

  // Exponer utilidad para uso en template
  formatCurrency = formatCurrency;
}
