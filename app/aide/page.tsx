"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { SectionTitle, Card } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export default function AidePage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, roleLoading, router]);

  if (authLoading || roleLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-base text-[var(--color-neutral-600)]">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SectionTitle>Guide d'utilisation</SectionTitle>

      <div className="space-y-6">
        {/* Section commune IMREP et Allianz */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-4">
            Fonctionnement général
          </h2>
          <div className="space-y-4 text-[var(--color-neutral-700)]">
            <div>
              <h3 className="font-semibold text-[var(--color-dark)] mb-2">Cycle de vie d'un lot</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>
                  <strong>En attente</strong> : Le lot est créé par IMREP et attend la validation d'Allianz
                </li>
                <li>
                  <strong>Validé</strong> : Allianz a validé l'entrée du lot. Le lot est maintenant assuré
                </li>
                <li>
                  <strong>Refusé</strong> : Allianz a refusé l'entrée du lot avec un motif de refus
                </li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--color-dark)] mb-2">Actions sur les lots</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Consulter</strong> : Cliquez sur l'icône œil pour voir les détails d'un lot
                </li>
                <li>
                  <strong>Modifier</strong> : Un lot "en attente" peut être modifié par son créateur IMREP
                </li>
                <li>
                  <strong>Demander une sortie</strong> : Pour un lot validé, IMREP peut demander l'arrêt de la gestion
                </li>
                <li>
                  <strong>Demander une suppression</strong> : Pour un lot "en attente", IMREP peut demander la suppression avec un motif (perte de la gestion, vente, autre)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--color-dark)] mb-2">Différence entre sortie et suppression</h3>
              <div className="bg-[var(--color-light)] p-4 rounded-[var(--radius-md)] space-y-2">
                <p>
                  <strong>Suppression</strong> : Annule une demande d'entrée qui n'a pas encore été validée. Le lot est retiré du système après validation par Allianz.
                </p>
                <p>
                  <strong>Sortie</strong> : Arrête la gestion d'un lot déjà assuré. Le lot reste dans le système mais n'est plus géré après validation par Allianz.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--color-dark)] mb-2">Tableau des lots</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Utilisez les icônes de tri pour classer les colonnes par ordre croissant ou décroissant</li>
                <li>Survolez l'icône de localisation pour voir l'adresse complète d'un lot</li>
                <li>Les badges de couleur indiquent le statut : jaune (en attente), vert (validé), rouge (refusé)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--color-dark)] mb-2">KPIs et statistiques</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Les KPIs affichent le nombre de lots par statut</li>
                <li>Utilisez les selects pour filtrer par type de logement ou code postal</li>
                <li>Les graphiques en camembert montrent la répartition globale par type et par code postal</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Section spécifique Allianz */}
        {role === "allianz" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-4">
              Fonctionnalités Allianz
            </h2>
            <div className="space-y-4 text-[var(--color-neutral-700)]">
              <div>
                <h3 className="font-semibold text-[var(--color-dark)] mb-2">Validation et refus</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Valider une entrée</strong> : Cliquez sur l'icône de validation (✓) pour un lot "en attente". Vous devrez renseigner le numéro de contrat.
                  </li>
                  <li>
                    <strong>Refuser une entrée</strong> : Cliquez sur l'icône de refus (✗) et indiquez le motif de refus.
                  </li>
                  <li>
                    <strong>Valider une sortie</strong> : Pour une sortie en attente, validez pour arrêter la gestion du lot.
                  </li>
                  <li>
                    <strong>Refuser une sortie</strong> : Refusez une demande de sortie avec un motif de refus.
                  </li>
                  <li>
                    <strong>Valider une suppression</strong> : Validez une demande de suppression pour retirer définitivement le lot du système.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--color-dark)] mb-2">Gestion des utilisateurs</h3>
                <p className="mb-2">
                  Accédez à la page "Utilisateurs" depuis le menu pour :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Créer de nouveaux utilisateurs (IMREP ou Allianz)</li>
                  <li>Modifier le rôle d'un utilisateur</li>
                  <li>Activer ou désactiver un utilisateur</li>
                  <li>Supprimer un utilisateur (sauf le root admin)</li>
                </ul>
                <p className="mt-3 text-sm text-[var(--color-neutral-600)] italic">
                  Note : Le root admin (jeanmichel@allianz-nogaro.fr) ne peut pas être modifié ou supprimé.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--color-dark)] mb-2">Vue globale</h3>
                <p>
                  En tant qu'Allianz, vous avez accès à tous les lots de tous les utilisateurs IMREP. 
                  Vous pouvez filtrer par statut et par IMREP pour faciliter la gestion.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--color-dark)] mb-2">Boutons d'action</h3>
                <div className="bg-[var(--color-light)] p-4 rounded-[var(--radius-md)] space-y-2">
                  <p>
                    <strong>Valider entrée</strong> : Icône avec libellé "Valider entrée" - Valide l'entrée d'un lot en attente
                  </p>
                  <p>
                    <strong>Refuser entrée</strong> : Icône avec libellé "Refuser entrée" - Refuse l'entrée d'un lot en attente
                  </p>
                  <p>
                    <strong>Valider sortie</strong> : Icône sortie avec libellé "Valider sortie" - Valide la sortie d'un lot
                  </p>
                  <p>
                    <strong>Refuser sortie</strong> : Icône avec libellé "Refuser sortie" - Refuse une demande de sortie
                  </p>
                  <p>
                    <strong>Valider suppression</strong> : Icône poubelle avec libellé "Valider suppression" - Valide la suppression d'un lot
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Section spécifique IMREP */}
        {role === "imrep" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-4">
              Fonctionnalités IMREP
            </h2>
            <div className="space-y-4 text-[var(--color-neutral-700)]">
              <div>
                <h3 className="font-semibold text-[var(--color-dark)] mb-2">Création de lots</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cliquez sur "Créer un lot" pour déclarer un nouveau logement PNO</li>
                  <li>Remplissez tous les champs obligatoires (code propriétaire, code lot, adresse, etc.)</li>
                  <li>La date d'effet demandée est par défaut J+1 et ne peut pas être dans le passé</li>
                  <li>Les adresses et noms sont automatiquement capitalisés lors de la saisie</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--color-dark)] mb-2">Modification de lots</h3>
                <p className="mb-2">
                  Vous pouvez modifier un lot uniquement si :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Le statut est "en attente"</li>
                  <li>Vous êtes le créateur du lot</li>
                </ul>
                <p className="mt-3 text-sm text-[var(--color-neutral-600)] italic">
                  Une fois validé par Allianz, le lot ne peut plus être modifié.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--color-dark)] mb-2">Vue personnalisée</h3>
                <p>
                  Vous ne voyez que vos propres lots. Utilisez les filtres pour affiner votre recherche par statut.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

