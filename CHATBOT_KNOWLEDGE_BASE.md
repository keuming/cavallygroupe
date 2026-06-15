# Base de Connaissances du Chatbot Cavally Livres

## Parcours de Commande Rapide de Manuels

### Vue d'ensemble
Le parcours de commande rapide permet aux clients de commander des manuels scolaires de deux manières :
1. **Mode 1** : Télécharger une liste de fournitures (fichier PDF/Excel)
2. **Mode 2** : Remplir manuellement la liste de fournitures

### Étapes du Parcours de Commande

#### Étape 1 : Accéder à la Commande Rapide
- Cliquer sur le bouton **"COMMANDE RAPIDE"** dans la navbar (bouton vert avec icône panier)
- Le bouton est toujours visible et accessible depuis n'importe quelle page
- Alternative : Utiliser le QR code brandé aux couleurs de Cavally Groupe

#### Étape 2 : Renseigner le Titre de la Commande
- Entrer le titre/nom de la commande (ex: "Fournitures 6ème A", "Manuels Lycée 2026")
- Ce titre servira à identifier la commande dans le dashboard

#### Étape 3 : Choisir le Mode de Commande

**Mode 1 - Télécharger une Liste de Fournitures**
1. Cliquer sur "Télécharger une liste"
2. Sélectionner le fichier PDF ou Excel contenant la liste de fournitures
3. Le système valide automatiquement les produits
4. Les articles reconnus s'ajoutent au panier
5. Continuer vers le checkout

**Mode 2 - Remplir Manuellement**
1. Cliquer sur "Remplir manuellement"
2. Rechercher les manuels par :
   - Titre du manuel
   - Auteur
   - Niveau d'étude
   - Catégorie (Manuels Scolaires, Universitaires, Oeuvres Littéraires)
3. Ajouter les articles au panier avec les quantités
4. Continuer vers le checkout

#### Étape 4 : Validation Automatique des Produits
- Le système valide automatiquement les produits disponibles
- Estimation du prix total en temps réel
- Les articles indisponibles sont signalés

#### Étape 5 : Sauvegarde de la Liste
- La liste est automatiquement sauvegardée pour utilisation future
- Possibilité de télécharger la liste complète
- Possibilité de partager la liste avec d'autres utilisateurs

#### Étape 6 : Checkout et Confirmation
- Procéder au paiement sécurisé
- Confirmation automatique de la commande
- Reçu envoyé par email

---

## Fonctionnalités de la Commande Rapide

### Caractéristiques Principales
- **Interface intuitive et mobile-first** : Fonctionne parfaitement sur tous les appareils
- **Bouton d'accès prominent** : Visible et accessible depuis la navbar
- **Validation automatique** : Les produits sont validés automatiquement
- **Estimation du prix en temps réel** : Affichage du total instantané
- **Sauvegarde des listes** : Utilisation future facilitée

### Modes de Commande
1. **Téléchargement de liste** (fichier PDF/Excel)
2. **Saisie manuelle** de la liste de fournitures

### Avantages
- Commande rapide et efficace
- Réduction du temps de saisie
- Moins d'erreurs de saisie
- Meilleure expérience utilisateur

---

## Parcours par Niveau d'Étude

### Maternelle
- Petite Section
- Moyenne Section
- Grande Section

### Primaire
- CP, CE1, CE2, CM1, CM2

### Premier Cycle (Collège)
- 6ème, 5ème, 4ème, 3ème

### Secondaire (Lycée)
- 2nde, 1ère, Terminale

### Autres Niveaux
- Université
- Formation Professionnelle

---

## Dashboard de Gestion des Commandes

### Accès
- Réservé à l'équipe opérationnelle
- URL : `/admin/orders-management`

### Fonctionnalités
- **Recherche et filtrage** : Par numéro de commande, client, statut
- **Tableau des commandes** : Vue d'ensemble de toutes les commandes
- **Modal de détails** : Affichage complet des informations de commande
- **Impression de bons** : Génération de bons de commande
- **Téléchargement CSV** : Export des listes de commandes

### Statuts de Commande
- **Pending** : En attente de confirmation
- **Confirmed** : Confirmée
- **In Transit** : En cours de livraison
- **Delivered** : Livrée
- **Cancelled** : Annulée

---

## Système Avancé de Gestion des Listes

### Accès
- URL : `/supply-list-management`

### Fonctionnalités
- **Création de listes** : Par niveau d'étude
- **Partage avec codes d'accès** : Codes uniques pour chaque partage
- **Téléchargement CSV** : Export des listes
- **Suivi des commandes** : Suivi des commandes des parents d'élèves
- **Statistiques** : Analytics de consultation des listes

---

## Questions Fréquentes du Chatbot

### Q1 : Comment commander rapidement ?
**Réponse :** Cliquez sur le bouton "COMMANDE RAPIDE" dans la navbar, renseignez le titre de votre commande, puis choisissez entre télécharger une liste de fournitures ou remplir manuellement. Le système validera automatiquement les produits.

### Q2 : Puis-je télécharger une liste de fournitures ?
**Réponse :** Oui ! Vous pouvez télécharger un fichier PDF ou Excel contenant votre liste de fournitures. Le système reconnaîtra automatiquement les produits disponibles.

### Q3 : Comment partager une liste avec d'autres parents ?
**Réponse :** Allez dans "Gestion des Listes" (lien dans le menu "Manuels Scolaires"), créez votre liste, puis cliquez sur "Partager". Un code d'accès unique sera généré que vous pourrez partager.

### Q4 : Quels sont les statuts de commande ?
**Réponse :** Les commandes passent par ces statuts : En attente → Confirmée → En cours de livraison → Livrée. Vous recevrez des notifications à chaque changement.

### Q5 : Où trouver mes commandes précédentes ?
**Réponse :** Connectez-vous à votre compte, allez dans "Mes Commandes" pour voir l'historique complet de vos commandes.

### Q6 : Comment télécharger une liste complète ?
**Réponse :** Dans le dashboard de gestion des listes, cliquez sur "Télécharger" pour exporter la liste en format CSV.

### Q7 : Puis-je modifier une commande après l'avoir passée ?
**Réponse :** Oui, vous pouvez modifier une commande tant qu'elle n'est pas confirmée. Contactez le support pour les modifications après confirmation.

### Q8 : Quel est le délai de livraison ?
**Réponse :** Les commandes sont généralement livrées sous 2-3 jours ouvrables. Vous recevrez un numéro de suivi par email.

---

## Prompts Suggérés pour le Chatbot

1. "Comment passer une commande rapide ?"
2. "Je veux télécharger ma liste de fournitures"
3. "Comment partager une liste avec d'autres parents ?"
4. "Où trouver mes commandes ?"
5. "Quels sont les statuts de commande ?"
6. "Comment télécharger une liste complète ?"
7. "Puis-je modifier ma commande ?"
8. "Quel est le délai de livraison ?"

---

## Informations de Contact

- **Email** : contact@cavallygroupe.com
- **Support** : support@cavallygroupe.com
- **Commandes** : commandes@cavallygroupe.com
- **Téléphone** : À définir

---

## Liens Utiles

- **Accueil** : https://www.cavallygroupe.com
- **Commande Rapide** : https://www.cavallygroupe.com/quick-order
- **Gestion des Listes** : https://www.cavallygroupe.com/supply-list-management
- **Dashboard Admin** : https://www.cavallygroupe.com/admin/orders-management
- **Dashboard Établissements** : https://www.cavallygroupe.com/school-dashboard
