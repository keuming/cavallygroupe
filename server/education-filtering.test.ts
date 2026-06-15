import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { educationLevels, products, categories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Education Level Filtering", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }
  });

  it("should retrieve education levels from database", async () => {
    const levels = await db.select().from(educationLevels).limit(5);
    expect(levels.length).toBeGreaterThan(0);
    expect(levels[0]).toHaveProperty("name");
    expect(levels[0]).toHaveProperty("slug");
  });

  it("should have 25 education levels in database", async () => {
    const levels = await db.select().from(educationLevels);
    expect(levels.length).toBe(25);
  });

  it("should have unique slugs for education levels", async () => {
    const levels = await db.select().from(educationLevels);
    const slugs = levels.map((l: any) => l.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("should verify education level names are correct", async () => {
    const expectedNames = [
      "Toute Petite Section",
      "Petite Section",
      "Moyenne Section",
      "Grande Section",
      "CP1",
      "CP2",
      "CE1",
      "CE2",
      "CM1",
      "CM2",
      "Classe de 6ème",
      "Classe de 5ème",
      "Classe de 4ème",
      "Classe de 3ème",
      "Classe de Seconde A",
      "Classe de Seconde C",
      "Classe de Première A",
      "Classe de Première C",
      "Classe de Première D",
      "Classe de Terminale A",
      "Classe de Terminale C",
      "Classe de Terminale D",
      "Classe de Seconde G",
      "Classe de Première G",
      "Classe de Terminale G",
    ];

    const levels = await db.select().from(educationLevels).orderBy(educationLevels.displayOrder);
    const actualNames = levels.map((l: any) => l.name);
    expect(actualNames).toEqual(expectedNames);
  });

  it("should have products table with educationLevelId column", async () => {
    const result = await db.select().from(products).limit(1);
    // If the query succeeds, the column exists
    expect(result).toBeDefined();
  });

  it("should verify education levels are active", async () => {
    const levels = await db.select().from(educationLevels);
    const allActive = levels.every((l: any) => l.isActive === true || l.isActive === 1);
    expect(allActive).toBe(true);
  });

  it("should verify education levels have correct display order", async () => {
    const levels = await db.select().from(educationLevels).orderBy(educationLevels.displayOrder);
    for (let i = 0; i < levels.length; i++) {
      expect(levels[i].displayOrder).toBe(i + 1);
    }
  });
});
