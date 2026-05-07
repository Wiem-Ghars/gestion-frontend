import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="cd-header">
      <div class="cd-icon-ring">
        <mat-icon class="cd-icon">delete_outline</mat-icon>
      </div>
    </div>

    <mat-dialog-content class="cd-content">
      <h2 class="cd-title">{{ data.title }}</h2>
      <p class="cd-message">{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions class="cd-actions" align="center">
      <button mat-stroked-button class="cd-cancel-btn" (click)="ref.close(false)">
        Annuler
      </button>
      <button mat-raised-button class="cd-confirm-btn" (click)="ref.close(true)">
        <mat-icon class="cd-confirm-icon">delete</mat-icon>
        {{ data.confirmLabel || 'Supprimer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    /* ── Header band ─────────────────────────────────────── */
    .cd-header {
      display: flex;
      justify-content: center;
      padding: 28px 28px 0;
    }

    .cd-icon-ring {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(163, 45, 45, 0.08);
      border: 1.5px solid rgba(163, 45, 45, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cd-icon {
      font-size: 26px !important;
      width: 26px !important;
      height: 26px !important;
      color: #A32D2D !important;
    }

    /* ── Content ──────────────────────────────────────────── */
    .cd-content {
      text-align: center;
      padding: 18px 28px 8px !important;
      max-height: none !important;
    }

    .cd-title {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
      color: #1a2e2f;
      font-family: 'Inter', system-ui, sans-serif;
    }

    .cd-message {
      margin: 0;
      font-size: 13px;
      color: #5a7a7c;
      line-height: 1.65;
      font-family: 'Inter', system-ui, sans-serif;
    }

    /* ── Actions ──────────────────────────────────────────── */
    .cd-actions {
      padding: 20px 28px 24px !important;
      gap: 10px;
      min-height: unset !important;
    }

    /* Cancel — stroked teal */
    .cd-cancel-btn {
      --mdc-outlined-button-container-shape: 9px !important;
      --mdc-outlined-button-outline-color: #b0d4cc !important;
      color: #3b6064 !important;
      font-family: 'Inter', system-ui, sans-serif !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      letter-spacing: 0.01em !important;
      padding: 0 20px !important;
      background-color: #ffffff !important;
    }

    .cd-cancel-btn:hover:not(:disabled) {
      background: rgba(112, 193, 179, 0.08) !important;
    }

    /* Confirm — red raised */
    .cd-confirm-btn {
      --mdc-protected-button-container-color: #A32D2D !important;
      --mdc-protected-button-label-text-color: #ffffff !important;
      --mdc-protected-button-container-shape: 9px !important;
      font-family: 'Inter', system-ui, sans-serif !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      letter-spacing: 0.01em !important;
      box-shadow: none !important;
      padding: 0 20px !important;
    }

    .cd-confirm-btn:hover:not(:disabled) {
      --mdc-protected-button-container-color: #8e2626 !important;
      box-shadow: 0 3px 10px rgba(163, 45, 45, 0.28) !important;
    }

    .cd-confirm-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      margin-right: 4px;
      vertical-align: middle;
    }
  `],
})
export class ConfirmDialogComponent {
  constructor(
    public ref: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}
}
