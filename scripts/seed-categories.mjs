import { drizzle } from "drizzle-orm/mysql2/http";
import { categories } from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const newCategories = [
  {
    name: "Écritures",
    slug: "ecritures",
    description: "Crayons, stylos, gommes, règles, ciseaux, taille-crayons et autres fournitures d'écriture"
  },
  {
    name: "Papeterie",
    slug: "papeterie",
    description: "Cahiers, agendas scolaires, blocs notes et autres articles de papeterie"
  },
  {
    name: "Littérature",
    slug: "litterature",
    description: "Romans, contes et autres œuvres littéraires"
  },
  {
    name: "Maroquinerie",
    slug: "maroquinerie",
    description: "Sacs, cartables et autres articles en cuir"
  }
];

async function seedCategories() {
  try {
    console.log("Insertion des nouvelles catégories...");
    
    for (const category of newCategories) {
      await db.insert(categories).values(category);
      console.log(`✓ Catégorie "${category.name}" ajoutée`);
    }
    
    console.log("\n✓ Toutes les catégories ont été ajoutées avec succès!");
  } catch (error) {
    console.error("Erreur lors de l'insertion des catégories:", error);
    process.exit(1);
  }
}

seedCategories();
