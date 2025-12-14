# 🚀 Guide de déploiement Vercel - Étape par étape

## 📋 Prérequis

- ✅ Compte Vercel (gratuit ou payant)
- ✅ Dépôt GitHub : `Allianz-Marseille/imreppno`
- ✅ Variables d'environnement prêtes (voir `vercel-env-vars.txt`)

---

## 🔧 Étape 1 : Créer un nouveau projet Vercel

1. **Aller sur [vercel.com](https://vercel.com)** et se connecter
2. Cliquer sur **"Add New..."** → **"Project"**
3. **Importer le dépôt GitHub :**
   - Sélectionner `Allianz-Marseille/imreppno`
   - Si le dépôt n'apparaît pas, cliquer sur **"Adjust GitHub App Permissions"** et autoriser l'accès

---

## ⚙️ Étape 2 : Configuration du projet

### 2.1 Paramètres de build

Vercel détecte automatiquement Next.js, mais vérifiez :

- **Framework Preset :** Next.js
- **Root Directory :** `./` (racine)
- **Build Command :** `npm run build` (par défaut)
- **Output Directory :** `.next` (par défaut)
- **Install Command :** `npm install` (par défaut)

### 2.2 Variables d'environnement

**⚠️ IMPORTANT :** Configurez TOUTES les variables AVANT de déployer.

1. Dans la page de configuration du projet, aller à **"Environment Variables"**
2. Pour chaque variable du fichier `vercel-env-vars.txt` :
   - Cliquer sur **"Add"**
   - Entrer le **Name** (clé)
   - Entrer la **Value** (valeur)
   - Sélectionner les environnements : **Production**, **Preview**, **Development**
   - Cliquer sur **"Save"**

**Variables à configurer :**

#### Firebase (6 variables)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

#### Slack (2 variables)
- `SLACK_ENABLED` = `true`
- `SLACK_WEBHOOK_URL` = votre webhook URL (sans guillemets)

#### Optionnel (1 variable)
- `NEXT_PUBLIC_APP_URL` = URL de production (sera automatiquement rempli après le premier déploiement)

---

## 🚀 Étape 3 : Déployer

1. Après avoir configuré toutes les variables, cliquer sur **"Deploy"**
2. Attendre la fin du build (2-5 minutes)
3. Vérifier que le build est réussi (statut "Ready")

---

## ✅ Étape 4 : Vérifications post-déploiement

### 4.1 Vérifier l'URL de production

- L'URL sera affichée dans le dashboard Vercel
- Format : `https://votre-projet.vercel.app`
- **Note :** Mettre à jour `NEXT_PUBLIC_APP_URL` avec cette URL si nécessaire

### 4.2 Tester l'application

1. **Page d'accueil :**
   - Visiter `https://votre-projet.vercel.app`
   - Vérifier que la page se charge

2. **Page de login :**
   - Visiter `https://votre-projet.vercel.app/login`
   - Vérifier que les boutons de développement ne sont **PAS** visibles
   - Tester une connexion

3. **Test Slack :**
   - Visiter `https://votre-projet.vercel.app/slack-test`
   - Cliquer sur "Tester Slack"
   - Vérifier que la notification arrive dans Slack

4. **Test fonctionnel :**
   - Créer un lot
   - Vérifier que la notification Slack est envoyée

### 4.3 Vérifier les logs

- Aller dans **Deployments** → [votre déploiement] → **Functions**
- Vérifier qu'il n'y a pas d'erreurs

---

## 🔍 Problèmes courants

### ❌ Erreur : "Firebase auth/invalid-api-key"

**Cause :** Variables Firebase non configurées ou incorrectes

**Solution :**
1. Vérifier que toutes les variables Firebase sont bien configurées dans Vercel
2. Vérifier qu'elles sont activées pour l'environnement **Production**
3. Redéployer après avoir corrigé

### ❌ Les notifications Slack ne fonctionnent pas

**Cause :** Variables Slack non configurées ou `SLACK_ENABLED` incorrect

**Solution :**
1. Vérifier que `SLACK_ENABLED=true` (sans guillemets dans Vercel)
2. Vérifier que `SLACK_WEBHOOK_URL` est correct (sans guillemets)
3. Tester avec `/slack-test`
4. Vérifier les logs Vercel

### ❌ Les boutons de développement sont toujours visibles

**Cause :** Cache du navigateur ou déploiement non à jour

**Solution :**
1. Vider le cache du navigateur (`Ctrl+Shift+R` ou `Cmd+Shift+R`)
2. Vérifier que le dernier commit est bien déployé
3. Tester en navigation privée

### ❌ Build échoue avec "Cannot find module"

**Cause :** Vercel pointe vers le mauvais dépôt

**Solution :**
1. Vérifier dans **Settings → Git** que le dépôt est bien `Allianz-Marseille/imreppno`
2. Si ce n'est pas le cas, supprimer le projet et recréer avec le bon dépôt

---

## 📝 Checklist finale

- [ ] Projet Vercel créé et connecté au bon dépôt (`imreppno`)
- [ ] Toutes les variables Firebase configurées
- [ ] Variables Slack configurées (`SLACK_ENABLED=true` et `SLACK_WEBHOOK_URL`)
- [ ] Premier déploiement réussi
- [ ] Page de login fonctionne (sans boutons de dev)
- [ ] Test Slack fonctionne (`/slack-test`)
- [ ] Notifications Slack fonctionnent lors des actions réelles
- [ ] Aucune erreur dans les logs Vercel

---

## 🔐 Sécurité

✅ **À faire :**
- Utiliser les secrets Vercel pour les variables sensibles
- Ne jamais commiter `.env.local`
- Vérifier que `.gitignore` contient `.env*`

❌ **À ne pas faire :**
- Mettre les secrets dans le code
- Exposer les webhooks dans les logs
- Partager les variables d'environnement publiquement

---

**Note :** Après chaque modification des variables d'environnement dans Vercel, il faut redéployer pour que les changements prennent effet.
