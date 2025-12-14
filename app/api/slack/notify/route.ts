import { NextResponse } from "next/server";

/**
 * API Route pour envoyer des notifications Slack
 * Utilisée comme proxy car les variables d'environnement sont bien chargées dans les API routes
 */
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Le paramètre 'text' est requis" },
        { status: 400 }
      );
    }

    const slackEnabled = process.env.SLACK_ENABLED;
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (slackEnabled !== "true") {
      return NextResponse.json(
        { success: false, error: "SLACK_ENABLED n'est pas activé" },
        { status: 400 }
      );
    }

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: "SLACK_WEBHOOK_URL n'est pas configuré" },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `Erreur Slack: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Slack API] Erreur:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
