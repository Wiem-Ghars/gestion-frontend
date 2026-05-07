import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  isLoading  = false;
  errorMsg   = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // If already logged in → redirect immediately
    if (this.authService.isLoggedIn()) {
      this.redirectByRole();
    }

    this.loginForm = this.fb.group({
      email:      ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMsg  = '';

    const { email, motDePasse } = this.loginForm.value;

    this.authService.login(email, motDePasse).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.redirectByRole();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMsg = 'Email ou mot de passe incorrect';
        } else {
          this.errorMsg = 'Erreur de connexion. Réessayez plus tard.';
        }
      }
    });
  }

  private redirectByRole(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    } else if (this.authService.isEmployee()) {
      this.router.navigate(['/employee/dashboard']);
    } else {
      // Stored user is invalid/partial; keep user on login page.
      localStorage.removeItem('currentUser');
    }
  }

  // Getter helpers for cleaner template access
  get email()      { return this.loginForm.get('email'); }
  get motDePasse() { return this.loginForm.get('motDePasse'); }
}