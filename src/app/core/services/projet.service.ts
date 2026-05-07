import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Projet } from '../models/projet';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {

  private apiUrl = `${environment.apiUrl}/projets`;

  constructor(private http: HttpClient) {}

  getAll(statut?: string): Observable<Projet[]> {
    const url = statut ? `${this.apiUrl}?page=0&size=100&statut=${statut}` : `${this.apiUrl}?page=0&size=100`;
    return this.http.get<any>(url).pipe(
      map(data => data.content ?? data)
    );
  }

  getById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.apiUrl}/${id}`);
  }

  // Employee: get only their assigned projects
  getMine(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.apiUrl}/mine`);
  }

  create(projet: Projet): Observable<Projet> {
    return this.http.post<Projet>(this.apiUrl, projet);
  }

  update(id: number, projet: Projet): Observable<Projet> {
    return this.http.put<Projet>(`${this.apiUrl}/${id}`, projet);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}