# 🎨 Design System — Allianz Marseille / IMREP

## 1. Identité visuelle

### Palette principale
| Nom | Couleur | Usage |
|-----|---------|--------|
| Primary | #2563EB | Actions, boutons principaux, accents |
| Secondary | #0F172A | Header Allianz, zones sérieuses |
| Success | #22C55E | Statuts validés |
| Warning | #FACC15 | Avertissements |
| Danger | #EF4444 | Erreurs, refus |
| Light | #F1F5F9 | Fonds neutres |
| Dark | #1E293B | Titres, textes importants |

### Dégradé principal (header / hero)
```
linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
```

### Couleurs IMREP
- Imrep Primary : **#2563EB**
- Imrep Secondary : **#E0ECFF**

### Couleurs Allianz
- Allianz Blue : **#0F172A**
- Allianz Light Blue : **#4B8BFF**

### Couleurs neutres étendues
- Neutral 50-900 : Palette complète pour les fonds et textes
- Text Primary : **#1E293B**
- Text Secondary : **#64748B**
- Text Tertiary : **#94A3B8**
- BG Primary : **#FFFFFF**
- BG Secondary : **#F8FAFC**
- BG Tertiary : **#F1F5F9**

### Couleurs sémantiques
- Info : **#3B82F6**
- Success : **#22C55E**
- Warning : **#FACC15**
- Danger : **#EF4444**

---

## 2. Typographie

### Police globale
```
font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
```

### Hiérarchie
| Élément | Taille | Poids | Line-height |
|---------|--------|--------|-------------|
| H1 | 32–40px | 700 | 1.2 |
| H2 | 24–28px | 600 | 1.3 |
| H3 | 20–22px | 600 | 1.4 |
| Body | 16px | 400 | 1.6 |
| Labels | 14px | 500 | 1.5 |

### Classes utilitaires typographie
- `.text-xs` à `.text-4xl` : Tailles de texte
- `.font-light`, `.font-normal`, `.font-medium`, `.font-semibold`, `.font-bold` : Poids de police

---

## 3. Grille & espacements

### Espacements
- `8px` (--spacing-xs) → petits espacements
- `16px` (--spacing-sm) → espacements standards
- `24px` (--spacing-md) → sections internes
- `48px` (--spacing-lg) → section principale
- `64px` (--spacing-xl) → grandes sections

### Rayons
```
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 18px;
```

### Ombres et élévations
```
--shadow-card: 0 2px 6px rgba(0,0,0,0.06);
--shadow-hover: 0 4px 16px rgba(0,0,0,0.12);
--elevation-1: 0 1px 3px rgba(0,0,0,0.08);
--elevation-2: 0 2px 8px rgba(0,0,0,0.1);
--elevation-3: 0 4px 16px rgba(0,0,0,0.12);
--elevation-4: 0 8px 24px rgba(0,0,0,0.14);
```

### Transitions
```
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
--transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 4. Composants UI — Règles

### Boutons
- Variants : `primary`, `secondary`, `danger`, `ghost`
- Ripple effect au clic
- Transitions avec `transform` et `box-shadow`
- État `loading` avec spinner animé
- Hover = légère montée + ombre renforcée
- Focus ring pour accessibilité

### Cards
- Variants : `default`, `elevated`, `outlined`, `interactive`
- Fond blanc
- Bordure légère #e5e7eb
- Padding 20px
- Ombres selon l'élévation
- Hover states pour variant `interactive`

### Inputs
- Labels flottants optionnels
- États visuels : `error`, `success`
- Support pour icônes (prefix/suffix)
- Messages d'aide contextuels
- Focus ring bleu `#2563EB`
- Transitions smooth

### Badges
- Variants : `light`, `solid`, `outlined`
- Types : `info`, `success`, `warning`, `danger`
- Animations subtiles au hover
- Support pour icônes

### Animations
- `.animate-fade-in` : Fade in avec translation
- `.animate-slide-in` : Slide depuis la gauche
- `.animate-scale-in` : Scale in
- `.animate-fade-in-up` : Fade in depuis le bas
- `.animate-spin` : Rotation continue
- `.animate-pulse` : Pulsation

---

## 5. Règles UX globales

- Toujours utiliser le design system pour les nouveaux composants.
- Pas de couleur custom au hasard : toujours dans la palette ci-dessus.
- Pas d'ombrages lourds.
- Ne jamais mélanger des tailles non définies dans ce document.
- Chaque page doit avoir un **SectionTitle**.
- Les actions sensibles doivent être confirmées via **ConfirmModal**.
- Les feedbacks doivent passer par **ToastProvider**.

---

## 6. Responsive

- Mobile-first.
- Grilles en 1 colonne sur mobile, 3 sur desktop.
- Menus repliables si nécessaires.

---

## 7. Composants obligatoires à utiliser

- Button (variants: primary, secondary, danger, ghost)
- Input (labels flottants, états error/success)
- Label
- Card (variants: default, elevated, outlined, interactive)
- Badge (variants: light, solid, outlined)
- SectionTitle
- Breadcrumb (navigation hiérarchique)
- ToastProvider
- ConfirmModal
- PieChart (avec tooltips au survol)

---

## 8. Interdictions

- Pas de CSS inline hors cas extrême.
- Pas de couleurs codées en dur dans les composants.
- Pas de duplication de composants.
- Pas de logique métier dans les composants UI.
- Pas de JSX complexe dans les pages : externaliser dans components/.

---

## 9. Accessibilité

### Focus states
- Tous les éléments interactifs doivent avoir un focus ring visible
- Utiliser `:focus-visible` pour les focus clavier uniquement
- Outline de 2px avec offset de 2px

### Navigation clavier
- Support complet de la navigation au clavier
- Skip to content link disponible
- Indicateurs visuels clairs pour les états actifs

### Animations
- Respecter `prefers-reduced-motion` (à implémenter)
- Animations subtiles et non distrayantes
- Durées raisonnables (150-300ms)

---

## 10. Micro-interactions

### Principes
- Feedback visuel immédiat sur toutes les interactions
- Transitions smooth avec `cubic-bezier(0.4, 0, 0.2, 1)`
- Animations d'entrée pour les contenus dynamiques
- Hover states cohérents sur tous les éléments interactifs

### Exemples
- Boutons : Ripple effect + élévation au hover
- Cards : Élévation et bordure colorée au hover
- Table rows : Background change + shadow au hover
- Navigation : Scale + background change au hover

---

**FIN DU DESIGN SYSTEM**
