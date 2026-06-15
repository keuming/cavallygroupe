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
      titre: "Sciences de la Vie et de la Terre 3eme",
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
      titre: "Histoire-Geographie Terminale",
      editeur: "CEDA",
      niveau: "Lycee",
      image_url: "https://m.media-amazon.com/images/I/51p8I6f73uL.jpg",
      price: 16000,
      stock: 30
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
      titre: "Anglais Let's Go 4eme",
      editeur: "NEI-CEDA",
      niveau: "College",
      image_url: "https://www.librairiedefrance.net/images/9782844874450.jpg",
      price: 11000,
      stock: 45
    },
    {
      titre: "Allemand Ihr und Wir 1",
      editeur: "Hatier International",
      niveau: "College",
      image_url: "https://static.fnac-static.com/multimedia/Images/FR/NR/04/e6/13/1304068/1507-1/tsp20231102073111/Allemand-4eme-LV2-Ihr-und-wir-Livre-de-l-eleve.jpg",
      price: 13500,
      stock: 25
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
      image_url: "https://m.media-amazon.com/images/I/41-lS0p6yLL._SY445_SX342_.jpg",
      price: 22000,
      stock: 20
    },
    {
      titre: "Economie Generale : Concepts de base",
      editeur: "PUCI",
      niveau: "Universitaire",
      image_url: "https://www.puci.ci/images/eco_gen.jpg",
      price: 19500,
      stock: 18
    },
    {
      titre: "Code du Travail Ivoirien (Annote)",
      editeur: "Juris-Editions",
      niveau: "Professionnel",
      image_url: "https://m.media-amazon.com/images/I/71YvR5AEvKL._AC_UF1000,1000_QL80_.jpg",
      price: 25000,
      stock: 15
    },
    {
      titre: "Comptabilite OHADA : Systeme de base",
      auteur: "Marcel Dobill",
      niveau: "Universitaire",
      image_url: "https://m.media-amazon.com/images/I/51-B67vN9CL._SX342_SY445_.jpg",
      price: 21000,
      stock: 16
    },
    {
      titre: "Droit Constitutionnel Ivoirien",
      auteur: "Meledje Djedjro",
      niveau: "Universitaire",
      image_url: "https://m.media-amazon.com/images/I/41U6m-V-HUL._SX331_BO1,204,203,200_.jpg",
      price: 20000,
      stock: 17
    },
    {
      titre: "Geographie de la Cote d'Ivoire",
      editeur: "Editions Nathan",
      niveau: "Lycee/Superieur",
      image_url: "https://m.media-amazon.com/images/I/51T9X8Z1YAL.jpg",
      price: 14500,
      stock: 28
    },
    {
      titre: "Guide de l'entrepreneur en Afrique",
      editeur: "Fraternite Matin",
      niveau: "Professionnel",
      image_url: "https://www.fratmat.info/images/guide_entrepreneur.jpg",
      price: 18000,
      stock: 22
    },
    {
      titre: "Grammaire Francaise de base",
      editeur: "Adoras",
      niveau: "Primaire/College",
      image_url: "https://www.librairiedefrance.net/images/9782354710123.jpg",
      price: 9500,
      stock: 55
    },
    {
      titre: "Informatique : Algorithmique et Python",
      editeur: "ESATIC Press",
      niveau: "Universitaire",
      image_url: "https://m.media-amazon.com/images/I/51-Y2v2-ZUL.jpg",
      price: 23000,
      stock: 14
    },
    {
      titre: "Marketing Management en contexte africain",
      editeur: "Harmattan CI",
      niveau: "Universitaire",
      image_url: "https://m.media-amazon.com/images/I/418pS8E0eML.jpg",
      price: 21500,
      stock: 15
    },
    {
      titre: "Anatomie Humaine : Tome 1",
      editeur: "UFR Sciences Medicales",
      niveau: "Medecine",
      image_url: "https://m.media-amazon.com/images/I/51Oa7U3V7dL.jpg",
      price: 28000,
      stock: 12
    },
    {
      titre: "Techniques de communication ecrite",
      editeur: "L'ABC",
      niveau: "Universitaire",
      image_url: "https://www.librairiedefrance.net/images/9782844871234.jpg",
      price: 15500,
      stock: 20
    }
  ],
  oeuvres_litteraires_et_romans: [
    {
      titre: "Le Petit Prince",
      auteur: "Antoine de Saint-Exupery",
      genre: "Conte",
      image_url: "https://static.fnac-static.com/multimedia/Images/FR/NR/d2/8c/00/36050/1507-1/tsp20230914101150/Le-Petit-Prince.jpg",
      price: 8500,
      stock: 80
    },
    {
      titre: "L'Etranger",
      auteur: "Albert Camus",
      genre: "Roman",
      image_url: "https://www.folio-lesite.fr/sites/default/files/9782070360024.jpg",
      price: 8500,
      stock: 70
    },
    {
      titre: "Climbie",
      auteur: "Bernard Binlin Dadie",
      genre: "Roman autobiographique",
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
      titre: "La Carte et le Territoire",
      auteur: "Michel Houellebecq",
      genre: "Contemporain",
      image_url: "https://static.fnac-static.com/multimedia/Images/FR/NR/8d/f3/2a/2814861/1507-1/tsp20220603091937/La-carte-et-le-territoire.jpg",
      price: 10000,
      stock: 40
    },
    {
      titre: "Petit Pays",
      auteur: "Gael Faye",
      genre: "Roman",
      image_url: "https://static.livredepoche.com/sites/default/files/images/livres/9782253070443.jpg",
      price: 10000,
      stock: 65
    },
    {
      titre: "Une si longue lettre",
      auteur: "Mariama Ba",
      genre: "Epistolaire",
      image_url: "https://m.media-amazon.com/images/I/41Y8u-H9r4L.jpg",
      price: 9000,
      stock: 50
    },
    {
      titre: "L'Enfant noir",
      auteur: "Camara Laye",
      genre: "Recit",
      image_url: "https://m.media-amazon.com/images/I/71WpXhP9+2L.jpg",
      price: 9500,
      stock: 45
    },
    {
      titre: "1984",
      auteur: "George Orwell",
      genre: "Dystopie",
      image_url: "https://static.fnac-static.com/multimedia/Images/FR/NR/8a/05/ae/11404682/1507-1/tsp20201124175319/1984.jpg",
      price: 10500,
      stock: 55
    },
    {
      titre: "L'Alchimiste",
      auteur: "Paulo Coelho",
      genre: "Philosophique",
      image_url: "https://m.media-amazon.com/images/I/71Yy88vHn3L.jpg",
      price: 9500,
      stock: 75
    },
    {
      titre: "Reine Pokou",
      auteur: "Veronique Tadjo",
      genre: "Legende/Roman",
      image_url: "https://www.actes-sud.fr/sites/default/files/9782742753970_couv.jpg",
      price: 10500,
      stock: 50
    },
    {
      titre: "Triste Pont sur l'Ebrie",
      auteur: "Isaie Biton Koulibaly",
      genre: "Sentimentale",
      image_url: "https://m.media-amazon.com/images/I/41C158Z3G1L.jpg",
      price: 9000,
      stock: 35
    },
    {
      titre: "Le Condition humaine",
      auteur: "Andre Malraux",
      genre: "Historique",
      image_url: "https://www.folio-lesite.fr/sites/default/files/9782070360154.jpg",
      price: 10000,
      stock: 40
    },
    {
      titre: "Madame Bovary",
      auteur: "Gustave Flaubert",
      genre: "Classique",
      image_url: "https://m.media-amazon.com/images/I/81vI4pGvW5L.jpg",
      price: 9500,
      stock: 48
    },
    {
      titre: "Anomalie",
      auteur: "Herve Le Tellier",
      genre: "Contemporain (Goncourt)",
      image_url: "https://m.media-amazon.com/images/I/81p-xW9V0RL.jpg",
      price: 10500,
      stock: 35
    },
    {
      titre: "Celles qui attendent",
      auteur: "Fatou Diome",
      genre: "Francophonie",
      image_url: "https://m.media-amazon.com/images/I/41Y7nF5tH9L.jpg",
      price: 9500,
      stock: 42
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
      titre: "Chanson douce",
      auteur: "Leila Slimani",
      genre: "Thriller psychologique",
      image_url: "https://m.media-amazon.com/images/I/71Oa-C-XNPL.jpg",
      price: 10000,
      stock: 38
    },
    {
      titre: "Le Vieux Negre et la Medaille",
      auteur: "Ferdinand Oyono",
      genre: "Satire",
      image_url: "https://m.media-amazon.com/images/I/41qL6E2Qk1L.jpg",
      price: 9000,
      stock: 40
    },
    {
      titre: "Tout s'effondre",
      auteur: "Chinua Achebe",
      genre: "Classique africain",
      image_url: "https://m.media-amazon.com/images/I/81v66o-O3-L.jpg",
      price: 10500,
      stock: 50
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
      const categoryId = doc.niveau === 'Universitaire' || doc.niveau === 'Medecine' || doc.niveau === 'Professionnel' ? univCat[0].id : schoolCat[0].id;
      
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
