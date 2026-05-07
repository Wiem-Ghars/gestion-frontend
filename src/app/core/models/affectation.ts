import { Employee } from './employee';
import { Projet } from './projet';

export interface Affectation {
  id?: number;
  employee: Employee;
  projet: Projet;
  dateDebut?: string;
  dateFin?: string;
}