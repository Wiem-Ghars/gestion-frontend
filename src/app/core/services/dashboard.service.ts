import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from '../models/projet';

export interface CategoryStat {
  categorie: string | { id: number; nom: string };
  count: number;
}

export interface DashboardStats {
  totalEmployees: number;
  totalProjets: number;
  totalCategories: number;
  projetsEnAttente: number;
  projetsEnCours: number;
  projetsTermines: number;
  employeesPerCategory: CategoryStat[] | { [key: string]: number };
  unassignedEmployees?: number;
  projetsEndingSoon?: Projet[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'https://backendjee-production.up.railway.app/api/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.apiUrl);
  }
}
