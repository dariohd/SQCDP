# Guide utilisateur SQCDP

## À quoi sert SQCDP ?

SQCDP est un outil de pilotage visuel pour les **5 axes** de la performance industrielle :

- **S** — Sécurité  
- **Q** — Qualité  
- **C** — Coût  
- **D** — Délai  
- **P** — Personnel  

Chaque jour ouvré, l’équipe indique un état par axe (OK, Attention, Blocage, Non rempli). Les actions correctives et commentaires sont liés aux jours et aux axes.

---

## Parcours type

### 1. Accueil (`/`)

- Vue d’ensemble : actions ouvertes, retards, alertes  
- Accès rapide : Daily, Tableau mensuel, Vue direction, Guide  
- **Charger la démo usine** : jeu de données fictif pour formation ou démo client  

### 2. Daily (`/daily` ou touche **D**)

Réunion guidée en 6 étapes :

1. Checklist ordre du jour  
2. Roulette des rôles (animateur, sécurité, etc.)  
3. Saisie des états du jour  
4. Revue des alertes  
5. Actions ouvertes / nouvelles  
6. Clôture → **PDF** téléchargé + sauvegarde API si connectée  

### 3. Tableau mensuel (`/mois`)

- 5 donuts (un par axe)  
- Clic sur un jour : état, commentaire, action  
- Export / import CSV, export PDF mensuel  
- Raccourcis : **R** roulette, **I** import, **S** export, **B** saisie groupée, **N** nouvelle action  

### 4. Semaine (`/semaine`)

Vue condensée de la semaine courante avec stand-up interactif.

### 5. Pilotage (`/analytics`)

KPIs, historique des daily, tendances.

### 6. Vue direction (`/direction`)

Radar SQCDP, tendance 6 mois, tableau détaillé par axe — pour le management.

### 7. Roulette (`/roulette`)

Tirage aléatoire des rôles daily (sans doublon possible).

---

## Équipes et sites

Dans **Paramètres** (icône engrenage sur le tableau mensuel) :

- Choisir l’**équipe** active (ex. Ligne 1)  
- Les données affichées sont filtrées par équipe  
- Avec l’API : chaque équipe a ses propres états et actions  

---

## Mode hors ligne

L’application est une **PWA** : elle fonctionne sans réseau. Les modifications sont enregistrées localement et synchronisées quand l’API redevient disponible (barre de statut en haut).

---

## Format CSV

En-têtes : `Type;Axe;Date;Champ1;Champ2;Champ3;Champ4;Statut`

| Type | Champ1 | Champ2 | Champ3 | Champ4 | Statut |
|------|--------|--------|--------|--------|--------|
| Etat | ok / attention / blocage | | | | |
| Action | Problème | Porteur | Échéance | Catégorie | ouverte / fermee |
| Commentaire | Texte | | | | |

Exemples dans `sqcdp-app/demo-data/`.

---

## Support technique

Installation base de données et API : voir [INSTALLATION-BDD.md](./INSTALLATION-BDD.md).
