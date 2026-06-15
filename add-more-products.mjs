import { drizzle } from 'drizzle-orm/mysql2';
import { products } from './drizzle/schema.js';

const db = drizzle(process.env.DATABASE_URL);

const newProducts = [
  // Manuels Scolaires (10 produits)
  { categoryId: 1, title: 'Mathematiques 3eme', author: 'Collectif', description: 'Manuel complet de mathematiques pour la 3eme', price: '8500', stock: 50, coverImageUrl: 'https://via.placeholder.com/300x400?text=Math+3eme' },
  { categoryId: 1, title: 'Francais 4eme', author: 'Collectif', description: 'Cours et exercices de francais', price: '7500', stock: 45, coverImageUrl: 'https://via.placeholder.com/300x400?text=Francais+4eme' },
  { categoryId: 1, title: 'Sciences Naturelles 5eme', author: 'Collectif', description: 'Biologie et geologie pour la 5eme', price: '9000', stock: 40, coverImageUrl: 'https://via.placeholder.com/300x400?text=Sciences+5eme' },
  { categoryId: 1, title: 'Histoire Geographie 6eme', author: 'Collectif', description: 'Histoire et geographie du monde', price: '8000', stock: 35, coverImageUrl: 'https://via.placeholder.com/300x400?text=HG+6eme' },
  { categoryId: 1, title: 'Anglais 2nde', author: 'Collectif', description: 'Apprentissage de l\'anglais', price: '7000', stock: 30, coverImageUrl: 'https://via.placeholder.com/300x400?text=Anglais+2nde' },
  { categoryId: 1, title: 'Physique Chimie 1ere', author: 'Collectif', description: 'Physique et chimie niveau 1ere', price: '10000', stock: 25, coverImageUrl: 'https://via.placeholder.com/300x400?text=PhysChi+1ere' },
  { categoryId: 1, title: 'Philosophie Terminale', author: 'Collectif', description: 'Introduction a la philosophie', price: '9500', stock: 20, coverImageUrl: 'https://via.placeholder.com/300x400?text=Philo+Term' },
  { categoryId: 1, title: 'Economie 2nde', author: 'Collectif', description: 'Principes d\'economie', price: '8500', stock: 28, coverImageUrl: 'https://via.placeholder.com/300x400?text=Eco+2nde' },
  { categoryId: 1, title: 'Technologie 4eme', author: 'Collectif', description: 'Technologie et innovation', price: '7500', stock: 32, coverImageUrl: 'https://via.placeholder.com/300x400?text=Tech+4eme' },
  { categoryId: 1, title: 'Dessin Technique', author: 'Collectif', description: 'Bases du dessin technique', price: '6500', stock: 22, coverImageUrl: 'https://via.placeholder.com/300x400?text=Dessin' },

  // Manuels Universitaires (10 produits)
  { categoryId: 2, title: 'Calcul Differentiel', author: 'Professeur Martin', description: 'Mathematiques superieures', price: '15000', stock: 15, coverImageUrl: 'https://via.placeholder.com/300x400?text=Calcul+Diff' },
  { categoryId: 2, title: 'Chimie Organique', author: 'Dr. Dupont', description: 'Chimie organique avancee', price: '16000', stock: 12, coverImageUrl: 'https://via.placeholder.com/300x400?text=Chimie+Org' },
  { categoryId: 2, title: 'Biologie Moleculaire', author: 'Pr. Lefevre', description: 'Etude des molecules biologiques', price: '17000', stock: 10, coverImageUrl: 'https://via.placeholder.com/300x400?text=Bio+Mol' },
  { categoryId: 2, title: 'Economie Politique', author: 'Pr. Bernard', description: 'Economie et politique', price: '14000', stock: 18, coverImageUrl: 'https://via.placeholder.com/300x400?text=Eco+Pol' },
  { categoryId: 2, title: 'Droit Civil', author: 'Pr. Moreau', description: 'Introduction au droit civil', price: '15500', stock: 14, coverImageUrl: 'https://via.placeholder.com/300x400?text=Droit+Civil' },
  { categoryId: 2, title: 'Informatique Theorique', author: 'Dr. Arnaud', description: 'Theorie de l\'informatique', price: '16500', stock: 11, coverImageUrl: 'https://via.placeholder.com/300x400?text=Info+Theo' },
  { categoryId: 2, title: 'Psychologie Cognitive', author: 'Pr. Leclerc', description: 'Etude du comportement humain', price: '14500', stock: 16, coverImageUrl: 'https://via.placeholder.com/300x400?text=Psy+Cogn' },
  { categoryId: 2, title: 'Sociologie', author: 'Pr. Renaud', description: 'Etude des societes', price: '13500', stock: 19, coverImageUrl: 'https://via.placeholder.com/300x400?text=Sociologie' },
  { categoryId: 2, title: 'Statistiques Appliquees', author: 'Dr. Mercier', description: 'Methodes statistiques', price: '15000', stock: 13, coverImageUrl: 'https://via.placeholder.com/300x400?text=Stats+App' },
  { categoryId: 2, title: 'Gestion d\'Entreprise', author: 'Pr. Garnier', description: 'Management et gestion', price: '14000', stock: 17, coverImageUrl: 'https://via.placeholder.com/300x400?text=Gestion' },

  // Oeuvres Litteraires (10 produits)
  { categoryId: 3, title: 'Les Miserables', author: 'Victor Hugo', description: 'Chef-d\'oeuvre de la litterature francaise', price: '5500', stock: 60, coverImageUrl: 'https://via.placeholder.com/300x400?text=Miserables' },
  { categoryId: 3, title: 'Notre-Dame de Paris', author: 'Victor Hugo', description: 'Roman gothique classique', price: '5000', stock: 55, coverImageUrl: 'https://via.placeholder.com/300x400?text=Notre-Dame' },
  { categoryId: 3, title: 'Le Comte de Monte Cristo', author: 'Alexandre Dumas', description: 'Aventure et revanche', price: '5500', stock: 50, coverImageUrl: 'https://via.placeholder.com/300x400?text=Monte+Cristo' },
  { categoryId: 3, title: 'Les Trois Mousquetaires', author: 'Alexandre Dumas', description: 'Aventures heroiques', price: '5000', stock: 48, coverImageUrl: 'https://via.placeholder.com/300x400?text=3+Mousquetaires' },
  { categoryId: 3, title: 'Madame Bovary', author: 'Gustave Flaubert', description: 'Roman realiste', price: '4500', stock: 42, coverImageUrl: 'https://via.placeholder.com/300x400?text=Madame+Bovary' },
  { categoryId: 3, title: 'Le Siecle des Lumieres', author: 'Voltaire', description: 'Essais philosophiques', price: '4000', stock: 38, coverImageUrl: 'https://via.placeholder.com/300x400?text=Lumieres' },
  { categoryId: 3, title: 'Candide', author: 'Voltaire', description: 'Conte philosophique', price: '3500', stock: 65, coverImageUrl: 'https://via.placeholder.com/300x400?text=Candide' },
  { categoryId: 3, title: 'La Fontaine - Fables', author: 'Jean de La Fontaine', description: 'Fables celebres', price: '4500', stock: 70, coverImageUrl: 'https://via.placeholder.com/300x400?text=Fables' },
  { categoryId: 3, title: 'Poesies Completes', author: 'Charles Baudelaire', description: 'Recueil de poemes', price: '5000', stock: 35, coverImageUrl: 'https://via.placeholder.com/300x400?text=Baudelaire' },
  { categoryId: 3, title: 'Le Petit Prince', author: 'Antoine de Saint-Exupery', description: 'Conte poetique intemporel', price: '3500', stock: 80, coverImageUrl: 'https://via.placeholder.com/300x400?text=Petit+Prince' },
];

async function seed() {
  try {
    for (const product of newProducts) {
      await db.insert(products).values(product);
    }
    console.log('30 produits ajoutes avec succes!');
  } catch (error) {
    console.error('Erreur lors de l\'ajout des produits:', error);
  }
}

seed();
