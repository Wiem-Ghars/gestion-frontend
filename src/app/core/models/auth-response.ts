export interface AuthResponse {
  id: number;
  nom: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  token: string;
}