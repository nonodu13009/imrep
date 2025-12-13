# 🧭 DESIGN SYSTEM — Référence Projet (SaaS Premium) — Version Checklist

_À appliquer à tout développement frontend du projet. Toujours demander à Cursor :
« Respecte le design décrit dans `docs/design-system.md` ». _

---

## 🎨 1. Principes Généraux

- [ ] Interface **SaaS premium**, moderne, épurée.
- [ ] **Respiration visuelle** (espacement généreux).
- [ ] Design **cohérent**, minimaliste, typographie claire.
- [ ] Interactions **douces**, transitions légères.
- [ ] Layout larges, centrés, lisibles.

---

## 📐 2. Layout

**Container global**

- [ ] `max-w-screen-xl`
- [ ] `mx-auto px-6`
- [ ] Sections : `py-12` à `py-20`

**Grilles**

- [ ] `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

---

## 🔤 3. Typographie

- [ ] **H1** : `text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]`
- [ ] **Section Title** : `text-2xl md:text-3xl font-semibold tracking-tight`
- [ ] **Sous-titre** : `text-lg md:text-xl text-neutral-600`
- [ ] **Texte** : `text-base text-neutral-700`

Règles :

- [ ] Toujours une hiérarchie visuelle nette.
- [ ] Textes respirants (marge inférieure systématique).

---

## 🎨 4. Palette Couleurs

**Fond**

- [ ] `#ffffff`
- [ ] `#f8fafc`

**Primaire (bleu IMREP / Allianz)**

- [ ] `#2563eb` (hover : `#1d4ed8`)

**Neutres**

- [ ] `#e2e8f0`, `#475569`, `#64748b`

**Dégradés autorisés**

- [ ] `bg-gradient-to-r from-blue-600 to-blue-500`

---

## 🧱 5. Cards

Toujours :

- [ ] `bg-white rounded-2xl p-6 shadow-sm border border-neutral-200`
- [ ] `hover:shadow-md hover:border-neutral-300 transition-all duration-200`

---

## 🔘 6. Boutons

**Primary**

- [ ] `px-6 py-3 rounded-xl font-semibold text-white`
- [ ] `bg-gradient-to-r from-blue-600 to-blue-500 shadow-md`
- [ ] `hover:scale-[1.02] transition-all duration-200`

**Secondary**

- [ ] `px-6 py-3 rounded-xl font-semibold`
- [ ] `border-2 border-neutral-300 bg-white text-neutral-700`
- [ ] `hover:border-blue-600 hover:text-blue-600`

---

## 📝 7. Inputs

- [ ] `w-full px-4 py-3 rounded-xl border-2 border-neutral-300`
- [ ] `focus:border-blue-600 focus:ring-4 focus:ring-blue-100`
- [ ] `transition-all duration-200`
- [ ] Pas d'angles carrés, pas de bordure fine.

---

## 📊 8. Tables

- [ ] Card wrapper obligatoire
- [ ] Header : `bg-neutral-50 uppercase text-xs tracking-wide text-neutral-500`
- [ ] Rows : `hover:bg-neutral-50`
- [ ] Cellules : `px-6 py-4`

---

## ✨ 9. Animations

- [ ] `transition-all duration-200`
- [ ] `hover:scale-[1.02]`
- [ ] `animate-fade-in` ou fadeIn CSS
- [ ] Pas d'animations lourdes ou distrayantes.

---

## 🦸 10. Hero Sections

- [ ] `py-20 md:py-28 text-center max-w-3xl mx-auto`
- [ ] Contient toujours :
  - [ ] H1 large
  - [ ] Sous-titre
  - [ ] Un ou deux boutons
  - [ ] Gradient léger ou image floutée

---

## ♻️ 11. Composants

Tous les composants doivent être :

- [ ] cohérents avec ce design-system
- [ ] réutilisables
- [ ] sans styles inline
- [ ] sans duplication de logique visuelle

---

## 🏆 12. Priorité de Design

1. [ ] Lisibilité
2. [ ] Espacement
3. [ ] Simplicité
4. [ ] Cohérence
5. [ ] Élégance SaaS premium

---

# ✔️ Utilisation (important)

Dans n'importe quel fichier, tu peux dire à Cursor :

**"Applique le design défini dans `docs/design-system.md`."**

Cela suffit à forcer Cursor à respecter ce document **sans modifier les rules globales de ton IDE**.

