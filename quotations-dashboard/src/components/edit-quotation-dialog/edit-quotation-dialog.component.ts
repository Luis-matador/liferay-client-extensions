import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { Quotation } from '../../services/liferay-api.service';
import { formatCurrency } from '../../utils/format.utils';

@Component({
  selector: 'app-edit-quotation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ],
  templateUrl: './edit-quotation-dialog.component.html',
  styleUrls: ['./edit-quotation-dialog.component.scss']
})
export class EditQuotationDialogComponent implements OnInit {
  quotationForm: FormGroup;
  
  // Exponer utilidad para uso en template
  formatCurrency = formatCurrency;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Quotation,
    private dialogRef: MatDialogRef<EditQuotationDialogComponent>,
    private fb: FormBuilder
  ) {
    this.quotationForm = this.fb.group({
      clientName: [data.clientName, Validators.required],
      clientEmail: [data.clientEmail, [Validators.required, Validators.email]],
      projectName: [data.projectName],
      description: [data.description],
      amount: [data.amount, [Validators.required, Validators.min(0)]],
      quotationStatus: [data.quotationStatus.key, Validators.required],
      quotationPriority: [data.quotationPriority?.key || 'medium'],
      createdDate: [new Date(data.createdDate), Validators.required]
    });
  }

  ngOnInit(): void { }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.quotationForm.valid) {
      const formValue = { ...this.quotationForm.value };

      // Convertir la fecha a formato ISO string
      if (formValue.createdDate instanceof Date) {
        formValue.createdDate = formValue.createdDate.toISOString();
      }

      this.dialogRef.close(formValue);
    }
  }
}
