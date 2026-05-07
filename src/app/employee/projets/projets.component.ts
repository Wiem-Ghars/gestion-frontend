import { Component, OnInit } from '@angular/core';
import { AuthService }        from '../../core/services/auth.service';
import { ProjetService }      from '../../core/services/projet.service';
import { AffectationService } from '../../core/services/affectation.service';
import { Projet }             from '../../core/models/projet';
import { Affectation }        from '../../core/models/affectation';
import { AuthResponse }       from '../../core/models/auth-response';

@Component({
  selector: 'app-projets',
  templateUrl: './projets.component.html',
  styleUrls: ['./projets.component.css']
})
export class ProjetsComponent implements OnInit {

  // ── Data ──────────────────────────────────────────────────────────────────
  projets: Projet[] = [];
  selectedProjet: Projet | null = null;
  teamAffectations: Affectation[] = [];
  currentUser: AuthResponse | null = null;

  // ── Loading / error ───────────────────────────────────────────────────────
  isLoadingProjects = false;
  isLoadingTeam     = false;
  errorMsg          = '';

  // ── Table columns ─────────────────────────────────────────────────────────
  displayedColumns: string[] = ['nom', 'email', 'dates'];

  // ── Pagination ────────────────────────────────────────────────────────────
  pageSize         = 5;
  pageIndex        = 0;
  pageSizeOptions  = [5, 10, 20];

  get pagedProjets(): Projet[] {
    const start = this.pageIndex * this.pageSize;
    return this.projets.slice(start, start + this.pageSize);
  }

  get totalProjets(): number {
    return this.projets.length;
  }

  constructor(
    private authService:        AuthService,
    private projetService:      ProjetService,
    private affectationService: AffectationService
  ) {}

  ngOnInit(): void {
    // Current user comes from localStorage — no HTTP call needed
    this.currentUser = this.authService.getCurrentUser();
    this.loadProjects();
  }

  // ── Load employee's assigned projects ─────────────────────────────────────
  loadProjects(): void {
    this.isLoadingProjects = true;
    this.errorMsg = '';

    this.projetService.getMine().subscribe({
      next: data => {
        this.projets           = data;
        this.isLoadingProjects = false;

        // Auto-select first project
        if (data.length > 0) {
          this.selectProject(data[0]);
        }
      },
      error: () => {
        this.errorMsg          = 'Impossible de charger vos projets. Veuillez réessayer.';
        this.isLoadingProjects = false;
      }
    });
  }

  // ── Select a project and load its team ───────────────────────────────────
  selectProject(projet: Projet): void {
    this.selectedProjet   = projet;
    this.teamAffectations = [];
    this.isLoadingTeam    = true;

    this.affectationService.getByProjet(projet.id!).subscribe({
      next: data => {
        this.teamAffectations = data;
        this.isLoadingTeam    = false;
      },
      error: () => {
        this.teamAffectations = [];
        this.isLoadingTeam    = false;
      }
    });
  }

  // ── Pagination handler ────────────────────────────────────────────────────
  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
  }

  // ── "Vous" badge helper ───────────────────────────────────────────────────
  isCurrentUser(affectation: Affectation): boolean {
    return !!this.currentUser && affectation.employee.id === this.currentUser.id;
  }

  // ── Countdown class helper ────────────────────────────────────────────────
  countdownClass(jours: number | undefined): string {
    if (jours == null) return '';
    if (jours <= 7)  return 'countdown-urgent';
    if (jours <= 30) return 'countdown-warning';
    return 'countdown-ok';
  }

  // ── TrackBy helpers ───────────────────────────────────────────────────────
  trackByProjectId(_: number, p: Projet):         number { return p.id!; }
  trackByAffectationId(_: number, a: Affectation): number { return a.id!; }
}
