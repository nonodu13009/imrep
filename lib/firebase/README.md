# 🔥 Configuration Firebase

Ce dossier contient la configuration Firebase pour le projet.

## 📋 Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Utilisation

```tsx
import { db, auth, storage } from "@/lib/firebase/config";

// Utiliser Firestore
import { collection, getDocs } from "firebase/firestore";
const querySnapshot = await getDocs(collection(db, "users"));

// Utiliser Auth
import { signInWithEmailAndPassword } from "firebase/auth";
await signInWithEmailAndPassword(auth, email, password);

// Utiliser Storage
import { ref, uploadBytes } from "firebase/storage";
const storageRef = ref(storage, "images/file.jpg");
```

## 🔒 Sécurité

- Les variables d'environnement doivent commencer par `NEXT_PUBLIC_` pour être accessibles côté client
- Ne jamais commiter le fichier `.env.local` (déjà dans `.gitignore`)
- Utiliser les règles de sécurité Firestore pour protéger les données

