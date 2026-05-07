import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CategorieService } from '../../core/services/categorie.service';
import { EmployeeService } from '../../core/services/employee.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  loading = true;
  error = '';
  success = '';

  showForm = false;
  editingId: number | null = null;
  form: FormGroup;
  employeeCountMap: { [catId: number]: number | undefined } = {};

  displayedColumns = ['id', 'nom', 'actions'];

  pageIndex       = 0;
  pageSize        = 9;
  pageSizeOptions = [9, 18, 36];

  selectedCategory: any = null;
  categoryEmployees: any[] = [];
  isLoadingEmployees = false;

  get pagedCategories(): any[] {
    const start = this.pageIndex * this.pageSize;
    return this.categories.slice(start, start + this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
  }

  constructor(
    private categorieService: CategorieService,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    this.load();
  }

load(): void {
  this.loading = true;
  this.categorieService.getAll().subscribe({
    next: (data) => {
      this.categories = data;
      this.pageIndex = 0;
      this.loading = false;
      if (this.selectedCategory) {
        this.selectCategory(this.categories.find(c => c.id === this.selectedCategory.id));
      }
      this.buildCountMap();
    },
    error: () => { this.error = 'Erreur de chargement.'; this.loading = false; },
  });
}

  selectCategory(cat: any): void {
    if (!cat) return;
    this.selectedCategory = cat;
    this.isLoadingEmployees = true;
    this.categoryEmployees = [];
    
    // Attempting to fetch employees with this category
    // Since employee.service has getByCategorie? wait let's use getAll and filter if not existent
    this.employeeService.getAll().subscribe({
      next: (emps) => {
        this.categoryEmployees = emps.filter(e => e.categorie?.id === cat.id);
        this.isLoadingEmployees = false;
      },
      error: () => {
        // Fallback or handle error
        this.isLoadingEmployees = false;
      }
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset();
    this.showForm = true;
    this.error = '';
    this.success = '';
  }

  openEdit(cat: any): void {
    this.editingId = cat.id;
    this.form.setValue({ nom: cat.nom });
    this.showForm = true;
    this.error = '';
    this.success = '';
  }

  cancel(): void {
    this.showForm = false;
    this.editingId = null;
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) return;
    const payload = this.form.value;

    if (this.editingId) {
      this.categorieService.update(this.editingId, payload).subscribe({
        next: () => { this.success = 'Catégorie mise à jour.'; this.cancel(); this.load(); },
        error: () => { this.error = 'Erreur lors de la mise à jour.'; },
      });
    } else {
      this.categorieService.create(payload).subscribe({
        next: () => { this.success = 'Catégorie créée.'; this.cancel(); this.load(); },
        error: () => { this.error = 'Erreur lors de la création.'; },
      });
    }
  }

  readonly AVATAR_CLASSES = [
    'avatar-teal', 'avatar-green', 'avatar-blue',
    'avatar-purple', 'avatar-amber', 'avatar-rose',
  ];

  avatarClass(index: number): string {
    return this.AVATAR_CLASSES[index % this.AVATAR_CLASSES.length];
  }

  delete(id: number): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Supprimer la catégorie', message: 'Cette action est irréversible. La catégorie sera définitivement supprimée.' },
      panelClass: 'confirm-dialog-panel',
      width: '400px',
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.categorieService.delete(id).subscribe({
        next: () => { this.success = 'Catégorie supprimée.'; this.load(); },
        error: () => { this.error = 'Erreur lors de la suppression.'; },
      });
    });
  }
  buildCountMap(): void {
  this.employeeService.getAll().subscribe({
    next: (emps) => {
      this.employeeCountMap = {};
      emps.forEach(e => {
        const catId = e.categorie?.id;
        if (catId != null) {
          this.employeeCountMap[catId] = (this.employeeCountMap[catId] ?? 0) + 1;
        }
      });
    }
  });
}

get showPaginator(): boolean {
  return this.categories.length > this.pageSize;
}

}