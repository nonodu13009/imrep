# 🚀 Guide de déploiement sur Vercel

## ⚠️ Précautions importantes

### 1. Variables d'environnement à configurer dans Vercel

Dans le dashboard Vercel, allez dans **Settings > Environment Variables** et ajoutez :

#### Variables Firebase (déjà existantes)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_clé
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_domaine
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

#### Variables Slack (à ajouter)
```env
SLACK_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/VOTRE/WEBHOOK/URL
```

#### Variable optionnelle (pour l'API route proxy)
```env
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
```
**Note :** Cette variable est optionnelle. Si elle n'est pas définie, le système utilisera automatiquement l'URL Vercel (`VERCEL_URL`).

### 2. Environnements Vercel

Configurez les variables pour les bons environnements :
- **Production** : Toutes les variables
- **Preview** : Toutes les variables (ou `SLACK_ENABLED=false` pour désactiver en preview)
- **Development** : Variables de développement

### 3. Sécurité

✅ **À faire :**
- Configurer toutes les variables dans Vercel (pas dans le code)
- Utiliser des secrets Vercel pour `SLACK_WEBHOOK_URL`
- Vérifier que `.env.local` est dans `.gitignore` (déjà fait)

❌ **À ne pas faire :**
- Commiter `.env.local`
- Mettre les secrets dans le code
- Exposer les webhooks dans les logs

### 4. Test après déploiement

1. **Tester la page de test Slack :**
   - Visitez `https://votre-domaine.vercel.app/slack-test`
   - Cliquez sur "Tester Slack"
   - Vérifiez que la notification arrive dans Slack

2. **Tester une action réelle :**
   - Créez un lot dans l'application
   - Vérifiez que la notification arrive dans Slack

3. **Vérifier les logs Vercel :**
   - Allez dans **Deployments > [votre déploiement] > Functions**
   - Vérifiez qu'il n'y a pas d'erreurs liées à Slack

### 5. Problèmes courants

#### Les notifications ne fonctionnent pas en production

**Causes possibles :**
- Variables d'environnement non configurées dans Vercel
- `SLACK_ENABLED` n'est pas à `"true"` (vérifiez les guillemets)
- Le webhook Slack a expiré ou été révoqué
- L'URL de l'API route est incorrecte

**Solution :**
1. Vérifiez les variables dans Vercel Dashboard
2. Redéployez après avoir ajouté/modifié les variables
3. Testez avec `/slack-test`
4. Vérifiez les logs Vercel pour les erreurs

#### L'API route proxy ne fonctionne pas

**Cause :** L'URL de base est incorrecte

**Solution :** Ajoutez `NEXT_PUBLIC_APP_URL` dans Vercel avec votre URL de production, ou laissez le système utiliser automatiquement `VERCEL_URL`.

### 6. Checklist de déploiement

- [ ] Toutes les variables Firebase sont configurées dans Vercel
- [ ] `SLACK_ENABLED=true` est configuré dans Vercel
- [ ] `SLACK_WEBHOOK_URL` est configuré dans Vercel (en tant que secret)
- [ ] `NEXT_PUBLIC_APP_URL` est configuré (optionnel, pour l'API route)
- [ ] Le projet est connecté à Vercel
- [ ] Le déploiement initial est réussi
- [ ] La page `/slack-test` fonctionne
- [ ] Les notifications arrivent dans Slack lors des actions réelles

### 7. Monitoring

Surveillez les logs Vercel pour :
- Erreurs d'envoi Slack
- Variables d'environnement manquantes
- Problèmes de connexion au webhook Slack

Les logs apparaissent dans **Deployments > [déploiement] > Functions** ou dans les logs en temps réel.

---

**Note :** En production, les variables d'environnement sont chargées au démarrage. Si vous modifiez des variables dans Vercel, vous devez redéployer pour que les changements prennent effet.
