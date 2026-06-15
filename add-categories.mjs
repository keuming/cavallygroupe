import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/')[3]?.split('?')[0] || 'cavaly',
});

const newCategories = [
  { name: 'Petites annonces', slug: 'petites-annonces', description: 'Annonces et petites publications' },
  { name: 'Cartable et fournitures', slug: 'cartable-fournitures', description: 'Cartables et fournitures scolaires' },
  { name: 'Recrutement', slug: 'recrutement', description: 'Offres d\'emploi et recrutement' },
  { name: 'Témoignages', slug: 'temoignages', description: 'Témoignages et histoires inspirantes' },
];

for (const cat of newCategories) {
  await connection.execute(
    'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
    [cat.name, cat.slug, cat.description]
  );
  console.log(`✅ Catégorie ajoutée: ${cat.name}`);
}

await connection.end();
console.log('✅ Toutes les catégories ont été ajoutées!');
