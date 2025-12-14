/**
 * Module centralisé pour l'envoi de notifications Slack
 * Utilise SLACK_WEBHOOK_URL depuis les variables d'environnement
 */

/**
 * Envoie une notification Slack directement (utilisé dans les API routes)
 */
async function sendSlackNotificationDirect(text: string): Promise<boolean> {
  const slackEnabled = process.env.SLACK_ENABLED;
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (slackEnabled !== "true" || !webhookUrl) {
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Envoie une notification Slack simple avec un texte
 * Essaie d'abord d'utiliser directement les variables d'environnement
 * Si elles ne sont pas disponibles, utilise l'API route comme proxy
 * @param text - Le message à envoyer
 * @returns Promise<boolean> - true si succès, false sinon
 */
export async function sendSlackNotification(text: string): Promise<boolean> {
  // Essayer d'abord d'utiliser directement les variables d'environnement
  const slackEnabled = process.env.SLACK_ENABLED;
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (slackEnabled === "true" && webhookUrl) {
    // Les variables sont disponibles, utiliser directement
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Slack] Erreur HTTP:", response.status, "-", errorText);
        return false;
      }

      console.log("[Slack] Notification envoyée avec succès");
      return true;
    } catch (error) {
      console.error("[Slack] Erreur lors de l'envoi:", error instanceof Error ? error.message : error);
      return false;
    }
  }

  // Les variables ne sont pas disponibles, utiliser l'API route comme proxy
  try {
    // En production sur Vercel, utiliser l'URL automatique ou celle fournie
    const baseUrl = 
      process.env.NEXT_PUBLIC_APP_URL || 
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
      process.env.NEXT_PUBLIC_VERCEL_URL || 
      "http://localhost:3000";
    
    const response = await fetch(`${baseUrl}/api/slack/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Erreur inconnue" }));
      console.error("[Slack] Erreur API:", response.status, errorData.error || "Erreur inconnue");
      return false;
    }

    const result = await response.json();
    
    if (result.success) {
      console.log("[Slack] Notification envoyée avec succès (via API route)");
      return true;
    }

    console.error("[Slack] Échec de l'envoi:", result.error || "Erreur inconnue");
    return false;
  } catch (error) {
    console.error("[Slack] Erreur lors de l'appel à l'API route:", error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Envoie une notification Slack formatée avec titre et détails
 * @param title - Titre de la notification
 * @param details - Objet contenant les détails à afficher
 * @returns Promise<boolean> - true si succès, false sinon
 */
export async function sendSlackEvent(
  title: string,
  details: Record<string, any>
): Promise<boolean> {
  // Vérifier si Slack est activé
  if (process.env.SLACK_ENABLED !== "true") {
    return false;
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("SLACK_WEBHOOK_URL n'est pas configuré");
    return false;
  }

  // Formater les détails en texte
  const detailsText = Object.entries(details)
    .map(([key, value]) => {
      const formattedValue =
        value instanceof Date
          ? value.toLocaleDateString("fr-FR")
          : value === null || value === undefined
            ? "N/A"
            : String(value);
      return `• ${key}: ${formattedValue}`;
    })
    .join("\n");

  const message = `${title}\n${detailsText}`;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur lors de l'envoi Slack:", response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification Slack:", error);
    return false;
  }
}
