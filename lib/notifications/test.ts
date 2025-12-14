/**
 * Server Action pour tester les notifications Slack
 */
"use server";

import { sendSlackNotification } from "@/lib/slack";

export async function testSlack(): Promise<{ success: boolean; message: string }> {
  try {
    // Vérifier la configuration avant d'essayer d'envoyer
    const slackEnabled = process.env.SLACK_ENABLED;
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (slackEnabled !== "true") {
      return {
        success: false,
        message: `SLACK_ENABLED n'est pas activé (valeur actuelle: "${slackEnabled || "non défini"}"). Définissez SLACK_ENABLED=true dans .env.local`,
      };
    }

    if (!webhookUrl) {
      return {
        success: false,
        message: "SLACK_WEBHOOK_URL n'est pas configuré dans .env.local",
      };
    }

    if (!webhookUrl.startsWith("https://hooks.slack.com/")) {
      return {
        success: false,
        message: "SLACK_WEBHOOK_URL ne semble pas être une URL de webhook Slack valide",
      };
    }

    const result = await sendSlackNotification("🔔 Test Slack — OK");

    if (result) {
      return {
        success: true,
        message: "Notification Slack envoyée avec succès ! Vérifiez votre canal Slack.",
      };
    }

    return {
      success: false,
      message: "Échec de l'envoi. Vérifiez que votre webhook Slack est valide et actif.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue lors du test",
    };
  }
}
