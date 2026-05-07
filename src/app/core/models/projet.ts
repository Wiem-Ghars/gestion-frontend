export interface Projet {
  id?: number;
  nom: string;
  description: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE';
  joursRestants?: number;
}
