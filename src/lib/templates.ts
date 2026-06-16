import { getCurrentEquipe } from './team'

export interface ActionTemplate {
  id: string
  label: string
  categorie: string
  criticite: string
  probleme: string
  cause: string
  solution: string
  pdca_plan: string
}

export const ACTION_TEMPLATES: ActionTemplate[] = [
  {
    id: 'sec-epi',
    label: 'Non-port EPI',
    categorie: 'Sécurité',
    criticite: 'Haute',
    probleme: 'Non-port des EPI constaté',
    cause: 'Oubli / habitude',
    solution: 'Rappel consignes + contrôle renforcé',
    pdca_plan: 'Affichage rappel + contrôle quotidien',
  },
  {
    id: 'qual-nc',
    label: 'Non-conformité produit',
    categorie: 'Qualité',
    criticite: 'Haute',
    probleme: 'Écart qualité sur lot',
    cause: 'À déterminer (8D)',
    solution: 'Reprise + analyse cause racine',
    pdca_plan: 'Isoler lot + lancer 8D',
  },
  {
    id: 'cout-gasp',
    label: 'Surconsommation',
    categorie: 'Coût',
    criticite: 'Moyenne',
    probleme: 'Surconsommation matière',
    cause: 'Réglage machine / formation',
    solution: 'Ajustement paramètres',
    pdca_plan: 'Mesure avant/après sur 1 semaine',
  },
  {
    id: 'delai-retard',
    label: 'Retard livraison',
    categorie: 'Délai',
    criticite: 'Haute',
    probleme: 'Retard livraison client',
    cause: 'Goulot production',
    solution: 'Plan de rattrapage',
    pdca_plan: 'Réaffecter ressources + suivi journalier',
  },
  {
    id: 'pers-abs',
    label: 'Absence équipe',
    categorie: 'RH',
    criticite: 'Moyenne',
    probleme: 'Absence non remplacée',
    cause: 'Manque polyvalence',
    solution: 'Renfort intérim / réorganisation',
    pdca_plan: 'Cartographie compétences',
  },
]

export function applyTemplate(t: ActionTemplate, axeId: number): Partial<import('../types').Action> {
  return {
    axe_id: axeId,
    probleme: t.probleme,
    categorie: t.categorie,
    criticite: t.criticite,
    cause: t.cause,
    solution: t.solution,
    pdca_plan: t.pdca_plan,
    equipe: getCurrentEquipe(),
    statut: 'ouverte',
  }
}
