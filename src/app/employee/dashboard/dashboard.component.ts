import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ProjetService } from '../../core/services/projet.service';
import { Projet } from '../../core/models/projet';
import { AuthResponse } from '../../core/models/auth-response';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentUser: AuthResponse | null = null;
  projets: Projet[] = [];
  isLoading = true;
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private projetService: ProjetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProjets();
  }

  loadProjets(): void {
    this.isLoading = true;
    this.projetService.getMine().subscribe({
      next: (data) => { this.projets = data; this.isLoading = false; },
      error: () => { this.errorMsg = 'Impossible de charger vos projets.'; this.isLoading = false; }
    });
  }

  openProjet(projet: Projet): void {
    if (typeof projet.id === 'number') {
      this.router.navigate(['/employee/projets']);
    }
  }

  statutLabel(statut?: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'En attente',
      EN_COURS:   'En cours',
      TERMINE:    'Terminé',
    };
    return statut ? (map[statut] ?? statut) : '';
  }

  statutClass(statut?: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'chip-attente',
      EN_COURS:   'chip-cours',
      TERMINE:    'chip-termine',
    };
    return statut ? (map[statut] ?? '') : '';
  }

  countdownClass(jours: number | undefined): string {
    if (jours == null) return '';
    if (jours <= 7)  return 'countdown-urgent';
    if (jours <= 30) return 'countdown-warning';
    return 'countdown-ok';
  }

  get enCours(): number  { return this.projets.filter(p => p.statut === 'EN_COURS').length; }
  get enAttente(): number { return this.projets.filter(p => p.statut === 'EN_ATTENTE').length; }
  get termines(): number  { return this.projets.filter(p => p.statut === 'TERMINE').length; }
  get urgent(): number    { return this.projets.filter(p => p.statut !== 'TERMINE' && p.joursRestants != null && p.joursRestants <= 7).length; }
}
