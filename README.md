# Jour de fête

Application web statique en **React + TypeScript + Vite** pour consulter le programme du **Jour de fête** à Pont-Croix.

L'interface permet de :

- parcourir le programme de la journée ;
- filtrer les événements par catégorie, moment de la journée ou événements en cours ;
- explorer les lieux sur une carte interactive ;
- afficher les animations liées à un lieu précis ;
- séparer les animations géolocalisées des événements en déambulation.

## Aperçu

Le projet repose sur un unique jeu de données local (`data.json`) qui contient :

- les métadonnées de l'événement ;
- la liste des lieux ;
- la liste des animations et leurs créneaux.

Il n'y a **pas de backend** : le site peut être déployé comme une simple application statique.

## Stack technique

- React 18
- TypeScript
- Vite
- Leaflet + React Leaflet
- Vitest

## Installation

Prérequis :

- Node.js 18+ recommandé
- npm

Installation locale :

```bash
npm install
```

Lancer le serveur de développement :

```bash
npm run dev
```

Construire l'application :

```bash
npm run build
```

Prévisualiser le build :

```bash
npm run preview
```

Lancer les tests :

```bash
npm run test
```

## Structure du projet

```text
.
├── data.json                    # source de vérité de l'application
├── schedule.txt                 # programme source en texte brut
├── schedule-jour-fete.csv       # version tabulaire de travail
├── description.txt              # note éditoriale / contexte événementiel
├── image.webp                   # affiche utilisée dans le header
├── src/
│   ├── App.tsx                  # composition principale de l'interface
│   ├── components/              # carte, filtres, liste, panneaux
│   ├── data/index.ts            # validation et normalisation des données
│   ├── utils/                   # temps, libellés, sélecteurs
│   └── types.ts                 # schémas TypeScript
└── dist/                        # build de production généré par Vite
```

## Modèle de données

Le fichier `data.json` suit cette logique :

- `meta` : nom de l'événement, date, ville, fuseau horaire, catégories ;
- `places` : lieux physiques ou zones virtuelles (`virtual-area`) ;
- `events` : animations avec catégorie, lieu, description et créneaux.

Exemple simplifié :

```json
{
  "meta": {
    "event_name": "Jour de fête",
    "date": "2026-04-25",
    "city": "Pont-Croix",
    "timezone": "Europe/Paris"
  },
  "places": [
    {
      "id": "place-eglise",
      "kind": "physical-place",
      "name": "Place de l’église",
      "latitude": 48.0409,
      "longitude": -4.4892,
      "sort_order": 1
    }
  ],
  "events": [
    {
      "id": "event-atelier",
      "place_id": "place-eglise",
      "title": "Atelier exemple",
      "category": "atelier",
      "all_day": false,
      "time_slots": [
        {
          "start": "2026-04-25T10:00:00+02:00",
          "end": "2026-04-25T12:00:00+02:00"
        }
      ]
    }
  ]
}
```

## Mise à jour du programme

Le flux de travail actuel est simple :

1. partir du programme brut et des documents de travail ;
2. consolider les lieux, catégories et créneaux dans `data.json` ;
3. lancer `npm run test` pour vérifier la logique liée aux horaires ;
4. lancer `npm run build` pour vérifier que l'application compile ;
5. publier le dépôt ou le build statique.

Points d'attention :

- chaque `event.place_id` doit correspondre à un `place.id` existant ;
- un lieu sans coordonnées n'apparaît pas sur la carte ;
- les événements mobiles ou non géolocalisés sont traités comme animations "dans toute la ville" ;
- les fuseaux horaires et créneaux ISO 8601 pilotent le filtre `En ce moment`.

## Fonctionnement de l'interface

- **Filtres** : catégorie, moment de la journée, événements en cours.
- **Carte** : affichage des lieux avec compteur d'événements.
- **Liste** : tri et regroupement des événements selon leurs horaires.
- **Panneau lieu** : focus sur un lieu sélectionné depuis la carte ou une carte événement.
- **Déambulation** : section dédiée aux animations réparties dans toute la ville.

## Publication

Le projet est adapté à un hébergement statique, servant le contenu de `dist/`

## Licence

Le **code source** de ce dépôt est distribué sous licence **MIT**. Voir [LICENSE](/Users/witold/dev/jour-de-fete/LICENSE).

Sauf mention contraire, les **contenus éditoriaux et visuels** ne sont pas couverts par la licence MIT, notamment :

- `data.json`
- `schedule.txt`
- `schedule-jour-fete.csv`
- `description.txt`
- `image.webp`

Les textes, données événementielles, noms d'organisations, visuels et éléments de programmation restent soumis aux droits de leurs auteurs, organisateurs ou ayants droit respectifs.
