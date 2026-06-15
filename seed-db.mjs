import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { categories, products } from "./drizzle/schema.ts";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Insert categories
const categoryData = [
  {
    name: "Manuels Scolaires",
    slug: "manuels-scolaires",
    description: "Manuels pour l'enseignement primaire et secondaire",
  },
  {
    name: "Manuels Universitaires",
    slug: "manuels-universitaires",
    description: "Manuels et livres pour l'enseignement superieur",
  },
  {
    name: "Oeuvres Litteraires",
    slug: "oeuvres-litteraires",
    description: "Romans, poesies et oeuvres classiques",
  },
];

console.log("Inserting categories...");
for (const cat of categoryData) {
  await db.insert(categories).values(cat);
}

// Insert sample products
const productData = [
  {
    categoryId: 1,
    title: "Mathematiques 6eme",
    author: "Collectif",
    isbn: "978-2-7256-1234-1",
    description: "Manuel complet de mathematiques pour la 6eme",
    price: "12500",
    stock: 50,
    isActive: true,
  },
  {
    categoryId: 1,
    title: "Francais 5eme",
    author: "Collectif",
    isbn: "978-2-7256-1234-2",
    description: "Manuel de francais avec exercices pratiques",
    price: "11000",
    stock: 45,
    isActive: true,
  },
  {
    categoryId: 2,
    title: "Introduction a l'Economie",
    author: "Paul Samuelson",
    isbn: "978-2-7256-1234-3",
    description: "Principes fondamentaux de l'economie moderne",
    price: "28000",
    stock: 30,
    isActive: true,
  },
  {
    categoryId: 2,
    title: "Calcul Integral et Differentiel",
    author: "Jean-Marie Monier",
    isbn: "978-2-7256-1234-4",
    description: "Cours complet avec exercices resolus",
    price: "25000",
    stock: 25,
    isActive: true,
  },
  {
    categoryId: 3,
    title: "Les Miserables",
    author: "Victor Hugo",
    isbn: "978-2-7256-1234-5",
    description: "Chef-d'oeuvre de la litterature francaise",
    price: "8500",
    stock: 100,
    isActive: true,
  },
  {
    categoryId: 3,
    title: "Le Seigneur des Anneaux",
    author: "J.R.R. Tolkien",
    isbn: "978-2-7256-1234-6",
    description: "L'epopee fantastique la plus celebre",
    price: "22000",
    stock: 60,
    isActive: true,
  },
];

console.log("Inserting products...");
for (const prod of productData) {
  await db.insert(products).values({
    ...prod,
    price: prod.price,
  });
}

console.log("Database seeded successfully!");
await connection.end();
