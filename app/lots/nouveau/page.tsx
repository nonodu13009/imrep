"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { SectionTitle, Button, Input, Select, Card } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { createLot } from "@/lib/lots/actions";
import { Etage, TypeLogement } from "@/lib/lots/types";
import { useToast } from "@/components/ui";
import { capitalizeAddress, capitalizeName } from "@/lib/utils/capitalize";

export default function NouveauLotPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const { showToast } = useToast();

  // Champs obligatoires
  const [codeProprietaire, setCodeProprietaire] = useState("");
  const [nomProprietaire, setNomProprietaire] = useState("");
  const [codeLot, setCodeLot] = useState("");
  const [adresse, setAdresse] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [ville, setVille] = useState("");
  const [complementAdresse, setComplementAdresse] = useState("");
  const [etage, setEtage] = useState<Etage>("rez-de-chaussée");
  const [typeLogement, setTypeLogement] = useState<TypeLogement>(1);
  const [garageADiffAdresse, setGarageADiffAdresse] = useState(false);
  const [adresseGarage, setAdresseGarage] = useState("");
  const [dateDebutGestion, setDateDebutGestion] = useState("");
  const [dateEffetDemandee, setDateEffetDemandee] = useState("");
  const [note, setNote] = useState("");

  // Erreurs de validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Calculer la date d'effet par défaut (J+1)
  useEffect(() => {
    if (!dateEffetDemandee) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedDate = tomorrow.toISOString().split("T")[0];
      setDateEffetDemandee(formattedDate);
    }
  }, []);

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (role !== "imrep") {
      router.push("/dashboard");
      return;
    }
  }, [user, role, authLoading, roleLoading, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!codeProprietaire.trim()) {
      newErrors.codeProprietaire = "Le code propriétaire est obligatoire";
    }

    if (!nomProprietaire.trim()) {
      newErrors.nomProprietaire = "Le nom du propriétaire est obligatoire";
    }

    if (!codeLot.trim()) {
      newErrors.codeLot = "Le code lot est obligatoire";
    }

    if (!adresse.trim()) {
      newErrors.adresse = "L'adresse est obligatoire";
    }

    if (!codePostal.trim()) {
      newErrors.codePostal = "Le code postal est obligatoire";
    } else if (!/^\d{5}$/.test(codePostal.trim())) {
      newErrors.codePostal = "Le code postal doit contenir 5 chiffres";
    }

    if (!ville.trim()) {
      newErrors.ville = "La ville est obligatoire";
    }

    if (!dateDebutGestion) {
      newErrors.dateDebutGestion = "La date de début de gestion est obligatoire";
    }

    if (!dateEffetDemandee) {
      newErrors.dateEffetDemandee = "La date d'effet demandée est obligatoire";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateEffet = new Date(dateEffetDemandee);
      dateEffet.setHours(0, 0, 0, 0);

      if (dateEffet < today) {
        newErrors.dateEffetDemandee = "La date d'effet ne peut pas être dans le passé";
      }
    }

    if (garageADiffAdresse && !adresseGarage.trim()) {
      newErrors.adresseGarage = "L'adresse du garage est obligatoire si le garage est à une adresse différente";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    setIsLoading(true);

    try {
      const lotData = {
        codeProprietaire: codeProprietaire.trim(),
        nomProprietaire: nomProprietaire.trim(),
        codeLot: codeLot.trim(),
        adresse: adresse.trim(),
        codePostal: codePostal.trim(),
        ville: ville.trim(),
        complementAdresse: complementAdresse.trim() || undefined,
        etage,
        typeLogement,
        garageADiffAdresse,
        adresseGarage: garageADiffAdresse ? adresseGarage.trim() : undefined,
        dateDebutGestion: new Date(dateDebutGestion),
        dateEffetDemandee: new Date(dateEffetDemandee),
        note: note.trim() || undefined,
      };

      const lotId = await createLot(lotData, user.uid);
      showToast("Lot créé avec succès", "success");
      router.push(`/lots/${lotId}`);
    } catch (error: any) {
      console.error("Erreur lors de la création du lot:", error);
      showToast(error.message || "Erreur lors de la création du lot", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
      <SectionTitle>Créer un nouveau lot</SectionTitle>

      <Card className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-[var(--spacing-md)]">
          {/* Informations principales */}
          <div className="space-y-[var(--spacing-sm)]">
            <h3 className="text-[18px] font-semibold text-[var(--color-dark)] mb-[var(--spacing-sm)]">
              Informations principales
            </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-sm)]">
                    <Input
                      label="Code propriétaire *"
                      value={codeProprietaire}
                      onChange={(e) => setCodeProprietaire(e.target.value)}
                      error={errors.codeProprietaire}
                      required
                    />
                    <Input
                      label="Code lot *"
                      value={codeLot}
                      onChange={(e) => setCodeLot(e.target.value)}
                      error={errors.codeLot}
                      required
                    />
                  </div>

                  <Input
                    label="Nom du propriétaire *"
                    value={nomProprietaire}
                    onChange={(e) => setNomProprietaire(capitalizeName(e.target.value))}
                    error={errors.nomProprietaire}
                    required
                  />

            <Input
              label="Adresse *"
              value={adresse}
              onChange={(e) => {
                const capitalized = capitalizeAddress(e.target.value);
                setAdresse(capitalized);
              }}
              error={errors.adresse}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-sm)]">
              <Input
                label="Code postal *"
                value={codePostal}
                onChange={(e) => setCodePostal(e.target.value.replace(/\D/g, "").slice(0, 5))}
                error={errors.codePostal}
                required
                placeholder="13001"
                maxLength={5}
              />
              <Input
                label="Ville *"
                value={ville}
                onChange={(e) => {
                  const capitalized = capitalizeAddress(e.target.value);
                  setVille(capitalized);
                }}
                error={errors.ville}
                required
                className="md:col-span-2"
              />
            </div>

            <Input
              label="Complément d'adresse"
              value={complementAdresse}
              onChange={(e) => {
                const capitalized = capitalizeAddress(e.target.value);
                setComplementAdresse(capitalized);
              }}
              error={errors.complementAdresse}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-sm)]">
              <Select
                label="Étage *"
                value={etage}
                onChange={(e) => setEtage(e.target.value as Etage)}
                error={errors.etage}
                required
              >
                <option value="rez-de-chaussée">Rez-de-chaussée</option>
                <option value="intermédiaire">Intermédiaire</option>
                <option value="dernier étage">Dernier étage</option>
              </Select>

              <Select
                label="Type de logement *"
                value={typeLogement}
                onChange={(e) => setTypeLogement(parseInt(e.target.value) as TypeLogement)}
                error={errors.typeLogement}
                required
              >
                <option value={1}>1 pièce</option>
                <option value={2}>2 pièces</option>
                <option value={3}>3 pièces</option>
                <option value={4}>4 pièces</option>
                <option value={5}>5 pièces</option>
              </Select>
            </div>
          </div>

          {/* Garage */}
          <div className="space-y-[var(--spacing-sm)]">
            <h3 className="text-[18px] font-semibold text-[var(--color-dark)] mb-[var(--spacing-sm)]">
              Garage
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="garageADiffAdresse"
                checked={garageADiffAdresse}
                onChange={(e) => setGarageADiffAdresse(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-neutral-200)]"
              />
              <label htmlFor="garageADiffAdresse" className="text-sm text-[var(--color-neutral-700)]">
                Le garage est à une adresse différente
              </label>
            </div>

            {garageADiffAdresse && (
              <Input
                label="Adresse du garage *"
                value={adresseGarage}
                onChange={(e) => setAdresseGarage(e.target.value)}
                error={errors.adresseGarage}
                required={garageADiffAdresse}
              />
            )}
          </div>

          {/* Dates */}
          <div className="space-y-[var(--spacing-sm)]">
            <h3 className="text-[18px] font-semibold text-[var(--color-dark)] mb-[var(--spacing-sm)]">
              Dates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-sm)]">
              <Input
                type="date"
                label="Date de début de gestion *"
                value={dateDebutGestion}
                onChange={(e) => setDateDebutGestion(e.target.value)}
                error={errors.dateDebutGestion}
                required
              />

              <Input
                type="date"
                label="Date d'effet demandée *"
                value={dateEffetDemandee}
                onChange={(e) => setDateEffetDemandee(e.target.value)}
                error={errors.dateEffetDemandee}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <p className="text-xs text-[var(--color-neutral-500)]">
              La date d'effet demandée doit être aujourd'hui ou dans le futur. Par défaut : J+1.
            </p>
          </div>

          {/* Note */}
          <div className="space-y-[var(--spacing-sm)]">
            <h3 className="text-[18px] font-semibold text-[var(--color-dark)] mb-[var(--spacing-sm)]">
              Note (optionnel)
            </h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-[var(--color-neutral-200)] rounded-[var(--radius-md)] px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-h-[100px]"
              placeholder="Ajoutez une note si nécessaire..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-[var(--spacing-sm)] pt-[var(--spacing-md)] border-t border-[var(--color-neutral-200)]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Créer le lot
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}

