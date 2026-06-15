import { drizzle } from 'drizzle-orm/mysql2';
import { products } from './drizzle/schema.js';
import { gt } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

async function cleanup() {
  try {
    // Récupérer tous les produits
    const allProducts = await db.select().from(products);
    console.log(`Total de produits: ${allProducts.length}`);
    
    // Garder les 36 premiers et supprimer les doublons
    if (allProducts.length > 36) {
      const toDelete = allProducts.slice(36).map(p => p.id);
      console.log(`Suppression de ${toDelete.length} doublons...`);
      
      for (const id of toDelete) {
        await db.delete(products).where(gt(products.id, 36));
        break; // Supprimer tous les produits avec id > 36 en une seule requête
      }
      
      console.log('✓ Doublons supprimés!');
    } else {
      console.log('✓ Pas de doublons trouvés');
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

cleanup();
