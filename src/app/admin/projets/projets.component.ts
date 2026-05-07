import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ProjetService } from '../../core/services/projet.service';
import { AffectationService } from '../../core/services/affectation.service';
import { EmployeeService } from '../../core/services/employee.service';
import { AddMemberDialogComponent } from './add-member-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { Projet } from '../../core/models/projet';
import { Employee } from '../../core/models/employee';
import { Affectation } from '../../core/models/affectation';

@Component({
  selector: 'app-projets',
  templateUrl: './projets.component.html',
  styleUrls: ['./projets.component.css'],
})
export class ProjetsComponent implements OnInit {

  // ── Project list ───────────────────────────────────────────────
  projets: any[] = [];
  loading = true;
  error = '';
  success = '';

  // ── Project create / edit form ─────────────────────────────────
  showProjectForm = false;
  editingId: number | null = null;
  projectForm: FormGroup;

  // ── Selected project detail ────────────────────────────────────
  selectedProjet: any = null;
  teamAffectations: any[] = [];
  isLoadingTeam = false;
  teamColumns = ['employee', 'dates', 'removeAction'];

  // ── Status filter ──────────────────────────────────────────────
  statusFilter: 'all' | 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' = 'all';

  get filteredProjets(): any[] {
    if (this.statusFilter === 'all') return this.projets;
    return this.projets.filter(p => p.statut === this.statusFilter);
  }

  get countAttente(): number { return this.projets.filter(p => p.statut === 'EN_ATTENTE').length; }
  get countCours():   number { return this.projets.filter(p => p.statut === 'EN_COURS').length; }
  get countTermine(): number { return this.projets.filter(p => p.statut === 'TERMINE').length; }

  setStatusFilter(f: 'all' | 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE'): void {
    if (this.statusFilter === f) return;
    this.statusFilter = f;
    this.pageIndex    = 0;
  }

  // ── Project list pagination ────────────────────────────────────
  pageIndex       = 0;
  pageSize        = 8;
  pageSizeOptions = [8, 16, 32];

  get pagedProjets(): any[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredProjets.slice(start, start + this.pageSize);
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
  }

  // ── Employee cache (loaded lazily on first dialog open) ────────
  allEmployees: any[] = [];
  private employeesLoaded = false;

  constructor(
    private projetService: ProjetService,
    private affectationService: AffectationService,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.projectForm = this.fb.group({
      nom:         ['', Validators.required],
      description: [''],
      dateDebut:   [null, Validators.required],
      dateFin:     [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.load();
  }

  // ── Load project list ──────────────────────────────────────────
  load(): void {
    this.loading = true;
    this.projetService.getAll().subscribe({
      next: (data) => { this.projets = data; this.pageIndex = 0; this.loading = false; },
      error: () => { this.error = 'Erreur de chargement.'; this.loading = false; },
    });
  }

  private loadEmployees(callback: () => void): void {
    if (this.employeesLoaded) { callback(); return; }
    this.employeeService.getAll().subscribe({
      next: (data) => { this.allEmployees = data; this.employeesLoaded = true; callback(); },
      error: () => { callback(); },
    });
  }

  // Employees not yet assigned to this project
  get availableEmployees(): any[] {
    const assigned = new Set(this.teamAffectations.map(a => a.employee?.id));
    return this.allEmployees.filter(e => !assigned.has(e.id));
  }

  // ── Select project → load its team ────────────────────────────
  selectProject(projet: any): void {
    this.selectedProjet = projet;
    this.error = '';
    this.success = '';
    this.loadTeam(projet.id);
  }

  loadTeam(projetId: number): void {
    this.isLoadingTeam = true;
    this.affectationService.getByProjet(projetId).subscribe({
      next: (data) => { this.teamAffectations = data; this.isLoadingTeam = false; },
      error: () => { this.isLoadingTeam = false; },
    });
  }

  // ── Open add-member dialog ─────────────────────────────────────
  openAddMember(): void {
    this.loadEmployees(() => {
      const ref = this.dialog.open(AddMemberDialogComponent, {
        width: '480px',
        panelClass: 'add-member-panel',
        data: {
          availableEmployees: this.availableEmployees,
          projetDateDebut: this.selectedProjet?.dateDebut,
          projetDateFin: this.selectedProjet?.dateFin,
        },
      });

      ref.afterClosed().subscribe(result => {
        if (!result) return;
        this.addMember(result);
      });
    });
  }

  // ── Add member (called with dialog result) ─────────────────────
  private addMember(data: { employeeId: number; dateDebut: string; dateFin?: string }): void {
    this.error = '';
    const payload: any = {
      employee: { id: data.employeeId },
      projet:   { id: this.selectedProjet.id },
      dateDebut: data.dateDebut,
    };
    if (data.dateFin) {
      payload.dateFin = data.dateFin;
    }

    this.affectationService.create(payload as any).subscribe({
      next: () => {
        this.success = 'Membre ajouté au projet.';
        this.loadTeam(this.selectedProjet.id);
      },
      error: (err) => {
        this.error = err.status === 409
          ? 'Cet employé est déjà affecté à ce projet.'
          : 'Erreur lors de l\'ajout du membre.';
      },
    });
  }

  // ── Remove member ──────────────────────────────────────────────
  removeMember(affectationId: number): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Retirer le membre', message: 'Ce membre sera retiré du projet.', confirmLabel: 'Retirer' },
      panelClass: 'confirm-dialog-panel',
      width: '400px',
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.affectationService.delete(affectationId).subscribe({
        next: () => {
          this.success = 'Membre retiré du projet.';
          this.loadTeam(this.selectedProjet.id);
        },
        error: () => { this.error = 'Erreur lors du retrait du membre.'; },
      });
    });
  }

  // ── Project CRUD ───────────────────────────────────────────────
  openCreate(): void {
    this.editingId = null;
    this.projectForm.reset();
    this.showProjectForm = true;
    this.error = '';
    this.success = '';
  }

  openEdit(projet: any, event: Event): void {
    event.stopPropagation();
    this.editingId = projet.id;
    this.projectForm.setValue({
      nom:         projet.nom,
      description: projet.description ?? '',
      dateDebut:   projet.dateDebut ? new Date(projet.dateDebut) : null,
      dateFin:     projet.dateFin   ? new Date(projet.dateFin)   : null,
    });
    this.showProjectForm = true;
    this.error = '';
    this.success = '';
  }

  cancelProjectForm(): void {
    this.showProjectForm = false;
    this.editingId = null;
    this.projectForm.reset();
  }

  submitProject(): void {
    if (this.projectForm.invalid) {
      console.log('Form invalid!');
      console.log('nom:', this.projectForm.get('nom')?.errors);
      console.log('description:', this.projectForm.get('description')?.errors);
      console.log('dateDebut:', this.projectForm.get('dateDebut')?.errors);
      console.log('dateFin:', this.projectForm.get('dateFin')?.errors);
      alert('Le formulaire est invalide. Vérifiez la console (F12) pour plus de détails.');
      return;
    }
    const raw = this.projectForm.value;

    const payload: any = {
      nom: raw.nom,
      description: raw.description,
      dateDebut: this.formatDate(raw.dateDebut),
      dateFin:   this.formatDate(raw.dateFin)
    };

    if (this.editingId) {
      this.projetService.update(this.editingId, payload).subscribe({
        next: () => { this.success = 'Projet mis à jour.'; this.cancelProjectForm(); this.load(); },
        error: (err) => { 
          console.error('Backend error on update:', err);
          this.error = 'Erreur lors de la mise à jour (voir console).'; 
        },
      });
    } else {
      this.projetService.create(payload).subscribe({
        next: () => { this.success = 'Projet créé.'; this.cancelProjectForm(); this.load(); },
        error: (err) => { 
          console.error('Backend error on create:', err);
          this.error = 'Erreur lors de la création (voir console).'; 
        },
      });
    }
  }

  deleteProject(id: number, event: Event): void {
    event.stopPropagation();
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Supprimer le projet', message: 'Cette action est irréversible. Le projet sera définitivement supprimé.' },
      panelClass: 'confirm-dialog-panel',
      width: '400px',
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.projetService.delete(id).subscribe({
        next: () => {
          this.success = 'Projet supprimé.';
          if (this.selectedProjet?.id === id) this.selectedProjet = null;
          this.load();
        },
        error: (err) => {
          this.error = err.status === 409
            ? 'Impossible de supprimer : des affectations existent pour ce projet.'
            : 'Erreur lors de la suppression.';
        },
      });
    });
  }

  // ── Status helpers ─────────────────────────────────────────────
  statutLabel(statut: string): string {
    const map: Record<string, string> = { EN_ATTENTE: 'En attente', EN_COURS: 'En cours', TERMINE: 'Terminé' };
    return map[statut] ?? statut;
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = { EN_ATTENTE: 'chip-attente', EN_COURS: 'chip-cours', TERMINE: 'chip-termine' };
    return map[statut] ?? '';
  }

  initials(emp: any): string {
    return `${emp?.nom?.charAt(0) ?? ''}${emp?.prenom?.charAt(0) ?? ''}`.toUpperCase();
  }

  // ── Date helpers ───────────────────────────────────────────────
  countdownClass(jours: number | undefined): string {
    if (jours == null) return '';
    if (jours <= 7)  return 'countdown-urgent';
    if (jours <= 30) return 'countdown-warning';
    return 'countdown-ok';
  }

  /** Convert JS Date → YYYY-MM-DD string for the backend */
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
