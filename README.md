# 🏢 Allianz Marseille — Gestion PNO

**Projet :** Allianz Marseille (Franchisé) - GES - IMREP  
**Domaine :** Gestion des logements PNO (Propriétaires Non Occupants)

Plateforme SaaS de gestion des logements PNO pour l'agence Allianz Marseille (franchisé) et l'agence immobilière IMREP. Le système permet à IMREP de déclarer et gérer les logements PNO qu'elle administre, et permet à Allianz Marseille de valider ou refuser ces demandes avec un suivi fiable, traçable et sécurisé.

## 📋 Description

Cette application permet à une agence immobilière (IMREP) de déclarer et gérer les logements PNO (Propriétaires Non Occupants) qu'elle administre, et permet à Allianz Marseille (franchisé) de valider ou refuser ces demandes. Le système garantit un suivi fiable, traçable et sécurisé avec des rôles distincts.

**CONTEXTE MÉTIER :**
- **Allianz Marseille (franchisé)** : Assurance et validation des demandes PNO
- **IMREP** : Agence immobilière déclarant les logements PNO
- **GES** : Gestion des logements assurés
- **PNO** : Propriétaires Non Occupants (logements vides à assurer)

## ✨ Fonctionnalités principales

### 🔐 Authentification et sécurité
- Authentification via email et mot de passe (Firebase Auth)
- Déconnexion automatique après 5 minutes d'inactivité
- Gestion des rôles utilisateurs (IMREP, Allianz, Root Admin)
- Protection des routes selon les permissions
- Création d'utilisateurs via API route sécurisée avec Firebase Admin SDK

### 📊 Dashboard
- Tableau de bord personnalisé selon le rôle (IMREP / Allianz)
- Statistiques en temps réel (lots assurés, en attente, etc.)
- Graphiques en camembert avec tooltips interactifs
- Filtres avancés et recherche
- Vue séparée pour IMREP et Allianz

### 🏠 Gestion des lots PNO
- Création, modification et suppression de lots
- Suivi des statuts (en attente, validé, refusé, sortie)
- Historique complet des actions avec traçabilité
- Validation/refus par Allianz avec numéro de contrat
- Gestion des dates d'effet et de sortie
- Codes propriétaire et lot uniques

### 👥 Gestion des utilisateurs (Allianz uniquement)
- Création de comptes utilisateurs via API route sécurisée
- Modification des rôles (IMREP / Allianz)
- Activation/désactivation de comptes
- Modification des mots de passe
- Soft delete (désactivation au lieu de suppression réelle)
- Protection du compte root admin

### 📝 Journal des activités
- Historique complet des actions sur les lots
- Filtres par type d'action et date
- Distinction visuelle IMREP/Allianz
- Traçabilité complète des modifications

### 🔔 Notifications Slack
- Notifications automatiques pour les actions importantes
- Notifications lors de création/modification de lots PNO par IMREP
- Notifications lors de validation/refus par Allianz
- Notifications lors de création d'utilisateurs
- Notifications lors de demandes de sortie et suppression
- Système de fallback automatique (direct → API route)
- Documentation complète dans `docs/MCP_SLACK_LOGIC.md`

### 🔌 API Routes
- **`/api/slack/notify`** : Proxy pour les notifications Slack
- **`/api/users/create`** : Création d'utilisateurs via API sécurisée
  - Authentification requise (token Firebase)
  - Vérification du rôle Allianz
  - Création dans Firebase Auth et Firestore

## 🛠️ Technologies

- **Framework** : Next.js 16.0.10 (App Router avec routes API)
- **Langage** : TypeScript 5
- **Styling** : Tailwind CSS 4
- **Backend** : 
  - Firebase (Auth, Firestore)
  - Firebase Admin SDK (opérations administratives côté serveur)
- **Intégrations** :
  - Slack API (Incoming Webhooks pour les notifications)
- **Icons** : Lucide React
- **Linting** : ESLint avec config Next.js

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm, yarn, pnpm ou bun
- Compte Firebase avec projet configuré
- Compte Slack (optionnel, pour les notifications)

### Étapes

1. **Cloner le dépôt**
```bash
git clone https://github.com/nonodu13009/imrep.git
cd imrep-allianz-gestion-pno
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Configurer les variables d'environnement**
```bash
cp env.example .env.local
```

Éditer `.env.local` avec vos clés :

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (pour les opérations serveur)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Slack (optionnel)
SLACK_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Application URL (pour le déploiement)
NEXT_PUBLIC_APP_URL=https://imrep-nu.vercel.app
```

4. **Lancer le serveur de développement**
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

5. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 📁 Structure du projet

```
imrep-allianz-gestion-pno/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API Next.js
│   │   ├── slack/        # Notifications Slack
│   │   └── users/        # Gestion utilisateurs
│   ├── dashboard/         # Dashboards IMREP et Allianz
│   ├── lots/             # Gestion des lots PNO
│   ├── utilisateurs/     # Gestion des utilisateurs
│   ├── journal/          # Journal des activités
│   ├── login/            # Page de connexion
│   ├── aide/             # Page d'aide
│   └── dev/              # Pages de développement (dev only)
├── components/            # Composants React
│   ├── ui/               # Composants UI réutilisables
│   ├── dashboard/       # Composants spécifiques dashboard
│   └── layouts/         # Layouts (DashboardLayout)
├── hooks/                # Hooks React personnalisés
│   ├── useAuth.ts       # Hook d'authentification
│   ├── useUserRole.ts   # Hook de gestion des rôles
│   └── useInactivityLogout.ts  # Déconnexion automatique
├── lib/                  # Logique métier
│   ├── firebase/        # Configuration Firebase
│   │   ├── admin.ts     # Firebase Admin SDK
│   │   ├── admin-actions.ts  # Actions admin (création users, etc.)
│   │   └── users.ts     # Gestion utilisateurs Firestore
│   ├── lots/            # Actions et requêtes lots
│   ├── notifications/   # Notifications Slack pour les lots
│   └── slack.ts         # Module centralisé notifications Slack
├── docs/                 # Documentation complète
│   ├── MCP_SLACK_LOGIC.md  # Logique MCP et notifications Slack
│   ├── vercel-deployment.md # Guide déploiement Vercel
│   ├── firebase-admin-setup.md  # Configuration Firebase Admin
│   ├── cursor-rules.md  # Règles de développement
│   ├── DEPLOY_VERCEL.md  # Documentation déploiement
│   ├── design-system.md
│   ├── business-rules.md
│   └── design-system-checklist.md
└── public/              # Assets statiques
```

## 🏗️ Architecture

### Flux de notifications Slack

```
Action utilisateur (IMREP/Allianz)
    ↓
Server Action / API Route
    ↓
lib/slack.ts (sendSlackNotification)
    ↓
┌─────────────────────┬─────────────────────┐
│ Envoi direct        │ Via API Route       │
│ (si env disponible) │ /api/slack/notify   │
└──────────┬──────────┴──────────┬──────────┘
           │                     │
           └──────────┬──────────┘
                      ↓
           Slack Webhook (Incoming)
                      ↓
           Canal Slack (#allianz-pno)
```

### Architecture API Routes

- **Routes API** : Exécutées côté serveur uniquement
- **Authentification** : Vérification via Firebase Admin SDK
- **Sécurité** : Variables d'environnement non exposées au client
- **Firebase Admin SDK** : Utilisé uniquement dans les API routes et Server Actions

### Séparation client/serveur

- **Client** : Firebase Client SDK (Auth, Firestore)
- **Serveur** : Firebase Admin SDK (opérations administratives)
- **API Routes** : Pont entre client et Admin SDK pour les opérations sécurisées

## 🔔 Notifications Slack

Le système envoie automatiquement des notifications Slack pour les événements importants :

### Points d'intégration

**Actions IMREP :**
- ✅ Création d'un lot PNO (demande d'entrée)
- ✅ Modification d'un lot PNO (tant que statut = "en_attente")
- ✅ Demande de sortie d'un lot PNO (si statut = "valide")
- ✅ Demande de suppression d'un lot PNO

**Actions Allianz Marseille :**
- ✅ Validation d'entrée d'un lot PNO (avec numéro de contrat)
- ✅ Refus d'entrée d'un lot PNO (avec motif de refus)
- ✅ Validation de sortie d'un lot PNO
- ✅ Refus de sortie d'un lot PNO
- ✅ Validation de suppression d'un lot PNO
- ✅ Refus de suppression d'un lot PNO
- ✅ Création d'utilisateur (IMREP ou Allianz)
- ✅ Modification de rôle utilisateur
- ✅ Activation/désactivation de compte utilisateur

### Configuration

Les notifications Slack sont configurées via les variables d'environnement :
- `SLACK_ENABLED=true` : Active/désactive les notifications
- `SLACK_WEBHOOK_URL` : URL du webhook Slack Incoming

Pour plus de détails, consultez la [documentation complète](./docs/MCP_SLACK_LOGIC.md).

## 🔌 API Routes

### `/api/slack/notify` (POST)

Proxy pour l'envoi de notifications Slack. Utilise les variables d'environnement côté serveur.

**Body :**
```json
{
  "text": "Message à envoyer"
}
```

### `/api/users/create` (POST)

Création d'un nouvel utilisateur (requiert authentification Allianz).

**Body :**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "imrep" | "allianz",
  "displayName": "Nom d'affichage",
  "idToken": "firebase_id_token"
}
```

**Sécurité :**
- Vérification du token Firebase
- Vérification du rôle Allianz
- Validation des données
- Création dans Firebase Auth et Firestore

## 👤 Rôles utilisateurs

### 🔹 Rôle IMREP (Agence immobilière)

**Peut :**
- Créer des lots PNO (demande d'entrée)
- Modifier des lots (tant que statut = "en_attente")
- Demander la sortie d'un lot validé
- Consulter tous les lots
- Consulter l'historique

**Ne peut pas :**
- Valider ou refuser des demandes
- Modifier un lot validé
- Créer des utilisateurs

### 🔹 Rôle Allianz (Admin - Franchisé)

**Peut :**
- Valider/refuser les demandes d'entrée et de sortie
- Créer et gérer les utilisateurs (via API route sécurisée)
- Accéder aux dashboards globaux
- Modifier les rôles (sauf root admin)
- Activer/désactiver des comptes
- Modifier les mots de passe

**Ne peut pas :**
- Modifier `createdBy` d'un lot
- Utiliser le système comme IMREP (création lots interdite)

### 🔹 Root Admin Allianz (non modifiable)

- Email protégé : `jeanmichel@allianz-nogaro.fr`
- Ne peut pas être supprimé
- Ne peut pas être désactivé
- Ne peut pas voir son rôle modifié

## 🎨 Design System

Le projet utilise un design system complet documenté dans `docs/design-system.md` :
- Palette de couleurs cohérente
- Composants UI réutilisables
- Animations et micro-interactions
- Responsive mobile-first

## 📚 Documentation

Toute la documentation est disponible dans le dossier `docs/` :

- **[MCP & Notifications Slack](./docs/MCP_SLACK_LOGIC.md)** : Logique MCP et système de notifications Slack
- **[Déploiement Vercel](./docs/vercel-deployment.md)** : Guide complet de déploiement sur Vercel
- **[Firebase Admin Setup](./docs/firebase-admin-setup.md)** : Configuration Firebase Admin SDK
- **[Règles de développement](./docs/cursor-rules.md)** : Règles Clean Code et conventions
- **[Déploiement](./docs/DEPLOY_VERCEL.md)** : Documentation déploiement
- **[Design System](./docs/design-system.md)** : Guide complet du design system
- **[Règles métier](./docs/business-rules.md)** : Règles fonctionnelles et logique métier
- **[Composants UI](./components/ui/README.md)** : Documentation des composants UI

## 🔧 Scripts disponibles

```bash
npm run dev      # Démarre le serveur de développement
npm run build    # Build de production
npm run start    # Démarre le serveur de production
npm run lint     # Lance ESLint
```

## 🔒 Sécurité

- Authentification Firebase obligatoire
- Vérification des rôles via Firestore
- Déconnexion automatique après 5 minutes d'inactivité
- Protection des routes selon les permissions
- Pas de secrets dans le code client
- Firebase Admin SDK utilisé uniquement côté serveur
- API routes sécurisées avec vérification de token
- Variables d'environnement protégées
- Soft delete pour les utilisateurs (pas de suppression définitive)

## 📝 Notes de développement

- Respect strict du clean code
- TypeScript strict activé
- Pas de duplication de code
- Composants réutilisables
- Logique métier dans `lib/`
- UI dans `components/`
- Server Actions pour les opérations serveur
- API Routes pour les opérations nécessitant Admin SDK

## 🚢 Déploiement

### Déploiement Vercel (Production)

L'application est déployée sur Vercel : **https://imrep-nu.vercel.app**

**Configuration requise :**
1. Connecter le dépôt GitHub : `https://github.com/nonodu13009/imrep.git`
2. Configurer toutes les variables d'environnement dans Vercel
3. Le déploiement est automatique à chaque push sur `main`

**Variables d'environnement Vercel :**
- Toutes les variables Firebase (NEXT_PUBLIC_*)
- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON complet)
- `SLACK_ENABLED` et `SLACK_WEBHOOK_URL`
- `NEXT_PUBLIC_APP_URL`

Pour plus de détails, consultez la [documentation de déploiement](./docs/vercel-deployment.md).

### Déploiement local

Le projet peut être déployé sur n'importe quelle plateforme supportant Next.js :

1. Configurer les variables d'environnement
2. Exécuter `npm run build` pour créer le build de production
3. Exécuter `npm run start` pour lancer le serveur de production

## 📄 Licence

Projet privé — Allianz Marseille

---

**Développé avec ❤️ pour Allianz Marseille (Franchisé) - GES - IMREP**
