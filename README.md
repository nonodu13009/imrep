# 🏢 Allianz Marseille — Gestion PNO

Plateforme SaaS de gestion des logements PNO (Propriétaires Non Occupants) pour l'agence Allianz Marseille et l'agence immobilière IMREP.

## 📋 Description

Cette application permet à une agence immobilière (IMREP) de déclarer et gérer les logements PNO qu'elle administre, et permet à Allianz de valider ou refuser ces demandes. Le système garantit un suivi fiable, traçable et sécurisé avec des rôles distincts.

## ✨ Fonctionnalités principales

### 🔐 Authentification et sécurité
- Authentification via email et mot de passe (Firebase Auth)
- Déconnexion automatique après 5 minutes d'inactivité
- Gestion des rôles utilisateurs (IMREP, Allianz, Root Admin)
- Protection des routes selon les permissions

### 📊 Dashboard
- Tableau de bord personnalisé selon le rôle
- Statistiques en temps réel (lots assurés, en attente, etc.)
- Graphiques en camembert avec tooltips interactifs
- Filtres avancés et recherche

### 🏠 Gestion des lots
- Création, modification et suppression de lots
- Suivi des statuts (en attente, validé, refusé, sortie)
- Historique complet des actions
- Validation/refus par Allianz

### 👥 Gestion des utilisateurs (Allianz uniquement)
- Création de comptes utilisateurs
- Modification des rôles
- Activation/désactivation de comptes
- Protection du compte root admin

### 📝 Journal des activités
- Historique complet des actions
- Filtres par type d'action et date
- Distinction visuelle IMREP/Allianz

## 🛠️ Technologies

- **Framework** : Next.js 16.0.10 (App Router)
- **Langage** : TypeScript 5
- **Styling** : Tailwind CSS 4
- **Backend** : Firebase (Auth, Firestore)
- **Icons** : Lucide React
- **Linting** : ESLint avec config Next.js

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm, yarn, pnpm ou bun
- Compte Firebase avec projet configuré

### Étapes

1. **Cloner le dépôt**
```bash
git clone https://github.com/Allianz-Marseille/imreppno.git
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

Éditer `.env.local` avec vos clés Firebase :
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
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
│   ├── dashboard/         # Dashboards IMREP et Allianz
│   ├── lots/             # Gestion des lots
│   ├── utilisateurs/     # Gestion des utilisateurs
│   ├── journal/          # Journal des activités
│   └── login/            # Page de connexion
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
│   └── lots/            # Actions et requêtes lots
├── docs/                 # Documentation
│   ├── design-system.md
│   ├── business-rules.md
│   └── design-system-checklist.md
└── public/              # Assets statiques
```

## 👤 Rôles utilisateurs

### 🔹 Rôle IMREP
- Créer et modifier des lots (tant que statut = "en_attente")
- Demander la sortie d'un lot validé
- Consulter tous les lots
- Consulter l'historique

### 🔹 Rôle Allianz (Admin)
- Valider/refuser les demandes d'entrée et de sortie
- Créer et gérer les utilisateurs
- Accéder aux dashboards globaux
- Modifier les rôles (sauf root admin)

### 🔹 Root Admin Allianz
- Email protégé : jeanmichel@allianz-nogaro.fr
- Ne peut pas être supprimé, désactivé ou modifié

## 🎨 Design System

Le projet utilise un design system complet documenté dans `docs/design-system.md` :
- Palette de couleurs cohérente
- Composants UI réutilisables
- Animations et micro-interactions
- Responsive mobile-first

## 📚 Documentation

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

## 📝 Notes de développement

- Respect strict du clean code
- TypeScript strict activé
- Pas de duplication de code
- Composants réutilisables
- Logique métier dans `lib/`
- UI dans `components/`

## 🚢 Déploiement

Le projet peut être déployé sur Vercel (recommandé pour Next.js) :

1. Connecter le dépôt GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement à chaque push sur `main`

## 📄 Licence

Projet privé — Allianz Marseille

---

**Développé avec ❤️ pour Allianz Marseille**
