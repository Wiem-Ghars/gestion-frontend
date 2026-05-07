import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin } from '../models/admin';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'https://backendjee-production.up.railway.app/api/admins';

  constructor(private http: HttpClient) {}

  // Used once to seed the first admin
  create(admin: Admin): Observable<any> {
    return this.http.post<any>(this.apiUrl, admin);
  }
}