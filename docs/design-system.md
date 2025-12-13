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

---

## 2. Typographie

### Police globale
```
font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
```

### Hiérarchie
| Élément | Taille | Poids |
|---------|--------|--------|
| H1 | 32–40px | 700 |
| H2 | 24–28px | 600 |
| H3 | 20–22px | 600 |
| Body | 16px | 400 |
| Labels | 14px | 500 |

---

## 3. Grille & espacements

### Espacements
- `8px` → petits espacements
- `16px` → espacements standards
- `24px` → sections internes
- `40px` → section principale

### Rayons
```
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
```

### Ombres
```
--shadow-card: 0 2px 6px rgba(0,0,0,0.06);
--shadow-hover: 0 4px 16px rgba(0,0,0,0.12);
```

---

## 4. Composants UI — Règles

### Boutons
- arrondis : `var(--radius-md)`
- padding horizontal généreux
- hover = légère montée + ombre renforcée

### Cards
- fond blanc
- bordure légère #e5e7eb
- padding 20px
- ombre faible

### Inputs
- bordure #d1d5db
- arrondi medium
- focus ring bleu `#2563EB`

### Badges
- couleurs cohérentes avec les statuts
- taille compacte

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

- Button
- Input
- Label
- Card
- Badge
- SectionTitle
- ToastProvider
- ConfirmModal

---

## 8. Interdictions

- Pas de CSS inline hors cas extrême.
- Pas de couleurs codées en dur dans les composants.
- Pas de duplication de composants.
- Pas de logique métier dans les composants UI.
- Pas de JSX complexe dans les pages : externaliser dans components/.

---

**FIN DU DESIGN SYSTEM**
