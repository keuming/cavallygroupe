import { drizzle } from "drizzle-orm/mysql2/http";
import { eq } from "drizzle-orm";
import { categories, products } from "./drizzle/schema.ts";

// Configuration de la base de données
const db = drizzle(process.env.DATABASE_URL);

// Données de test des catégories
const testCategories = [
  { name: "Manuels Scolaires", description: "Livres et manuels pour l'école" },
  { name: "Fournitures Scolaires", description: "Cahiers, stylos et accessoires" },
  { name: "Oeuvres Littéraires", description: "Romans et livres de littérature" },
  { name: "Livres Universitaires", description: "Manuels pour l'université" },
  { name: "Accessoires Éducatifs", description: "Calculatrices, règles et outils" },
];

// Données de test des produits
const testProducts = [
  // Manuels Scolaires
  {
    name: "Mathématiques - Classe 6ème",
    description: "Manuel complet de mathématiques pour la 6ème année",
    price: 15000,
    categoryId: 1,
    stock: 50,
    image: "https://via.placeholder.com/300x400?text=Math+6eme",
  },
  {
    name: "Français - Classe 5ème",
    description: "Manuel de français avec exercices et corrigés",
    price: 12000,
    categoryId: 1,
    stock: 45,
    image: "https://via.placeholder.com/300x400?text=Francais+5eme",
  },
  {
    name: "Sciences Naturelles - Classe 4ème",
    description: "Manuel de sciences avec illustrations détaillées",
    price: 14000,
    categoryId: 1,
    stock: 40,
    image: "https://via.placeholder.com/300x400?text=Sciences+4eme",
  },
  {
    name: "Histoire-Géographie - Classe 3ème",
    description: "Manuel complet avec cartes et chronologies",
    price: 13000,
    categoryId: 1,
    stock: 35,
    image: "https://via.placeholder.com/300x400?text=HG+3eme",
  },

  // Fournitures Scolaires
  {
    name: "Cahier 96 pages - Seyes",
    description: "Cahier de 96 pages avec lignes Seyes",
    price: 2500,
    categoryId: 2,
    stock: 200,
    image: "https://via.placeholder.com/300x400?text=Cahier+96",
  },
  {
    name: "Stylo Bleu - Lot de 10",
    description: "Lot de 10 stylos bleu de qualité",
    price: 5000,
    categoryId: 2,
    stock: 150,
    image: "https://via.placeholder.com/300x400?text=Stylos+Bleu",
  },
  {
    name: "Crayon HB - Lot de 12",
    description: "Lot de 12 crayons HB pour le dessin et l'écriture",
    price: 3000,
    categoryId: 2,
    stock: 180,
    image: "https://via.placeholder.com/300x400?text=Crayons+HB",
  },
  {
    name: "Gomme - Lot de 5",
    description: "Lot de 5 gommes blanches de qualité",
    price: 2000,
    categoryId: 2,
    stock: 220,
    image: "https://via.placeholder.com/300x400?text=Gommes",
  },
  {
    name: "Règle 30cm",
    description: "Règle en plastique transparent de 30cm",
    price: 1500,
    categoryId: 2,
    stock: 250,
    image: "https://via.placeholder.com/300x400?text=Regle+30cm",
  },
  {
    name: "Équerre et Rapporteur",
    description: "Set d'équerre et rapporteur pour géométrie",
    price: 3500,
    categoryId: 2,
    stock: 120,
    image: "https://via.placeholder.com/300x400?text=Equerre",
  },

  // Oeuvres Littéraires
  {
    name: "Le Seigneur des Anneaux",
    description: "Trilogie complète de J.R.R. Tolkien",
    price: 45000,
    categoryId: 3,
    stock: 25,
    image: "https://via.placeholder.com/300x400?text=LOTR",
  },
  {
    name: "Harry Potter - Intégrale",
    description: "Collection complète des 7 tomes",
    price: 50000,
    categoryId: 3,
    stock: 30,
    image: "https://via.placeholder.com/300x400?text=Harry+Potter",
  },
  {
    name: "Les Misérables",
    description: "Roman classique de Victor Hugo",
    price: 18000,
    categoryId: 3,
    stock: 20,
    image: "https://via.placeholder.com/300x400?text=Les+Miserables",
  },
  {
    name: "Notre-Dame de Paris",
    description: "Chef-d'oeuvre de Victor Hugo",
    price: 16000,
    categoryId: 3,
    stock: 22,
    image: "https://via.placeholder.com/300x400?text=Notre+Dame",
  },

  // Livres Universitaires
  {
    name: "Analyse Mathématique - Tome 1",
    description: "Manuel universitaire d'analyse mathématique",
    price: 25000,
    categoryId: 4,
    stock: 15,
    image: "https://via.placeholder.com/300x400?text=Analyse+Math",
  },
  {
    name: "Chimie Générale",
    description: "Manuel complet de chimie générale",
    price: 22000,
    categoryId: 4,
    stock: 18,
    image: "https://via.placeholder.com/300x400?text=Chimie+Gen",
  },
  {
    name: "Physique Quantique",
    description: "Introduction à la physique quantique",
    price: 28000,
    categoryId: 4,
    stock: 12,
    image: "https://via.placeholder.com/300x400?text=Physique+Q",
  },

  // Accessoires Éducatifs
  {
    name: "Calculatrice Scientifique",
    description: "Calculatrice scientifique avec 240 fonctions",
    price: 35000,
    categoryId: 5,
    stock: 40,
    image: "https://via.placeholder.com/300x400?text=Calculatrice",
  },
  {
    name: "Compas de Géométrie",
    description: "Compas professionnel avec accessoires",
    price: 8000,
    categoryId: 5,
    stock: 60,
    image: "https://via.placeholder.com/300x400?text=Compas",
  },
  {
    name: "Surligneurs - Lot de 6",
    description: "Lot de 6 surligneurs de couleurs différentes",
    price: 4500,
    categoryId: 5,
    stock: 100,
    image: "https://via.placeholder.com/300x400?text=Surligneurs",
  },
  {
    name: "Classeur A4",
    description: "Classeur A4 avec 2 anneaux",
    price: 6000,
    categoryId: 5,
    stock: 80,
    image: "https://via.placeholder.com/300x400?text=Classeur+A4",
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Démarrage du seed de la base de données...");

    // 1. Insérer les catégories
    console.log("📁 Insertion des catégories...");
    const insertedCategories = [];
    for (const cat of testCategories) {
      const result = await db.insert(categories).values(cat);
      insertedCategories.push(result);
    }
    console.log(`✅ ${insertedCategories.length} catégories insérées`);

    // 2. Insérer les produits
    console.log("📦 Insertion des produits...");
    const insertedProducts = [];
    for (const product of testProducts) {
      const result = await db.insert(products).values({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      insertedProducts.push(result);
    }
    console.log(`✅ ${insertedProducts.length} produits insérés`);

    console.log("🎉 Seed complété avec succès!");
    console.log(`
    Résumé:
    - ${insertedCategories.length} catégories
    - ${insertedProducts.length} produits
    
    Les données sont maintenant disponibles dans la base de données.
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    process.exit(1);
  }
}

// Exécuter le seed
seedDatabase();
