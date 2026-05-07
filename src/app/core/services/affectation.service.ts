import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Affectation } from '../models/affectation';

@Injectable({
  providedIn: 'root'
})
export class AffectationService {

  private apiUrl = 'https://backendjee-production.up.railway.app/api/affectations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Affectation[]> {
    return this.http.get<any>(`${this.apiUrl}?page=0&size=100`).pipe(
      map(data => data.content ?? data)
    );
  }

  // Get all affectations for a specific project
  getByProjet(projetId: number): Observable<Affectation[]> {
    return this.http.get<Affectation[]>(
      `${this.apiUrl}/projet/${projetId}`);
  }

  create(affectation: Affectation): Observable<Affectation> {
    return this.http.post<Affectation>(this.apiUrl, affectation);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}