# SODIPAS Frontend

<div align="center">

![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC)

**Application Frontend SODIPAS - Gestion de Distribution de Fruits**

[ Démarrage Rapide](#-démarrage-rapide) •
[ Architecture](#-architecture) •
[ Fonctionnalités](#-fonctionnalités) •
[ Stack Technique](#-stack-technique) •
[ Structure](#-structure-du-projet) •
[ Contribution](#-contribution)

</div>

---

## 📋 À propos

SODIPAS Frontend est l'interface utilisateur moderne de l'application de gestion logistique et commerciale pour la distribution de fruits au Sénégal. Développée avec React et TypeScript, elle offre une expérience utilisateur intuitive et responsive.

### Fonctionnalités principales

- 📊 **Tableau de bord analytique** avec graphiques interactifs
- 🏪 **Gestion des clients** avec historique et suivi des créances
- 🚛 **Suivi des camions** en temps réel
- 📦 **Gestion des stocks** avec alertes de seuil
- 👤 **Profils clients détaillés** avec factures et paiements
- ⚙️ **Paramétrage** (utilisateurs, hangars, stocks)
- 🔐 **Authentification sécurisée** avec OTP
- 📱 **Design responsive** pour tous les écrans

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js version 18 ou supérieure
- npm ou bun

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd sodipas-project/sodipas-front

# Installer les dépendances
npm install
# ou avec bun
bun install
```

### Démarrage du serveur de développement

```bash
# Avec npm
npm run dev

# Avec bun
bun run dev
```

L'application sera accessible à l'adresse : **`http://localhost:5173`**

### Build pour la production

```bash
# Build de production
npm run build

# Build avec mode développement
npm run build:dev

# Aperçu du build
npm run preview
```

### Tests

```bash
# Exécuter les tests une fois
npm test

# Exécuter les tests en mode watch
npm run test:watch
```

---

## 🏗️ Architecture

### Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | React | 18.3.1 |
| Langage | TypeScript | 5.8.3 |
| Build Tool | Vite | 5.4.19 |
| CSS Framework | Tailwind CSS | 3.4.17 |
| UI Components | shadcn/ui | - |
| Icons | Lucide React | 0.462.0 |
| Charts | Recharts | 2.15.4 |
| State Management | React Context + TanStack Query | 5.83.0 |
| Forms | React Hook Form + Zod | 7.61.1 |
| Routing | React Router DOM | 6.30.1 |
| Testing | Vitest | 3.2.4 |

### Design System

- **Couleurs principales** :
  - Primary : `#1F3A5F` (Bleu foncé)
  - Secondary : `#2E7D32` (Vert succès)
  - Warning : `#F9C74F` (Jaune)
  - Danger : `#C62828` (Rouge)

- **Typographie** : Inter (via Google Fonts)

---

## 📁 Structure du projet

```
sodipas-front/
├── public/                    # Fichiers statiques
│   └── placeholder.svg
├── src/
│   ├── components/
│   │   ├── auth/              # Composants d'authentification
│   │   │   └── ProtectedRoute.tsx
│   │   ├── dashboard/         # Composants du tableau de bord
│   │   │   ├── AlertCard.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── PeriodSelector.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── InvoiceDistributionChart.tsx
│   │   │   └── TopClientsTable.tsx
│   │   ├── layout/            # Composants de mise en page
│   │   │   ├── AppLayout.tsx
│   │   │   └── AppSidebar.tsx
│   │   └── ui/                # Composants UI (shadcn/ui)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── table.tsx
│   │       └── ... (40+ composants)
│   ├── config/
│   │   └── api.ts             # Configuration API
│   ├── contexts/
│   │   └── AuthContext.tsx    # Contexte d'authentification
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts           # Utilitaires
│   ├── pages/
│   │   ├── Login.tsx          # Page de connexion
│   │   ├── VerifyOtp.tsx      # Page de vérification OTP
│   │   ├── Dashboard.tsx      # Tableau de bord principal
│   │   ├── Clients.tsx        # Gestion des clients
│   │   ├── ClientProfile.tsx  # Profil client détaillé
│   │   ├── Stocks.tsx         # Gestion des stocks et camions
│   │   ├── Settings.tsx       # Paramètres
│   │   └── NotFound.tsx       # Page 404
│   ├── App.tsx                # Point d'entrée principal
│   ├── main.tsx               # Rendu React
│   ├── index.css              # Styles globaux
│   └── App.css                # Styles App
├── index.html                 # Point d'entrée HTML
├── tailwind.config.ts         # Configuration Tailwind
├── vite.config.ts             # Configuration Vite
├── tsconfig.json              # Configuration TypeScript
├── package.json               # Dépendances
└── README.md                  # Documentation
```

---

## 🎨 Fonctionnalités

### Tableau de bord (Dashboard)

Le tableau de bord principal affiche :

- **KPIs** : Revenus du jour, dettes clients, cageots en circulation, factures en attente
- **Graphique de revenus** : Évolution des paiements par période (jour/semaine/mois)
- **Distribution des factures** : Graphique circulaire par statut
- **Top clients** : Tableau des meilleurs clients par montant
- **Alertes** : Notifications importantes (créances élevées, stocks bas)

### Gestion des Clients

- **Liste paginée** des clients avec recherche
- **Ajout de nouveaux clients** avec informations complètes
- **Profil client détaillé** avec :
  - Résumé financier (dette, cageots, total achats)
  - Historique des factures avec pagination
  - Suivi des paiements
  - Gestion des cageots
  - Actions rapides (paiement, nouvelle facture, WhatsApp)

### Stocks et Camions

- **Section Camions** :
  - Liste des camions reçus
  - Suivi de l'état (arrivé, en route, déchargé)
  - Informations chauffeur et origine

- **Section Stocks** :
  - Inventaire par produit
  - Stock par hangar
  - Seuils d'alerte configurables
  - Valeur totale du stock

### Paramètres

- **Utilisateurs** : Gestion des comptes et rôles
- **Hangars** : Configuration des entrepôts
- **Stocks** : Configuration des seuils et valeurs

---

## 🔐 Authentification

L'application utilise un système d'authentification à deux facteurs :

1. **Connexion** : Saisir l'email
2. **Vérification OTP** : Saisir le code à 6 chiffres reçu
3. **Session** : Token valide pendant 24 heures

### Rôles et permissions

| Rôle | Description |
|------|-------------|
| `admin` | Accès complet à toutes les fonctionnalités |
| `manager` | Gestion des clients et stocks |
| `accountant` | Accès aux données financières |
| `warehouse` | Gestion des stocks et hangars |
| `viewer` | Consultation seule |

---

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine :

```env
VITE_API_URL=http://localhost:3002
VITE_APP_NAME=SODIPAS
```

### Configuration API

Le fichier [`src/config/api.ts`](src/config/api.ts) contient la configuration de l'API :

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
```

---

## 📱 Responsive Design

L'application est fully responsive avec :

- **Desktop** : Layout complet avec sidebar et contenu côte à côte
- **Tablette** : Adaptation du layout pour écrans moyens
- **Mobile** : Navigation optimisée avec menu hamburger

---

## 🧪 Tests

### Structure des tests

```
src/test/
├── example.test.ts     # Test d'exemple
└── setup.ts            # Configuration des tests
```

### Exécuter les tests

```bash
# Tests avec couverture
npm test

# Mode watch pour développement
npm run test:watch
```

---

## 📦 Build et Déploiement

### Build de production

```bash
npm run build
```

Les fichiers buildés seront dans le dossier `dist/`.

### Déploiement recommandé

- **Vercel** : Configuration automatique
- **Netlify** : Configuration automatique
- **Serveur statique** : Servir le dossier `dist/`

---

## 🔨 Développement

### Commandes disponibles

```bash
# Développement avec hot reload
npm run dev

# Linting du code
npm run lint

# Build de développement
npm run build:dev

# Aperçu du build
npm run preview

# Tests
npm test
```

### Bonnes pratiques

- Utiliser TypeScript pour tous les nouveaux composants
- Suivre les conventions de nommage
- Documenter les composants complexes
- Écrire des tests pour les fonctionnalités critiques

---

## 📄 Licence

Ce projet est sous licence ISC.

---

## 👨‍💼 Auteur

Développé pour **SODIPAS** - Société de Distribution de Produits Agricoles du Sénégal

---

## 🙏 Remerciements

- [shadcn/ui](https://ui.shadcn.com/) pour les composants UI
- [Lucide](https://lucide.dev/) pour les icônes
- [Recharts](https://recharts.org/) pour les graphiques
- [Tailwind CSS](https://tailwindcss.com/) pour le styling

---

<div align="center">

**SODIPAS** © 2026 - Tous droits réservés

</div>
