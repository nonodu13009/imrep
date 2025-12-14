"use client";

import { useState } from "react";
import { testSlack } from "@/lib/notifications/test";
import Button from "@/components/ui/Button";

export default function SlackTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await testSlack();
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test des notifications Slack</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <p className="text-gray-600">
            Cette page permet de tester l&apos;envoi de notifications Slack.
          </p>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              <strong>Configuration requise :</strong>
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
              <li>SLACK_ENABLED=true dans .env.local</li>
              <li>SLACK_WEBHOOK_URL configuré dans .env.local</li>
            </ul>
          </div>

          <Button onClick={handleTest} disabled={loading} className="w-full">
            {loading ? "Envoi en cours..." : "Tester Slack"}
          </Button>

          {result && (
            <div
              className={`p-4 rounded ${
                result.success
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <p className="font-semibold">
                {result.success ? "✅ Succès" : "❌ Échec"}
              </p>
              <p className="text-sm mt-1">{result.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
