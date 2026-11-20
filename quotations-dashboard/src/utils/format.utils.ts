/**
 * Utilidades compartidas para formatear datos
 */

/**
 * Formatea un monto a moneda EUR con formato español
 */
export function formatCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  } catch (e) {
    return `€${amount || 0}`;
  }
}

/**
 * Formatea una fecha a formato español (DD/MM/YYYY)
 */
export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  } catch (e) {
    return date?.toString() || '';
  }
}

/**
 * Obtiene el nombre del estado en español
 */
export function getStatusName(key: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Borrador',
    pending: 'Pendiente',
    revision: 'En Revisión',
    approved: 'Aprobada',
    rejected: 'Rechazada'
  };
  return statusMap[key] || key;
}

/**
 * Obtiene el nombre de la prioridad en español
 */
export function getPriorityName(key: string): string {
  const priorityMap: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  };
  return priorityMap[key] || key;
}

/**
 * Obtiene el color para el estado
 */
export function getStatusColor(key: string): string {
  const colorMap: Record<string, string> = {
    draft: '#95a5a6',
    pending: '#3498db',
    revision: '#f39c12',
    approved: '#27ae60',
    rejected: '#e74c3c'
  };
  return colorMap[key] || '#95a5a6';
}

/**
 * Obtiene el color para la prioridad
 */
export function getPriorityColor(key: string): string {
  const colorMap: Record<string, string> = {
    low: '#27ae60',
    medium: '#f39c12',
    high: '#e67e22',
    urgent: '#e74c3c'
  };
  return colorMap[key] || '#95a5a6';
}
