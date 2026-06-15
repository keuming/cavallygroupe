/**
 * Base de connaissances enrichie pour le chatbot Cavaly Livres
 * Contient toutes les informations sur l'entreprise, les produits, les services et les FAQs
 */

export const chatbotKnowledgeBase = {
  // Informations sur l'entreprise
  company: {
    name: "Cavaly Livres",
    tagline: "Votre plateforme de manuels et oeuvres littéraires en Côte d'Ivoire",
    description: "Cavaly Livres est une plateforme e-commerce spécialisée dans la vente de manuels scolaires, universitaires et oeuvres littéraires en Côte d'Ivoire.",
    location: "Côte d'Ivoire",
    website: "https://www.cavallygroupe.com",
    supportEmail: "support@cavallygroupe.com",
    phone: "+225 XX XX XX XX",
    founded: "2024",
    mission: "Faciliter l'accès aux manuels et oeuvres littéraires pour les étudiants et professionnels en Côte d'Ivoire",
  },

  // Catégories de produits
  categories: [
    {
      id: 1,
      name: "Manuels Scolaires",
      description: "Manuels pour l'enseignement primaire et secondaire",
      levels: ["Primaire", "Collège", "Lycée"],
      subjects: ["Français", "Mathématiques", "Sciences", "Histoire-Géographie", "Anglais", "Philosophie"],
    },
    {
      id: 2,
      name: "Manuels Universitaires",
      description: "Manuels et livres pour l'enseignement supérieur",
      levels: ["Licence", "Master", "Doctorat"],
      subjects: ["Informatique", "Gestion", "Droit", "Économie", "Ingénierie", "Médecine"],
    },
    {
      id: 3,
      name: "Oeuvres Littéraires",
      description: "Romans, poésie, théâtre et essais",
      genres: ["Roman", "Poésie", "Théâtre", "Essai", "Biographie", "Jeunesse"],
    },
    {
      id: 4,
      name: "Fournitures Scolaires",
      description: "Cahiers, stylos, crayons et autres fournitures",
      items: ["Cahiers", "Stylos", "Crayons", "Gommes", "Règles", "Compas", "Calculatrices"],
    },
  ],

  // Services principaux
  services: [
    {
      name: "Téléchargement de Listes Scolaires",
      description: "Téléchargez votre liste de fournitures (manuscrite ou numérique) et nous la traiterons automatiquement",
      features: [
        "Support des fichiers PDF, images et documents",
        "Analyse IA automatique des articles",
        "Génération de facture",
        "Ajout automatique au panier",
      ],
      url: "/school-lists/upload",
    },
    {
      name: "Panier d'Achat",
      description: "Gérez vos articles avec notre panier coulissant intuitif",
      features: [
        "Ajout/suppression facile d'articles",
        "Modification des quantités",
        "Calcul automatique du total",
        "Sauvegarde du panier",
      ],
      url: "/cart",
    },
    {
      name: "Paiement Sécurisé",
      description: "Paiements en ligne sécurisés avec Stripe",
      features: [
        "Cartes bancaires",
        "Portefeuille numérique",
        "Paiement à la livraison",
        "Facture automatique",
      ],
      url: "/checkout",
    },
    {
      name: "Suivi de Commande",
      description: "Suivez votre commande en temps réel",
      features: [
        "Statut de commande",
        "Numéro de suivi",
        "Notifications SMS",
        "Historique des commandes",
      ],
      url: "/orders",
    },
    {
      name: "Gestion des Profils",
      description: "Gérez votre profil selon votre rôle",
      roles: ["Client", "Fournisseur", "Livreur"],
      features: [
        "Profil client : commandes, adresses, préférences",
        "Profil fournisseur : gestion des produits, ventes",
        "Profil livreur : gestion des livraisons",
      ],
    },
  ],

  // FAQs
  faqs: [
    {
      question: "Comment puis-je créer un compte ?",
      answer: "Cliquez sur le bouton 'ACCÈS MEMBRE' en haut à droite, puis sélectionnez votre profil (Client, Fournisseur ou Livreur). Remplissez le formulaire d'inscription avec vos informations.",
      category: "Compte",
    },
    {
      question: "Quels sont les modes de paiement acceptés ?",
      answer: "Nous acceptons les cartes bancaires, les portefeuilles numériques et le paiement à la livraison. Tous les paiements sont sécurisés via Stripe.",
      category: "Paiement",
    },
    {
      question: "Combien de temps prend la livraison ?",
      answer: "La livraison prend généralement 2-5 jours ouvrables selon votre localisation. Vous recevrez un numéro de suivi par SMS.",
      category: "Livraison",
    },
    {
      question: "Puis-je retourner un article ?",
      answer: "Oui, vous avez 14 jours pour retourner un article dans son état d'origine. Contactez notre support pour initier le retour.",
      category: "Retours",
    },
    {
      question: "Comment télécharger ma liste de fournitures ?",
      answer: "Allez à 'ACCÈS MEMBRE' > 'Télécharger ma liste'. Vous pouvez télécharger une liste manuscrite ou numérique. Notre IA analysera automatiquement les articles.",
      category: "Listes Scolaires",
    },
    {
      question: "Quel est le délai de traitement d'une liste scolaire ?",
      answer: "Les listes sont traitées automatiquement en quelques minutes. Vous recevrez une facture et les articles seront ajoutés à votre panier.",
      category: "Listes Scolaires",
    },
    {
      question: "Puis-je modifier ma commande après l'avoir passée ?",
      answer: "Vous pouvez modifier votre commande dans les 2 heures suivant sa création. Après ce délai, contactez notre support.",
      category: "Commandes",
    },
    {
      question: "Comment puis-je devenir fournisseur ?",
      answer: "Cliquez sur 'ACCÈS MEMBRE' et sélectionnez 'Fournisseur'. Remplissez le formulaire avec vos informations commerciales. Nous vérifierons votre demande.",
      category: "Fournisseurs",
    },
    {
      question: "Comment puis-je devenir livreur ?",
      answer: "Cliquez sur 'ACCÈS MEMBRE' et sélectionnez 'Livreur'. Vous devez avoir un véhicule et un permis de conduire valide.",
      category: "Livreurs",
    },
    {
      question: "Y a-t-il des frais de livraison ?",
      answer: "Les frais de livraison dépendent de votre localisation. Ils sont calculés automatiquement lors du checkout.",
      category: "Livraison",
    },
  ],

  // Informations de contact et support
  support: {
    email: "support@cavallygroupe.com",
    phone: "+225 XX XX XX XX",
    whatsapp: "https://wa.me/225XXXXXXXXX",
    hours: "Lundi-Vendredi: 9h-18h, Samedi: 10h-14h",
    responseTime: "Nous répondons généralement dans les 2 heures",
  },

  // Politiques
  policies: {
    privacy: "Nous respectons votre vie privée. Vos données ne sont jamais partagées avec des tiers.",
    security: "Tous les paiements sont sécurisés avec le chiffrement SSL et Stripe.",
    returns: "Retours gratuits dans les 14 jours pour les articles non endommagés.",
    warranty: "Tous les produits sont garantis conformes à la description.",
  },

  // Avantages de Cavaly Livres
  advantages: [
    "Large sélection de manuels et oeuvres littéraires",
    "Livraison rapide en Côte d'Ivoire",
    "Paiements sécurisés",
    "Service client réactif",
    "Analyse IA des listes scolaires",
    "Gestion facile du panier",
    "Suivi de commande en temps réel",
    "Factures automatiques",
  ],

  // Termes courants et définitions
  glossary: {
    "Accès Membre": "Portail de connexion pour les clients, fournisseurs et livreurs",
    "Listes Scolaires": "Service permettant de télécharger et traiter les listes de fournitures",
    "Panier": "Espace de stockage temporaire des articles avant le paiement",
    "Facture": "Document officiel de la transaction",
    "Suivi": "Service permettant de suivre l'état de votre commande",
    "Fournisseur": "Vendeur de produits sur la plateforme",
    "Livreur": "Professionnel responsable de la livraison des commandes",
  },

  // Messages d'accueil personnalisés
  greetings: {
    default: "Bonjour! Je suis l'assistant IA de Cavaly Livres. Comment puis-je vous aider aujourd'hui?",
    returning: "Bienvenue de retour! Comment puis-je vous assister?",
    firstTime: "Bienvenue chez Cavaly Livres! Je suis ici pour répondre à vos questions.",
  },

  // Suggestions de questions
  suggestedQuestions: [
    "Comment créer un compte?",
    "Quels sont les modes de paiement?",
    "Comment télécharger ma liste scolaire?",
    "Combien de temps prend la livraison?",
    "Comment suivre ma commande?",
    "Puis-je retourner un article?",
    "Comment devenir fournisseur?",
    "Quels sont vos horaires de support?",
  ],
};

// Fonction pour rechercher dans la base de connaissances
export function searchKnowledgeBase(query: string): string {
  const lowerQuery = query.toLowerCase();

  // Rechercher dans les FAQs
  for (const faq of chatbotKnowledgeBase.faqs) {
    if (
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery) ||
      faq.category.toLowerCase().includes(lowerQuery)
    ) {
      return `**${faq.question}**\n\n${faq.answer}`;
    }
  }

  // Rechercher dans les services
  for (const service of chatbotKnowledgeBase.services) {
    if (service.name.toLowerCase().includes(lowerQuery)) {
      return `**${service.name}**\n\n${service.description}\n\nFonctionnalités:\n${service.features.map(f => `- ${f}`).join('\n')}`;
    }
  }

  // Rechercher dans les catégories
  for (const category of chatbotKnowledgeBase.categories) {
    if (category.name.toLowerCase().includes(lowerQuery)) {
      return `**${category.name}**\n\n${category.description}`;
    }
  }

  return "";
}

// Fonction pour enrichir le contexte du chatbot
export function getEnrichedContext(): string {
  return `
Vous êtes l'assistant IA de Cavaly Livres, une plateforme e-commerce spécialisée dans la vente de manuels scolaires, universitaires et oeuvres littéraires en Côte d'Ivoire.

**À propos de Cavaly Livres:**
- Plateforme e-commerce complète
- Spécialisée dans les manuels et oeuvres littéraires
- Basée en Côte d'Ivoire
- Service client réactif

**Services Principaux:**
1. Téléchargement et traitement de listes scolaires avec analyse IA
2. Panier d'achat coulissant et intuitif
3. Paiements sécurisés avec Stripe
4. Suivi de commande en temps réel
5. Gestion de profils (Client, Fournisseur, Livreur)

**Catégories de Produits:**
- Manuels Scolaires (Primaire, Collège, Lycée)
- Manuels Universitaires (Licence, Master, Doctorat)
- Oeuvres Littéraires (Romans, Poésie, Théâtre, etc.)
- Fournitures Scolaires

**Avantages:**
${chatbotKnowledgeBase.advantages.map(a => `- ${a}`).join('\n')}

**Support Client:**
- Email: ${chatbotKnowledgeBase.support.email}
- Heures: ${chatbotKnowledgeBase.support.hours}
- Temps de réponse: ${chatbotKnowledgeBase.support.responseTime}

Répondez aux questions avec enthousiasme et professionnalisme. Utilisez les informations de la base de connaissances pour fournir des réponses précises et utiles.
  `;
}
