export interface Admin {
  id?: number;
  nom: string;
  email: string;
  motDePasse?: string;
  role?: 'ADMIN'; // added by AuthServlet in the login response
}