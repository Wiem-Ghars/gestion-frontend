import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  /*
   * Keys used to persist auth state in localStorage.
   * localStorage persists across page refreshes — the user
   * stays logged in even if they close and reopen the browser.
   */
  private readonly USER_KEY  = 'currentUser';
  private readonly TOKEN_KEY = 'authToken';

  constructor(private http: HttpClient) {}

  // ── LOGIN ─────────────────────────────────────────────────────
  /*
   * Sends email + password to the backend.
   * The backend now returns a JWT token alongside the user info.
   * tap() runs a side effect — stores user + token in localStorage.
   */
  login(email: string, motDePasse: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`,
      { email, motDePasse }
    ).pipe(
      tap(user => this.storeSession(user))
    );
  }

  // ── LOGOUT ────────────────────────────────────────────────────
  /*
   * JWT logout is purely client-side — discard the token.
   * No backend call needed (stateless auth).
   */
  logout(): Observable<any> {
    this.clearSession();
    return of(null);
  }

  // ── TOKEN ─────────────────────────────────────────────────────
  /*
   * Returns the stored JWT token.
   * Used by the AuthInterceptor to attach the Bearer header.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ── CURRENT USER ──────────────────────────────────────────────
  getCurrentUser(): AuthResponse | null {
    const stored = localStorage.getItem(this.USER_KEY);
    if (!stored) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(stored);

      if (this.isValidAuthResponse(parsed)) {
        return parsed;
      }

      this.clearSession();
      return null;
    } catch {
      this.clearSession();
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null && this.getToken() !== null;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ADMIN';
  }

  isEmployee(): boolean {
    return this.getCurrentUser()?.role === 'EMPLOYEE';
  }

  // ── PUBLIC SESSION MANAGEMENT ─────────────────────────────────
  /*
   * Called by the interceptor on 401 to clear stale auth state.
   */
  clearSession(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // ── PRIVATE HELPERS ───────────────────────────────────────────
  private storeSession(user: AuthResponse): void {
    // Store the token separately for easy access
    if (user.token) {
      localStorage.setItem(this.TOKEN_KEY, user.token);
    }
    // Store user info (without token) for UI display
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private isValidAuthResponse(value: unknown): value is AuthResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<AuthResponse>;
    const validRole = candidate.role === 'ADMIN' || candidate.role === 'EMPLOYEE';

    return (
      typeof candidate.id === 'number' &&
      typeof candidate.nom === 'string' &&
      typeof candidate.email === 'string' &&
      validRole
    );
  }
}
