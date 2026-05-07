import { Categorie } from './categorie';

export interface Employee {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string;
  categorie: Categorie;
  role?: 'EMPLOYEE'; // added by AuthServlet in the login response
}