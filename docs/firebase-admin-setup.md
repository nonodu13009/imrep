# 🔐 Configuration Firebase Admin SDK

Ce guide explique comment configurer Firebase Admin SDK pour supprimer les utilisateurs de Firebase Auth.

## 📋 Prérequis

- Compte Firebase avec accès à la console
- Projet Firebase configuré

## 🔑 Étape 1 : Obtenir la clé privée (Service Account Key)

1. **Aller sur [Firebase Console](https://console.firebase.google.com/)**
2. **Sélectionner votre projet** (`imrep-pno`)
3. **Aller dans les paramètres du projet** (icône ⚙️ en haut à gauche)
4. **Onglet "Service accounts"**
5. **Cliquer sur "Generate new private key"**
6. **Confirmer** → Un fichier JSON sera téléchargé

⚠️ **IMPORTANT :** Ce fichier contient des credentials sensibles. Ne le commitez JAMAIS dans Git.

## 📝 Étape 2 : Configurer la variable d'environnement

### En local (`.env.local`)

1. **Ouvrir le fichier JSON téléchargé**
2. **Copier TOUT le contenu JSON** (tout le fichier)
3. **Dans `.env.local`, ajouter :**

```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"imrep-pno",...}'
```

⚠️ **IMPORTANT :**
- Mettre le JSON entre **guillemets simples** `'...'`
- Le JSON doit être sur **une seule ligne** (pas de retours à la ligne)
- Ou utiliser des guillemets doubles et échapper les guillemets internes

**Exemple complet :**

```env
# Variables Firebase existantes
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB3th3rcwHNfpt1WAkFpr9RcKYKTAsuH1w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=imrep-pno.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=imrep-pno
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=imrep-pno.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=902435108326
NEXT_PUBLIC_FIREBASE_APP_ID=1:902435108326:web:579070ad23b45b86745227

# Clé privée Firebase Admin SDK (pour supprimer les utilisateurs Auth)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"imrep-pno","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

### Sur Vercel

1. **Aller dans Vercel Dashboard** → Votre projet → **Settings** → **Environment Variables**
2. **Ajouter une nouvelle variable :**
   - **Name :** `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value :** Coller le JSON complet (sur une seule ligne, entre guillemets simples)
   - **Environments :** Production, Preview, Development
3. **Sauvegarder**
4. **Redéployer** l'application pour que la variable soit prise en compte

## ✅ Étape 3 : Vérifier la configuration

1. **Redémarrer le serveur de développement :**
   ```bash
   npm run dev
   ```

2. **Tester la suppression d'un utilisateur :**
   - Aller sur `/utilisateurs`
   - Essayer de supprimer un utilisateur de test
   - L'utilisateur devrait être supprimé de **Firebase Auth ET Firestore**

## 🔒 Sécurité

✅ **À faire :**
- Stocker la clé dans `.env.local` (déjà dans `.gitignore`)
- Stocker la clé dans Vercel Environment Variables (chiffrées)
- Utiliser la clé uniquement côté serveur (Server Actions)

❌ **À ne jamais faire :**
- Commiter le fichier JSON dans Git
- Mettre la clé dans le code source
- Exposer la clé dans les logs
- Partager la clé publiquement

## 🐛 Dépannage

### Erreur : "FIREBASE_SERVICE_ACCOUNT_KEY n'est pas configuré"

**Cause :** La variable d'environnement n'est pas définie ou mal formatée.

**Solution :**
1. Vérifier que `.env.local` contient bien `FIREBASE_SERVICE_ACCOUNT_KEY`
2. Vérifier que le JSON est sur une seule ligne
3. Redémarrer le serveur de développement

### Erreur : "Invalid JSON"

**Cause :** Le JSON est mal formaté (retours à la ligne, guillemets mal échappés).

**Solution :**
1. Vérifier que le JSON est valide (utiliser un validateur JSON en ligne)
2. S'assurer que le JSON est sur une seule ligne
3. Utiliser des guillemets simples autour du JSON dans `.env.local`

### L'utilisateur est supprimé de Firestore mais pas de Auth

**Cause :** La clé privée n'est pas configurée ou invalide.

**Solution :**
1. Vérifier que `FIREBASE_SERVICE_ACCOUNT_KEY` est bien configuré
2. Vérifier que la clé correspond au bon projet Firebase
3. Vérifier les logs pour les erreurs spécifiques

## 📚 Références

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Service Account Keys](https://firebase.google.com/docs/admin/setup#initialize-sdk)
