import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Quotation } from '../../services/liferay-api.service';
import { formatCurrency, formatDate } from '../../utils/format.utils';

@Component({
  selector: 'app-view-quotation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './view-quotation-dialog.component.html',
  styleUrls: ['./view-quotation-dialog.component.scss']
})
export class ViewQuotationDialogComponent {
  // Exponer funciones de utilidades para uso en template
  formatCurrency = formatCurrency;
  formatDate = formatDate;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Quotation,
    private dialogRef: MatDialogRef<ViewQuotationDialogComponent>
  ) { }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      approved: 'accent',
      revision: 'primary',
      pending: 'warn',
      draft: '',
      rejected: ''
    };
    return colors[status] || '';
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      urgent: 'warn',
      high: 'accent',
      medium: 'primary',
      low: ''
    };
    return colors[priority] || '';
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    this.dialogRef.close('edit');
  }
}
