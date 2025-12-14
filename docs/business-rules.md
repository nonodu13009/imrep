# 📘 **RÈGLES MÉTIER — SaaS IMREP ↔ Allianz (Gestion PNO)**

## 🎯 **Objectif du SaaS**

Le SaaS permet à une agence immobilière (IMREP) de déclarer et gérer les logements PNO (Propriétaires Non Occupants) qu'elle administre, et permet à Allianz de valider ou refuser ces demandes.
Le système garantit un suivi fiable, traçable, sécurisé, avec rôles distincts.

---

# 1. **Rôles utilisateurs**

## 🔹 **Rôle IMREP**

Peut :

* créer un lot (demande d'entrée)
* modifier un lot **tant que le statut = "en_attente"** (tous les utilisateurs IMREP peuvent modifier tous les lots en attente)
* demander la sortie d'un lot **si statut = "valide"** (tous les utilisateurs IMREP peuvent demander la sortie de tous les lots validés)
* consulter **tous les lots** (lots de tous les IMREP)
* consulter l'historique d'un lot
* modifier ou supprimer une demande **tant qu'elle n'est pas validée par Allianz** (tous les utilisateurs IMREP peuvent modifier/supprimer toutes les demandes en attente)
* authentification via email + password

Ne peut pas :

* valider ou refuser des demandes
* modifier un lot validé
* modifier une sortie validée

## 🔹 **Rôle Allianz** (ADMIN)

Peut :

* valider/refuser les demandes d'entrée
* valider/refuser les demandes de sortie
* voir **tous les lots**
* créer des utilisateurs (IMREP ou Allianz)
* désactiver, réactiver ou supprimer des utilisateurs
* modifier le rôle d'un utilisateur (sauf du root admin)
* accéder aux dashboards globaux

Ne peut pas :

* modifier createdBy d'un lot
* utiliser le système comme IMREP (création lots interdites)

## 🔹 **Root Admin Allianz (non modifiable)**

* email protégé : **[jeanmichel@allianz-nogaro.fr](mailto:jeanmichel@allianz-nogaro.fr)**
* ne peut pas être supprimé
* ne peut pas être désactivé
* ne peut pas voir son rôle modifié

---

# 2. **Structure d'un lot (logement PNO)**

## 🏠 Champs obligatoires pour la création d'un lot

* `codeProprietaire`
* `codeLot`
* `adresse`
* `etage` (rez-de-chaussée / intermédiaire / dernier étage)
* `typeLogement` (1,2,3,4,5)
* `garageADiffAdresse` (bool)
* `dateDebutGestion`
* `dateEffetDemandee`
* `createdBy` (UID IMREP)
* `statut = "en_attente"`

## 📝 Champs optionnels

* `complementAdresse`
* `adresseGarage`
* `note`

---

# 3. **Règles métier des dates**

### ✔ `dateEffetDemandee`

* par défaut : **J+1**
* minimum possible : **aujourd'hui**
* une date passée est **strictement interdite**

### ✔ `dateSortieDemandee`

* minimum possible : **aujourd'hui**
* aucune sortie ne peut être demandée si :

  * le lot n'est pas validé
  * une sortie est déjà en attente ou validée

---

# 4. **Cycle de vie d'un lot**

Un lot évolue selon ces états :

### 🔵 **1. en_attente**

Création par IMREP.
Allianz doit valider ou refuser.

### 🟢 **2. valide**

Allianz valide la demande d'entrée.
Ajout obligatoire :

* `numeroContrat`
* `validatedBy`
* `updatedAt`

### 🔴 **3. refuse**

Allianz refuse la demande.
Ajout obligatoire :

* `motifRefus`
* `validatedBy`

### 🟡 **4. sortie (sous-structure)**

Champ `sortie` contient :

* `motif`
* `dateSortieDemandee`
* `dateSortieDeclaration`
* `noteSortie`
* `statutSortie` :

  * `en_attente_allianz`
  * `sortie_validee`
  * `refusee`
* `validatedBy`

---

# 5. **Règles métier IMREP**

### ✔ **IMREP peut créer un lot si :**

* l'utilisateur est authentifié
* le rôle = IMREP
* le lot respecte toutes les validations
* statut forcé = "en_attente"

### ✔ **IMREP peut modifier un lot si :**

* statut = "en_attente"
* **Tous les utilisateurs IMREP peuvent modifier tous les lots en attente** (l'action est tracée dans l'historique avec le userId)
* il ne modifie PAS :

  * numeroContrat
  * validatedBy
  * statut
  * sortie
  * history

### ✔ **IMREP peut demander une sortie si :**

* statut = "valide"
* aucune sortie existante ou en cours
* dateSortieDemandee >= aujourd'hui

### ❌ IMREP NE PEUT JAMAIS :

* valider/refuser une demande
* modifier un lot validé
* modifier une sortie validée

---

# 6. **Règles métier Allianz (ADMIN)**

### ✔ **Allianz peut valider une entrée si :**

* statut = "en_attente"
* numeroContrat est fourni
* le champ statut devient "valide"

### ✔ **Allianz peut refuser une entrée si :**

* statut = "en_attente"
* motifRefus renseigné

### ✔ **Allianz peut valider une sortie si :**

* sortie.statutSortie = "en_attente_allianz"
* changement → "sortie_validee"

### ✔ **Allianz peut refuser une sortie si :**

* sortie.statutSortie = "en_attente_allianz"
* justification obligatoire

### ✔ Allianz peut gérer les utilisateurs :

* création
* modification du rôle
* désactivation / réactivation
* suppression
  Sauf pour le root admin.

---

# 7. **Historique des actions**

Chaque action importante ajoute une entrée dans `history` :

| Type                | Déclencheur | Données stockées            |
| ------------------- | ----------- | --------------------------- |
| `creation`          | IMREP       | lot complet                 |
| `modification`      | IMREP       | champs modifiés             |
| `demande_sortie`    | IMREP       | motif + date                |
| `validation_entree` | Allianz     | numeroContrat + commentaire |
| `refus_entree`      | Allianz     | motifRefus                  |
| `validation_sortie` | Allianz     | commentaire                 |
| `refus_sortie`      | Allianz     | motifRefus                  |

Contraintes :

* pas de modification possible d'une entrée existante
* seulement ajout via `arrayUnion`

---

# 8. **Règles de sécurité**

* **Tous les utilisateurs (IMREP et Allianz) peuvent voir TOUS les lots**
* **Tous les utilisateurs IMREP peuvent modifier/supprimer TOUS les lots en attente** (l'action est tracée dans l'historique avec le userId)
* un Allianz peut voir TOUS les lots
* un utilisateur ne peut pas modifier son propre rôle
* root admin immunisé contre modifications et suppressions
* aucune suppression de lot autorisée (seulement demande de suppression)
* toutes les actions sensibles exigent :

  * vérification du rôle
  * vérification du créateur (IMREP) pour les actions de modification/suppression
  * respect du statut

---

# 9. **Résumé par scénarios**

### ✔ Création lot → IMREP

→ statut = en_attente
→ Allianz doit valider ou refuser

### ✔ Validation entrée → Allianz

→ statut = valide
→ numéroContrat obligatoire

### ✔ Modification lot → IMREP

Uniquement si en_attente.

### ✔ Demande sortie → IMREP

Uniquement si valide.

### ✔ Validation sortie → Allianz

→ statutSortie = sortie_validee

---

# 📌 FIN DU DOCUMENT

Ce fichier représente **toutes les règles métier officielles** du système.
Il peut être donné à Cursor ou utilisé comme référence dans le code, les Firestore rules, et les tests.

---

Si tu veux, je peux aussi :

✅ te générer une **modélisation UML**
✅ une **carte mentale métier**
✅ un **diagramme d'état complet** du lot
✅ un **document d'API interne** pour harmoniser toutes les actions

Souhaites-tu l'un de ces éléments ?

