/**
 * Capitalise intelligemment une adresse avec gestion des mots composés
 * Exemples :
 * - "rue de la paix" → "Rue de la Paix"
 * - "saint-michel" → "Saint-Michel"
 * - "le havre" → "Le Havre"
 */
export function capitalizeAddress(text: string): string {
  if (!text) return text;

  // Mots à ne pas capitaliser (articles et prépositions)
  const lowercaseWords = [
    "de", "du", "des", "le", "la", "les", "et", "ou", "à", "au", "aux", "en", "sur", "sous", "dans", "par", "pour", "avec", "sans"
  ];

  // Mots composés courants (à garder avec tiret)
  const compoundWords = [
    "saint", "sainte", "saintes", "saints",
    "mont", "monts", "monts",
    "pont", "ponts",
    "val", "vals",
    "plage", "plages",
    "port", "ports",
    "ville", "villes"
  ];

  return text
    .split(/\s+/)
    .map((word, index) => {
      // Ignorer les mots vides
      if (!word) return word;

      const lowerWord = word.toLowerCase();
      const hasHyphen = word.includes("-");

      // Si c'est un mot composé avec tiret
      if (hasHyphen) {
        return word
          .split("-")
          .map((part) => {
            const lowerPart = part.toLowerCase();
            // Si c'est un article/préposition, le laisser en minuscule
            if (lowercaseWords.includes(lowerPart)) {
              return lowerPart;
            }
            // Sinon, capitaliser la première lettre
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          })
          .join("-");
      }

      // Si c'est le premier mot, toujours capitaliser
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      // Si c'est un article/préposition, le laisser en minuscule
      if (lowercaseWords.includes(lowerWord)) {
        return lowerWord;
      }

      // Sinon, capitaliser la première lettre
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Capitalise intelligemment un nom de personne
 * Exemples :
 * - "jean dupont" → "Jean Dupont"
 * - "marie-claire martin" → "Marie-Claire Martin"
 * - "jean-pierre de la fontaine" → "Jean-Pierre de la Fontaine"
 */
export function capitalizeName(text: string): string {
  if (!text) return text;

  // Mots à ne pas capitaliser (articles et prépositions)
  const lowercaseWords = [
    "de", "du", "des", "le", "la", "les", "et", "ou", "à", "au", "aux", "en", "sur", "sous", "dans", "par", "pour", "avec", "sans"
  ];

  return text
    .split(/\s+/)
    .map((word, index) => {
      // Ignorer les mots vides
      if (!word) return word;

      const lowerWord = word.toLowerCase();
      const hasHyphen = word.includes("-");

      // Si c'est un mot composé avec tiret (ex: Marie-Claire, Jean-Pierre)
      if (hasHyphen) {
        return word
          .split("-")
          .map((part) => {
            const lowerPart = part.toLowerCase();
            // Capitaliser chaque partie du mot composé
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          })
          .join("-");
      }

      // Si c'est le premier mot, toujours capitaliser
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      // Si c'est un article/préposition, le laisser en minuscule
      if (lowercaseWords.includes(lowerWord)) {
        return lowerWord;
      }

      // Sinon, capitaliser la première lettre
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

