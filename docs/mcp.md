# 📡 MCP Server Slack — Documentation

## 📋 Vue d'ensemble

Ce document décrit l'installation, la configuration et l'utilisation du **MCP Server Slack** pour l'application de gestion PNO Allianz/IMREP.

Le MCP (Model Context Protocol) Server permet d'envoyer des notifications Slack automatiques lors des actions importantes sur les lots : création, modification, demande de sortie, validation, refus, suppression, etc.

## 🎯 Objectif

Créer un serveur MCP externe permettant d'envoyer des messages Slack lors des actions IMREP/Allianz. Le backend Next.js appellera le MCP via JSON-RPC pour notifier les équipes des événements importants.

## 🏗️ Architecture

```
┌─────────────────┐         JSON-RPC          ┌──────────────────┐
│   Next.js App   │ ────────────────────────> │  MCP Server      │
│  (Server Action)│                           │  (Node.js)       │
└─────────────────┘                           └────────┬─────────┘
                                                       │
                                                       │ HTTP POST
                                                       ▼
                                              ┌──────────────────┐
                                              │  Slack Webhook   │
                                              │  (Incoming)      │
                                              └──────────────────┘
```

### Composants

- **MCP Server** : Serveur Node.js indépendant qui expose une méthode `sendSlackMessage`
- **Next.js** : Application principale qui appelle le MCP via JSON-RPC
- **Slack Webhook** : URL d'intégration Slack pour recevoir les messages

## 📁 Structure du projet

```
imrep-allianz-gestion-pno/
├── mcp/
│   └── slack-server/
│       ├── package.json
│       ├── index.js
│       ├── .env              # Non versionné
│       └── README.md
└── lib/
    └── mcp/
        └── slack.ts          # Utilitaire d'appel au MCP
```

## 🚀 Installation

### Étape 1 : Créer le dossier MCP

Créer le dossier à la racine du projet :

```bash
mkdir -p mcp/slack-server
cd mcp/slack-server
```

### Étape 2 : Initialiser le projet

Créer un `package.json` avec les dépendances nécessaires :

```json
{
  "name": "slack-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "description": "MCP Server pour l'envoi de notifications Slack",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "node-fetch": "^3.3.2",
    "dotenv": "^16.3.1"
  }
}
```

### Étape 3 : Installer les dépendances

```bash
npm install
```

### Étape 4 : Créer le serveur MCP

Créer `index.js` :

```javascript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const slackWebhook = process.env.SLACK_WEBHOOK_URL;

if (!slackWebhook) {
  console.error("❌ SLACK_WEBHOOK_URL n'est pas configuré dans .env");
  process.exit(1);
}

const server = new Server({
  name: "slack-mcp",
  version: "1.0.0",
});

server.setRequestHandler(async (request) => {
  if (request.method === "sendSlackMessage") {
    const { text } = request.params || {};

    if (!text) {
      throw new Error("Le paramètre 'text' est requis");
    }

    try {
      const response = await fetch(slackWebhook, {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur Slack : ${response.status} - ${errorText}`);
      }

      return { ok: true, message: "Message Slack envoyé avec succès" };
    } catch (error) {
      console.error("Erreur lors de l'envoi à Slack:", error);
      throw error;
    }
  }

  throw new Error(`Méthode non supportée: ${request.method}`);
});

// Démarrer le serveur
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`🚀 MCP Server Slack démarré sur le port ${port}`);
  console.log(`📡 Prêt à recevoir des requêtes JSON-RPC`);
});
```

### Étape 5 : Configurer les variables d'environnement

Créer un fichier `.env` dans `mcp/slack-server/` :

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
PORT=4000
```

**⚠️ Important** : Ajouter `.env` au `.gitignore` pour ne pas versionner les secrets :

```bash
echo "mcp/slack-server/.env" >> .gitignore
```

### Étape 6 : Obtenir l'URL du webhook Slack

1. Aller sur [api.slack.com/apps](https://api.slack.com/apps)
2. Créer une nouvelle app ou sélectionner une app existante
3. Aller dans **Incoming Webhooks**
4. Activer les Incoming Webhooks
5. Cliquer sur **Add New Webhook to Workspace**
6. Sélectionner le canal où envoyer les notifications
7. Copier l'URL du webhook dans `.env`

### Étape 7 : Démarrer le serveur

```bash
npm start
# ou en mode développement avec watch
npm run dev
```

Le serveur écoute sur `http://localhost:4000` par défaut.

## 🔌 Intégration avec Next.js

### Créer l'utilitaire d'appel MCP

Créer `lib/mcp/slack.ts` :

```typescript
/**
 * Envoie une notification Slack via le MCP Server
 * @param text - Le message à envoyer à Slack
 * @returns Promise avec la réponse du serveur MCP
 */
export async function notifySlack(text: string): Promise<{ ok: boolean; message?: string }> {
  const mcpServerUrl = process.env.MCP_SERVER_URL || "http://localhost:4000";

  try {
    const response = await fetch(`${mcpServerUrl}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now().toString(),
        method: "sendSlackMessage",
        params: { text },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message || "Erreur MCP");
    }

    return result.result || { ok: true };
  } catch (error) {
    console.error("Erreur lors de l'appel au MCP Server:", error);
    // Ne pas faire échouer l'action principale si Slack échoue
    return { ok: false, message: error instanceof Error ? error.message : "Erreur inconnue" };
  }
}
```

### Ajouter la variable d'environnement

Ajouter dans `.env.local` de Next.js :

```env
MCP_SERVER_URL=http://localhost:4000
```

## 📝 Exemples d'intégration

### Exemple 1 : Notification lors de la création d'un lot

Dans `lib/lots/actions.ts`, après la création réussie :

```typescript
import { notifySlack } from "@/lib/mcp/slack";

export async function createLot(lotData: Omit<Lot, "id" | "statut" | "createdAt" | "updatedAt" | "history" | "createdBy">, userId: string): Promise<string> {
  try {
    // ... code existant de création ...

    const lotRef = doc(collection(db, "lots"));
    await setDoc(lotRef, firestoreData);

    // Notification Slack
    await notifySlack(
      `🏠 *Nouveau lot créé*\n` +
      `• Adresse: ${lotData.adresse}\n` +
      `• Numéro de contrat: ${lotData.numeroContrat || "À définir"}\n` +
      `• Statut: En attente de validation\n` +
      `• Créé par: ${userId}`
    );

    return lotRef.id;
  } catch (error) {
    // ... gestion d'erreur ...
  }
}
```

### Exemple 2 : Notification lors de la validation

```typescript
export async function validateEntree(lotId: string, numeroContrat: string, validatedBy: string): Promise<void> {
  try {
    // ... code existant de validation ...

    await updateDoc(doc(db, "lots", lotId), updateData);

    // Notification Slack
    const lot = await getLotById(lotId);
    if (lot) {
      await notifySlack(
        `✅ *Lot validé*\n` +
        `• Adresse: ${lot.adresse}\n` +
        `• Numéro de contrat: ${numeroContrat}\n` +
        `• Validé par: ${validatedBy}`
      );
    }
  } catch (error) {
    // ... gestion d'erreur ...
  }
}
```

### Exemple 3 : Notification lors d'un refus

```typescript
export async function refuseEntree(lotId: string, motifRefus: string, refusedBy: string): Promise<void> {
  try {
    // ... code existant de refus ...

    await updateDoc(doc(db, "lots", lotId), updateData);

    // Notification Slack
    const lot = await getLotById(lotId);
    if (lot) {
      await notifySlack(
        `❌ *Lot refusé*\n` +
        `• Adresse: ${lot.adresse}\n` +
        `• Motif: ${motifRefus}\n` +
        `• Refusé par: ${refusedBy}`
      );
    }
  } catch (error) {
    // ... gestion d'erreur ...
  }
}
```

## 📍 Points d'intégration suggérés

### Actions IMREP

| Action | Fonction | Message suggéré |
|--------|----------|-----------------|
| Création de lot | `createLot` | "🏠 Nouveau lot créé" |
| Modification de lot | `updateLot` | "✏️ Lot modifié" |
| Demande de sortie | `requestSortie` | "🚪 Demande de sortie" |
| Demande de suppression | `requestSuppression` | "🗑️ Demande de suppression" |

### Actions Allianz

| Action | Fonction | Message suggéré |
|--------|----------|-----------------|
| Validation entrée | `validateEntree` | "✅ Lot validé" |
| Refus entrée | `refuseEntree` | "❌ Lot refusé" |
| Validation sortie | `validateSortie` | "✅ Sortie validée" |
| Refus sortie | `refuseSortie` | "❌ Sortie refusée" |
| Validation suppression | `validateSuppression` | "✅ Suppression validée" |
| Refus suppression | `refuseSuppression` | "❌ Suppression refusée" |

## 🔧 Configuration dans Cursor (optionnel)

Si vous utilisez Cursor avec le support MCP natif, vous pouvez configurer le serveur dans les paramètres :

```json
{
  "mcpServers": {
    "slack-mcp": {
      "command": "node",
      "args": ["/chemin/vers/mcp/slack-server/index.js"],
      "env": {
        "SLACK_WEBHOOK_URL": "votre-webhook-url"
      }
    }
  }
}
```

## 🧪 Tests

### Tester le serveur MCP directement

```bash
curl -X POST http://localhost:4000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "sendSlackMessage",
    "params": {
      "text": "🧪 Test de notification Slack"
    }
  }'
```

### Tester depuis Next.js

Créer une route API de test (temporaire) :

```typescript
// app/api/test-slack/route.ts
import { notifySlack } from "@/lib/mcp/slack";

export async function GET() {
  const result = await notifySlack("🧪 Test de notification depuis Next.js");
  return Response.json(result);
}
```

Puis visiter `http://localhost:3000/api/test-slack` dans le navigateur.

## ⚠️ Notes importantes

### Sécurité

- ✅ Le fichier `.env` ne doit **jamais** être versionné
- ✅ Utiliser des variables d'environnement pour tous les secrets
- ✅ Le serveur MCP doit être accessible uniquement en localhost en développement
- ✅ En production, protéger le serveur MCP avec une authentification

### Gestion des erreurs

- Les erreurs Slack ne doivent **pas** faire échouer les actions principales
- Logger les erreurs pour le debugging
- Retourner un statut `ok: false` sans lever d'exception

### Performance

- Les appels Slack sont asynchrones et non-bloquants
- En cas d'échec, l'action principale continue normalement
- Considérer l'ajout d'un système de retry pour les échecs temporaires

## 🚢 Déploiement

### Développement local

Le serveur MCP fonctionne en local et est appelé par Next.js via `localhost:4000`.

### Production

Pour la production, plusieurs options :

1. **Déployer le MCP Server séparément** (Vercel Serverless, Railway, etc.)
2. **Intégrer directement dans Next.js** via une route API
3. **Utiliser un service externe** (Zapier, Make, etc.)

**Recommandation** : Pour simplifier, créer une route API Next.js qui remplace le MCP Server :

```typescript
// app/api/slack/route.ts
import { notifySlack } from "@/lib/mcp/slack";

export async function POST(request: Request) {
  const { text } = await request.json();
  const result = await notifySlack(text);
  return Response.json(result);
}
```

Puis modifier `lib/mcp/slack.ts` pour utiliser cette route en production.

## 📚 Ressources

- [Documentation MCP](https://modelcontextprotocol.io/)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)

## 🔄 Maintenance

### Logs

Le serveur MCP affiche les logs dans la console. Pour un environnement de production, considérer l'ajout d'un système de logging (Winston, Pino, etc.).

### Monitoring

Surveiller :
- Les erreurs d'envoi Slack
- Le temps de réponse du serveur MCP
- Le taux de succès des notifications

---

**Dernière mise à jour** : 2025-01-27
