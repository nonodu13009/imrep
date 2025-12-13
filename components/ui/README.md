# 🎨 Kit de Composants UI — Design System

Ce dossier contient les composants UI réutilisables qui respectent automatiquement le design system défini dans `docs/design-system.md`.

## 📦 Composants Disponibles

### Button
Bouton avec variantes primary et secondary.

```tsx
import { Button } from "@/components/ui";

<Button variant="primary">Cliquer</Button>
<Button variant="secondary">Annuler</Button>
```

### Card
Carte avec effet hover et ombre.

```tsx
import { Card } from "@/components/ui";

<Card>
  <h2>Titre</h2>
  <p>Contenu de la carte</p>
</Card>
```

### Input
Champ de saisie avec label et gestion d'erreur.

```tsx
import { Input } from "@/components/ui";

<Input 
  label="Email" 
  type="email" 
  placeholder="votre@email.com"
  error="Email invalide"
/>
```

### Table
Tableau avec wrapper Card automatique.

```tsx
import { Table, TableRow, TableCell } from "@/components/ui";

<Table headers={["Nom", "Email", "Actions"]}>
  <TableRow>
    <TableCell>Jean Dupont</TableCell>
    <TableCell>jean@example.com</TableCell>
    <TableCell>...</TableCell>
  </TableRow>
</Table>
```

### Hero
Section hero avec titre, sous-titre et actions.

```tsx
import { Hero } from "@/components/ui";

<Hero
  title="Bienvenue"
  subtitle="Description de la page"
  primaryAction={{ label: "Commencer", onClick: () => {} }}
  secondaryAction={{ label: "En savoir plus", href: "/about" }}
/>
```

### Container
Container global avec max-width et padding.

```tsx
import { Container } from "@/components/ui";

<Container>
  <h1>Contenu centré</h1>
</Container>
```

## 🚀 Utilisation

Tous les composants sont exportés depuis `@/components/ui` :

```tsx
import { Button, Card, Input, Table, Hero, Container } from "@/components/ui";
```

Les composants respectent automatiquement :
- ✅ Les couleurs du design system
- ✅ Les espacements définis
- ✅ Les animations et transitions
- ✅ La typographie
- ✅ Les styles hover et focus

## 📝 Notes

- Tous les composants acceptent les props HTML standard
- Les classes personnalisées peuvent être ajoutées via la prop `className`
- Les composants sont entièrement typés avec TypeScript

