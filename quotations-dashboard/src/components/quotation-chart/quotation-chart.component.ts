import { Component, Input, OnInit, ViewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgApexchartsModule, ChartComponent, ApexChart, ApexNonAxisChartSeries, ApexAxisChartSeries, ApexXAxis, ApexPlotOptions, ApexDataLabels, ApexLegend, ApexTooltip } from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { LiferayApiService, Quotation } from '../../services/liferay-api.service';
import { QuotationEventsService } from '../../services/quotation-events.service';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis?: ApexXAxis;
  labels?: string[];
  colors?: string[];
  plotOptions?: ApexPlotOptions;
  dataLabels?: ApexDataLabels;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
};

@Component({
  selector: 'app-quotation-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgApexchartsModule],
  templateUrl: './quotation-chart.component.html',
  styleUrls: ['./quotation-chart.component.scss']
})
export class QuotationChartComponent implements OnInit, OnDestroy {
  @Input() chartType: 'status' | 'trend' | 'amount' = 'status';
  @Input() title = 'Chart';
  @ViewChild('chart') chart!: ChartComponent;

  private liferayApi = inject(LiferayApiService);
  private quotationEvents = inject(QuotationEventsService);
  private subscription?: Subscription;
  
  public chartOptions!: Partial<ChartOptions>;
  loading = true;
  private quotations: Quotation[] = [];

  ngOnInit(): void {
    this.loadData();
    
    // Suscribirse a cambios en cotizaciones
    this.subscription = this.quotationEvents.quotationChanged$.subscribe(() => {
      console.log(`📊 Gráfico ${this.chartType}: Recargando por cambio detectado`);
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    // Limpiar suscripción
    this.subscription?.unsubscribe();
  }

  loadData(): void {
    this.loading = true;

    this.liferayApi.getQuotations(1, 1000).subscribe(response => {
      this.quotations = response.items;
      
      // Esperar a que el DOM esté listo antes de inicializar el gráfico
      setTimeout(() => {
        this.initChart();
        this.loading = false;
        console.log(`✅ Datos cargados para gráfica ${this.chartType}:`, this.quotations.length, 'cotizaciones');
      }, 200);
    });
  }

  initChart(): void {
    switch (this.chartType) {
      case 'status':
        this.initStatusChart();
        break;
      case 'trend':
        this.initTrendChart();
        break;
      case 'amount':
        this.initAmountChart();
        break;
    }
  }

  private initStatusChart(): void {
    // Contar cotizaciones por estado
    const statusCounts = {
      approved: this.quotations.filter(q => q.quotationStatus.key === 'approved').length,
      revision: this.quotations.filter(q => q.quotationStatus.key === 'revision').length,
      pending: this.quotations.filter(q => q.quotationStatus.key === 'pending').length,
      draft: this.quotations.filter(q => q.quotationStatus.key === 'draft').length,
      rejected: this.quotations.filter(q => q.quotationStatus.key === 'rejected').length
    };

    this.chartOptions = {
      series: [
        statusCounts.approved,
        statusCounts.revision,
        statusCounts.pending,
        statusCounts.draft,
        statusCounts.rejected
      ],
      chart: {
        type: 'donut',
        height: 300
      },
      labels: ['Aprobadas', 'En Revisión', 'Pendientes', 'Borrador', 'Rechazadas'],
      colors: ['#4caf50', '#2196f3', '#ff9800', '#9e9e9e', '#f44336'],
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        floating: false,
        fontSize: '11px',
        itemMargin: {
          horizontal: 4,
          vertical: 0
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return val.toFixed(0) + '%';
        }
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + ' cotizaciones';
          }
        }
      }
    };
  }

  private initTrendChart(): void {
    // Agrupar cotizaciones por mes
    const monthCounts = new Map<string, number>();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    this.quotations.forEach(q => {
      const date = new Date(q.createdDate);
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthCounts.set(monthYear, (monthCounts.get(monthYear) || 0) + 1);
    });

    // Obtener los últimos 6 meses con datos
    const sortedMonths = Array.from(monthCounts.entries())
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6);

    const categories = sortedMonths.map(m => m[0]);
    const data = sortedMonths.map(m => m[1]);

    this.chartOptions = {
      series: [
        {
          name: 'Cotizaciones',
          data: data.length > 0 ? data : [0]
        }
      ],
      chart: {
        type: 'area',
        height: 300,
        toolbar: {
          show: false
        }
      },
      colors: ['#667eea'],
      xaxis: {
        categories: categories.length > 0 ? categories : ['Sin datos']
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + ' cotizaciones';
          }
        }
      }
    };
  }

  private initAmountChart(): void {
    // Agrupar cotizaciones por rango de monto
    const ranges = {
      '0-30k': this.quotations.filter(q => q.amount >= 0 && q.amount < 30000).length,
      '30k-50k': this.quotations.filter(q => q.amount >= 30000 && q.amount < 50000).length,
      '50k-80k': this.quotations.filter(q => q.amount >= 50000 && q.amount < 80000).length,
      '80k+': this.quotations.filter(q => q.amount >= 80000).length
    };

    this.chartOptions = {
      series: [
        {
          name: 'Cantidad',
          data: [ranges['0-30k'], ranges['30k-50k'], ranges['50k-80k'], ranges['80k+']]
        }
      ],
      chart: {
        type: 'bar',
        height: 300,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4
        }
      },
      colors: ['#11998e'],
      xaxis: {
        categories: ['€0-€30k', '€30k-€50k', '€50k-€80k', '€80k+']
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + ' cotizaciones';
          }
        }
      }
    };
  }
}
