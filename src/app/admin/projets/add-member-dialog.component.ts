import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AddMemberDialogData {
  availableEmployees: any[];
  projetDateDebut?: string;
  projetDateFin?: string;
}

@Component({
  selector: 'app-add-member-dialog',
  template: `
    <!-- Header -->
    <div class="dlg-header">
      <div class="dlg-icon">
        <mat-icon>person_add</mat-icon>
      </div>
      <div class="dlg-titles">
        <h2 class="dlg-title">Ajouter un membre</h2>
        <p class="dlg-sub">Affecter un employé à ce projet</p>
      </div>
      <button mat-icon-button class="dlg-close" (click)="cancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <!-- Body -->
    <mat-dialog-content class="dlg-body">
      <form [formGroup]="form">

        <!-- Employee select -->
        <mat-form-field appearance="outline" class="dlg-field-full">
          <mat-label>Employé</mat-label>
          <mat-select formControlName="employeeId">
            <mat-option
              *ngFor="let emp of data.availableEmployees"
              [value]="emp.id">
              <span class="opt-name">{{ emp.nom }} {{ emp.prenom }}</span>
              <span class="opt-cat"> — {{ emp.categorie?.nom }}</span>
            </mat-option>
            <mat-option *ngIf="data.availableEmployees.length === 0" disabled>
              Tous les employés sont déjà affectés
            </mat-option>
          </mat-select>
          <mat-icon matSuffix class="field-icon">person</mat-icon>
          <mat-error>Requis</mat-error>
        </mat-form-field>

        <!-- Dates -->
        <div class="dlg-date-row">
          <mat-form-field appearance="outline" class="dlg-date-field">
            <mat-label>Date début</mat-label>
            <input matInput [matDatepicker]="dpDebut" formControlName="dateDebut"
                   [min]="projetMinDate" [max]="projetMaxDate"
                   placeholder="JJ/MM/AAAA" />
            <mat-datepicker-toggle matSuffix [for]="dpDebut">
              <mat-icon matDatepickerToggleIcon>calendar_month</mat-icon>
            </mat-datepicker-toggle>
            <mat-datepicker #dpDebut></mat-datepicker>
            <mat-error>Requis</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="dlg-date-field">
            <mat-label>Date fin (optionnel)</mat-label>
            <input matInput [matDatepicker]="dpFin" formControlName="dateFin"
                   [min]="form.get('dateDebut')?.value || projetMinDate" [max]="projetMaxDate"
                   placeholder="JJ/MM/AAAA" />
            <mat-datepicker-toggle matSuffix [for]="dpFin">
              <mat-icon matDatepickerToggleIcon>calendar_month</mat-icon>
            </mat-datepicker-toggle>
            <mat-datepicker #dpFin></mat-datepicker>
          </mat-form-field>
        </div>

      </form>
    </mat-dialog-content>

    <!-- Footer -->
    <div class="dlg-footer">
      <button mat-button class="dlg-cancel-btn" (click)="cancel()">Annuler</button>
      <button mat-raised-button color="primary" class="dlg-confirm-btn"
              (click)="confirm()" [disabled]="form.invalid || data.availableEmployees.length === 0">
        <mat-icon>check</mat-icon> Confirmer
      </button>
    </div>
  `,
  styles: [`
    /* ── Dialog shell ─────────────────────────────────────── */
    :host {
      display: flex;
      flex-direction: column;
    }

    /* ── Header ───────────────────────────────────────────── */
    .dlg-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 22px 24px 16px;
      border-bottom: 1px solid #eef2f1;
    }

    .dlg-icon {
      width: 42px;
      height: 42px;
      min-width: 42px;
      border-radius: 12px;
      background: rgba(112, 193, 179, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dlg-icon mat-icon {
      font-size: 22px !important;
      width: 22px !important;
      height: 22px !important;
      color: #3b6064 !important;
    }

    .dlg-titles {
      flex: 1;
    }

    .dlg-title {
      margin: 0 0 2px;
      font-size: 15px;
      font-weight: 700;
      color: #1a2e2f;
    }

    .dlg-sub {
      margin: 0;
      font-size: 12px;
      color: #87bba2;
    }

    .dlg-close mat-icon {
      color: #87bba2 !important;
    }

    /* ── Body ─────────────────────────────────────────────── */
    .dlg-body {
      padding: 24px 24px 8px !important;
      max-height: unset !important;
      overflow: visible !important;
    }

    .dlg-field-full {
      width: 100%;
      margin-bottom: 4px;
    }

    .dlg-date-row {
      display: flex;
      gap: 14px;
    }

    .dlg-date-field {
      flex: 1;
      min-width: 0;
    }

    .field-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #87bba2 !important;
    }

    /* option text */
    .opt-name {
      font-weight: 500;
      color: #1a2e2f;
    }

    .opt-cat {
      font-size: 12px;
      color: #87bba2;
    }

    /* ── Footer ───────────────────────────────────────────── */
    .dlg-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 24px 20px;
      border-top: 1px solid #eef2f1;
    }

    .dlg-cancel-btn {
      color: #87bba2 !important;
      font-size: 13px !important;
    }

    .dlg-confirm-btn mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      margin-right: 4px;
    }
  `]
})
export class AddMemberDialogComponent {
  form: FormGroup;
  projetMinDate: Date | null = null;
  projetMaxDate: Date | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddMemberDialogData
  ) {
    if (data.projetDateDebut) this.projetMinDate = new Date(data.projetDateDebut);
    if (data.projetDateFin) this.projetMaxDate = new Date(data.projetDateFin);

    // Default dateDebut to today, but respect the minimum date constraint
    const today = new Date();
    let initialDateDebut = today;
    if (this.projetMinDate && today < this.projetMinDate) {
      initialDateDebut = this.projetMinDate;
    }
    if (this.projetMaxDate && today > this.projetMaxDate) {
      initialDateDebut = this.projetMaxDate;
    }

    this.form = this.fb.group({
      employeeId: [null, Validators.required],
      dateDebut:  [initialDateDebut, Validators.required],
      dateFin:    [data.projetDateFin ? new Date(data.projetDateFin) : null],
    });
  }

  confirm(): void {
    if (this.form.invalid) return;
    const raw = this.form.value;
    this.dialogRef.close({
      employeeId: raw.employeeId,
      dateDebut:  this.formatDate(raw.dateDebut),
      dateFin:    this.formatDate(raw.dateFin),
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  /** Convert JS Date → YYYY-MM-DD string */
  private formatDate(d: any): string | null {
    if (!d) return null;
    if (typeof d === 'string') return d;
    const date = new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
