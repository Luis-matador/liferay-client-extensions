import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Quotation {
  id: number;
  clientName: string;
  clientEmail: string;
  projectName: string;
  amount: number;
  quotationStatus: {
    key: 'draft' | 'pending' | 'approved' | 'rejected' | 'revision';
    name: string;
  };
  createdDate: string;
  description?: string;
  quotationPriority?: {
    key: 'low' | 'medium' | 'high' | 'urgent';
    name: string;
  };
}

export interface QuotationResponse {
  items: Quotation[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class LiferayApiService {
  // URL base de tu instancia de Liferay
  private baseUrl = '/o/c/quotations'; // Custom Object API endpoint
  
  // Si usas autenticación básica (solo para desarrollo)
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    // Para producción, usa OAuth2 o la autenticación que Liferay proporcione
  });

  constructor(private http: HttpClient) {
    // Detectar la URL base desde el contexto de Liferay si está disponible
    if (typeof (window as any).Liferay !== 'undefined') {
      const liferayUrl = (window as any).Liferay.ThemeDisplay.getPortalURL();
      this.baseUrl = `${liferayUrl}/o/c/quotations`;
    }
  }

  /**
   * Obtener headers con token CSRF para operaciones de escritura
   */
  private getHeadersWithCSRF(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Agregar token CSRF de Liferay si está disponible
    if (typeof (window as any).Liferay !== 'undefined') {
      const authToken = (window as any).Liferay.authToken;
      if (authToken) {
        headers = headers.set('x-csrf-token', authToken);
      }
    }

    return headers;
  }

  /**
   * Obtener todas las cotizaciones con paginación y filtros
   */
  getQuotations(page: number = 1, pageSize: number = 20, filter?: string): Observable<QuotationResponse> {
    let params: any = {
      page,
      pageSize
    };

    // NO enviar scopeKey - causa problemas con el listado
    // if (typeof (window as any).Liferay !== 'undefined') {
    //   const companyId = (window as any).Liferay.ThemeDisplay.getCompanyId();
    //   params.scopeKey = companyId;
    // }

    if (filter) {
      params.filter = filter;
    }

    // Usar headers con CSRF token (algunos sistemas Liferay lo requieren para GET)
    const headers = this.getHeadersWithCSRF();

    console.log('🔍 GET Quotations - URL:', this.baseUrl, 'Params:', params);

    return this.http.get<QuotationResponse>(this.baseUrl, { 
      headers,
      params 
    }).pipe(
      map(response => {
        console.log('✅ Datos REALES de Liferay - Total:', response.totalCount, 'Items:', response.items.length);
        return response;
      }),
      catchError(error => {
        console.error('❌ Error al obtener cotizaciones:', error);
        return of({ items: [], totalCount: 0, page: 1, pageSize: 20 });
      })
    );
  }

  /**
   * Obtener una cotización por ID
   */
  getQuotationById(id: number): Observable<Quotation | null> {
    return this.http.get<Quotation>(`${this.baseUrl}/${id}`, {
      headers: this.headers
    }).pipe(
      catchError(error => {
        console.error(`Error al obtener cotización ${id}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Crear una nueva cotización
   */
  createQuotation(quotation: Partial<Quotation>): Observable<Quotation | null> {
    const headers = this.getHeadersWithCSRF();
    
    // Asegurar que createdDate esté presente si es obligatorio en Liferay
    const quotationData = {
      ...quotation,
      createdDate: quotation.createdDate || new Date().toISOString()
    };
    
    console.log('📝 POST Quotation - URL:', this.baseUrl, 'Data:', quotationData);
    
    return this.http.post<Quotation>(this.baseUrl, quotationData, {
      headers
    }).pipe(
      map(response => {
        console.log('✅ Cotización creada:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Error al crear cotización:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualizar una cotización existente
   */
  updateQuotation(id: number, quotation: Partial<Quotation>): Observable<Quotation | null> {
    const headers = this.getHeadersWithCSRF();
    
    console.log('📝 PATCH Quotation - URL:', `${this.baseUrl}/${id}`, 'Data:', quotation);
    
    return this.http.patch<Quotation>(`${this.baseUrl}/${id}`, quotation, {
      headers
    }).pipe(
      map(response => {
        console.log('✅ Cotización actualizada:', response);
        return response;
      }),
      catchError(error => {
        console.error(`❌ Error al actualizar cotización ${id}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Eliminar una cotización
   */
  deleteQuotation(id: number): Observable<boolean> {
    const headers = this.getHeadersWithCSRF();
    
    console.log('🗑️ DELETE Quotation - URL:', `${this.baseUrl}/${id}`);
    
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers
    }).pipe(
      map(() => {
        console.log('✅ Cotización eliminada:', id);
        return true;
      }),
      catchError(error => {
        console.error(`❌ Error al eliminar cotización ${id}:`, error);
        return of(false);
      })
    );
  }

  /**
   * Obtener cotizaciones por estado
   */
  getQuotationsByStatus(quotationStatus: string): Observable<Quotation[]> {
    const filter = `quotationStatus eq '${quotationStatus}'`;
    return this.getQuotations(1, 100, filter).pipe(
      map(response => response.items)
    );
  }

  /**
   * Obtener estadísticas de cotizaciones
   */
  getQuotationStats(): Observable<any> {
    return this.getQuotations(1, 1000).pipe(
      map(response => {
        const quotations = response.items;
        return {
          totalQuotations: quotations.length,
          totalAmount: quotations.reduce((sum, q) => sum + q.amount, 0),
          approvedCount: quotations.filter(q => q.quotationStatus.key === 'approved').length,
          pendingCount: quotations.filter(q => q.quotationStatus.key === 'pending').length,
          rejectedCount: quotations.filter(q => q.quotationStatus.key === 'rejected').length,
          conversionRate: this.calculateConversionRate(quotations)
        };
      })
    );
  }

  private calculateConversionRate(quotations: Quotation[]): number {
    const total = quotations.length;
    if (total === 0) return 0;
    const approved = quotations.filter(q => q.quotationStatus.key === 'approved').length;
    return Math.round((approved / total) * 100);
  }
}
