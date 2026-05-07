import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService }    from '../../core/services/employee.service';
import { CategorieService }   from '../../core/services/categorie.service';
import { AffectationService } from '../../core/services/affectation.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { Employee } from '../../core/models/employee';
import { Categorie } from '../../core/models/categorie';
import { Affectation } from '../../core/models/affectation';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  categories: Categorie[] = [];
  loading = true;
  error = '';
  success = '';
  hidePassword = true;

  showForm  = false;
  editingId: number | null = null;
  form: FormGroup;

  // ── Filter ─────────────────────────────────────────────────────
  filterMode: 'all' | 'assigned' | 'unassigned' = 'all';
  assignedEmployeeIds = new Set<number>();

  get filteredEmployees(): Employee[] {
    if (this.filterMode === 'all')        return this.employees;
    if (this.filterMode === 'assigned')   return this.employees.filter(e =>  e.id != null && this.assignedEmployeeIds.has(e.id));
    /* unassigned */                      return this.employees.filter(e => e.id != null && !this.assignedEmployeeIds.has(e.id));
  }

  get assignedCount(): number {
    return this.employees.filter(e => e.id != null && this.assignedEmployeeIds.has(e.id)).length;
  }

  get unassignedCount(): number {
    return this.employees.filter(e => e.id != null && !this.assignedEmployeeIds.has(e.id)).length;
  }

  setFilter(mode: 'all' | 'assigned' | 'unassigned'): void {
    if (this.filterMode === mode) return;
    this.filterMode = mode;
    this.pageIndex  = 0;
  }

  // ── Table columns ──────────────────────────────────────────────
  displayedColumns      = ['employee', 'email', 'categorie', 'actions'];
  displayedColumnsSplit = ['employee', 'actions'];

  // ── Pagination ─────────────────────────────────────────────────
  pageIndex       = 0;
  pageSize        = 10;
  pageSizeOptions = [5, 10, 25];

  get pagedEmployees(): any[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredEmployees.slice(start, start + this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
  }

  constructor(
    private employeeService:    EmployeeService,
    private categorieService:   CategorieService,
    private affectationService: AffectationService,
    private fb:                 FormBuilder,
    private dialog:             MatDialog,
    private route:              ActivatedRoute,
  ) {
    this.form = this.fb.group({
      nom:         ['', Validators.required],
      prenom:      ['', Validators.required],
      email:       ['', [Validators.required, Validators.email]],
      motDePasse:  [''],
      categorieId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.load();
    this.loadAffectations();

    // Activate unassigned filter if navigated from dashboard
    this.route.queryParamMap.pipe(take(1)).subscribe(params => {
      if (params.get('unassigned') === 'true') {
        this.filterMode = 'unassigned';
      }
    });
  }

  load(): void {
    this.loading = true;
    this.employeeService.getAll().subscribe({
      next: (data) => { this.employees = data; this.pageIndex = 0; this.loading = false; },
      error: () => { this.error = 'Erreur de chargement.'; this.loading = false; },
    });
  }

  loadCategories(): void {
    this.categorieService.getAll().subscribe({
      next: (data) => (this.categories = data),
      error: () => {},
    });
  }

  loadAffectations(): void {
    this.affectationService.getAll().subscribe({
      next: (data) => {
        this.assignedEmployeeIds = new Set<number>(
          data.map((a: any) => a.employee?.id).filter((id: any) => id != null)
        );
      },
      error: () => {},
    });
  }

  getCategoryName(emp: any): string {
    if (emp.categorie?.nom) return emp.categorie.nom;
    const cat = this.categories.find(c => c.id === emp.categorieId);
    return cat ? cat.nom : '—';
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset();
    this.hidePassword = true;
    this.form.get('motDePasse')!.setValidators(Validators.required);
    this.form.get('motDePasse')!.updateValueAndValidity();
    this.showForm = true;
    this.error   = '';
    this.success = '';
  }

  openEdit(emp: any): void {
    this.editingId = emp.id;
    this.hidePassword = true;
    this.form.get('motDePasse')!.clearValidators();
    this.form.get('motDePasse')!.updateValueAndValidity();
    this.form.patchValue({
      nom:         emp.nom,
      prenom:      emp.prenom,
      email:       emp.email,
      motDePasse:  '',
      categorieId: emp.categorie?.id ?? emp.categorieId,
    });
    this.showForm = true;
    this.error   = '';
    this.success = '';
  }

  cancel(): void {
    this.showForm  = false;
    this.editingId = null;
    this.hidePassword = true;
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) return;

    const payload: any = {
      nom:       this.form.value.nom,
      prenom:    this.form.value.prenom,
      email:     this.form.value.email,
      categorie: { id: this.form.value.categorieId },
    };
    if (this.form.value.motDePasse) {
      payload.motDePasse = this.form.value.motDePasse;
    }

    if (this.editingId) {
      this.employeeService.update(this.editingId, payload).subscribe({
        next: () => { this.success = 'Employé mis à jour.'; this.cancel(); this.load(); this.loadAffectations(); },
        error: () => { this.error = 'Erreur lors de la mise à jour.'; },
      });
    } else {
      this.employeeService.create(payload).subscribe({
        next: () => { this.success = 'Employé créé.'; this.cancel(); this.load(); this.loadAffectations(); },
        error: () => { this.error = 'Erreur lors de la création.'; },
      });
    }
  }

  delete(id: number): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Supprimer l\'employé', message: 'Cette action est irréversible. L\'employé sera définitivement supprimé.' },
      panelClass: 'confirm-dialog-panel',
      width: '400px',
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.employeeService.delete(id).subscribe({
        next: () => { this.success = 'Employé supprimé.'; this.load(); this.loadAffectations(); },
        error: () => { this.error = 'Erreur lors de la suppression.'; },
      });
    });
  }
}
