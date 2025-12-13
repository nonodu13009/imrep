# 🧭 Cursor Rules — Projet Allianz / IMREP

## OBJET
Toutes les générations de code dans ce projet doivent respecter :
- le Design System (docs/design-system.md)
- les composants UI existants
- la structure Next.js établie

## 1. CODE STYLE
- Respect strict du clean code.
- Pas de duplication.
- Fonctions courtes et pures.
- Types toujours explicites en TypeScript.
- Pas de any.
- Pas d'inline styles (sauf cas d'urgence).
- Préférer des composants réutilisables.

## 2. ARCHITECTURE
- Toute logique métier → dossier lib/
- Toute UI → components/ui
- Toute page → app/**/page.tsx
- Pas de Firebase init hors /lib/firebase.ts
- Pas de logique serveur dans les composants client

## 3. UX & DESIGN
- Toujours utiliser les composants UI plutôt que du HTML brut.
- Respecter les espacements, couleurs, rayons du design system.
- Ajouter SectionTitle au début de chaque page.
- Toute action sensible → ConfirmModal.
- Toute réussite / erreur → useToast().

## 4. FIREBASE
- Une seule initialisation dans lib/firebase.ts
- Auth obligatoire pour toutes les pages privées
- Vérification de rôle via Firestore uniquement (pas via le cookie)
- Pas de secret dans le client

## 5. BONUS
- Favoriser la lisibilité.
- Favoriser la cohérence entre pages.
- Documenter toutes les nouvelles fonctionnalités.

FIN DES RÈGLES

