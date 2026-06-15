import { drizzle } from 'drizzle-orm/mysql2';
import { products, categories } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

const documents = {
  manuels_scolaires_et_universitaires_ci: [
    {
      titre: "Mon livre de Francais CP1",
      editeur: "NEI-CEDA",
      niveau: "Primaire",
      image_url: "https://www.librairiedefrance.net/images/9782844877772.jpg",
      price: 8500,
      stock: 50
    },
    {
      titre: "Mon cahier d'habiletes SVT 3eme",
      editeur: "JD Editions",
      niveau: "College",
      image_url: "https://jdeditionsnumeriques.net/wp-content/uploads/2021/08/SVT-3EME.jpg",
      price: 12000,
      stock: 40
    },
    {
      titre: "Mathematiques Collection Emergence 6eme",
      editeur: "NEI-CEDA",
      niveau: "College",
      image_url: "https://www.librairiedefrance.net/images/9782844876546.jpg",
      price: 15000,
      stock: 35
    },
    {
      titre: "Physique-Chimie Collection Eureka 2nde C",
      editeur: "JD Editions",
      niveau: "Lycee",
      image_url: "https://jdeditionsnumeriques.net/wp-content/uploads/2021/08/PC-2NDE-C.jpg",
      price: 18000,
      stock: 30
    },
    {
      titre: "Philosophie : L'Essentiel du Bac",
      editeur: "Vallesse",
      niveau: "Lycee",
      image_url: "https://vallesse.ci/images/couvertures/philo_tle.jpg",
      price: 16500,
      stock: 25
    },
    {
      titre: "Precis de Droit Civil Ivoirien",
      auteur: "Francis Wodie",
      niveau: "Universitaire",
      image_url: "https://www.puci.ci/couvertures/droit_civil_wodie.jpg",
      price: 22000,
      stock: 20
    }
  ],
  oeuvres_litteraires_et_romans: [
    {
      titre: "Climbie",
      auteur: "Bernard Binlin Dadie",
      genre: "Roman",
      image_url: "https://m.media-amazon.com/images/I/41D0v9YvYAL.jpg",
      price: 9500,
      stock: 60
    },
    {
      titre: "Les Soleils des independances",
      auteur: "Ahmadou Kourouma",
      genre: "Francophonie",
      image_url: "https://static.fnac-static.com/multimedia/Images/FR/NR/2b/4d/00/19867/1507-1/tsp20230327071537/Les-Soleils-des-independances.jpg",
      price: 11000,
      stock: 55
    },
    {
      titre: "Reine Pokou",
      auteur: "Veronique Tadjo",
      genre: "Legende",
      image_url: "https://www.actes-sud.fr/sites/default/files/9782742753970_couv.jpg",
      price: 10500,
      stock: 50
    },
    {
      titre: "Les Frasques d'Ebinto",
      auteur: "Amadou Kone",
      genre: "Drame social",
      image_url: "https://m.media-amazon.com/images/I/81x-vH5kF8L.jpg",
      price: 9800,
      stock: 45
    },
    {
      titre: "L'Etranger",
      auteur: "Albert Camus",
      genre: "Classique",
      image_url: "https://www.folio-lesite.fr/sites/default/files/9782070360024.jpg",
      price: 8500,
      stock: 70
    },
    {
      titre: "Petit Pays",
      auteur: "Gael Faye",
      genre: "Roman",
      image_url: "https://static.livredepoche.com/sites/default/files/images/livres/9782253070443.jpg",
      price: 10000,
      stock: 65
    }
  ]
};

async function addDocuments() {
  try {
    // Get category IDs
    const schoolCat = await db.select().from(categories).where(eq(categories.slug, 'manuels-scolaires')).limit(1);
    const univCat = await db.select().from(categories).where(eq(categories.slug, 'manuels-universitaires')).limit(1);
    const litCat = await db.select().from(categories).where(eq(categories.slug, 'oeuvres-litteraires')).limit(1);

    if (!schoolCat.length || !univCat.length || !litCat.length) {
      console.error('Categories not found');
      return;
    }

    // Add school and university manuals
    for (const doc of documents.manuels_scolaires_et_universitaires_ci) {
      const categoryId = doc.niveau === 'Universitaire' ? univCat[0].id : schoolCat[0].id;
      
      await db.insert(products).values({
        categoryId,
        title: doc.titre,
        author: doc.auteur || doc.editeur || 'Collectif',
        description: `${doc.niveau} - ${doc.editeur || ''}`,
        price: doc.price.toString(),
        stock: doc.stock,
        coverImageUrl: doc.image_url,
        isActive: true,
      });
      
      console.log(`✓ Added: ${doc.titre}`);
    }

    // Add literary works
    for (const doc of documents.oeuvres_litteraires_et_romans) {
      await db.insert(products).values({
        categoryId: litCat[0].id,
        title: doc.titre,
        author: doc.auteur,
        description: `${doc.genre}`,
        price: doc.price.toString(),
        stock: doc.stock,
        coverImageUrl: doc.image_url,
        isActive: true,
      });
      
      console.log(`✓ Added: ${doc.titre}`);
    }

    console.log('\n✓ All documents added successfully!');
  } catch (error) {
    console.error('Error adding documents:', error);
  }
}

addDocuments();
