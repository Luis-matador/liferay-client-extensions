import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-quotation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './create-quotation-dialog.component.html',
  styleUrls: ['./create-quotation-dialog.component.scss']
})
export class CreateQuotationDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateQuotationDialogComponent>);

  quotationForm: FormGroup;

  constructor() {
    this.quotationForm = this.fb.group({
      clientName: ['', [Validators.required, Validators.minLength(3)]],
      clientEmail: ['', [Validators.required, Validators.email]],
      projectName: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      quotationStatus: ['draft', Validators.required],
      quotationPriority: ['medium']
    });
  }

  onSubmit(): void {
    if (this.quotationForm.valid) {
      const formData = this.quotationForm.value;
      
      // Preparar datos para enviar a Liferay
      const quotationData = {
        ...formData,
        createdDate: new Date().toISOString()
      };

      this.dialogRef.close(quotationData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
