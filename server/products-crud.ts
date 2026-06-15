import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "./db";

/**
 * Mutations CRUD pour la gestion des produits (Admin uniquement)
 */
export const productsCrudRouter = router({
  // Créer un nouveau produit
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Le nom est requis"),
        author: z.string().min(1, "L'auteur est requis"),
        publisher: z.string().min(1, "L'éditeur est requis"),
        description: z.string().optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Le prix doit être un nombre valide"),
        categoryId: z.number().positive("La catégorie est requise"),
        stock: z.number().nonnegative("Le stock ne peut pas être négatif"),
        coverImageUrl: z.string().url().optional(),
        isbn: z.string().optional(),
        educationLevelId: z.number().optional(),
        educationClassId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Only admins can create products");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const result = await db.insert(products).values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning({ id: products.id });

        return {
          success: true,
          message: "Produit créé avec succès",
          productId: result[0]?.id || 0,
        };
      } catch (error) {
        throw new Error(`Erreur lors de la création du produit: ${error}`);
      }
    }),

  // Mettre à jour un produit
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().positive(),
        title: z.string().min(1).optional(),
        author: z.string().min(1).optional(),
        publisher: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        categoryId: z.number().positive().optional(),
        stock: z.number().nonnegative().optional(),
        coverImageUrl: z.string().url().optional(),
        isbn: z.string().optional(),
        educationLevelId: z.number().optional(),
        educationClassId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Only admins can update products");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const { id, ...updateData } = input;

        // Vérifier que le produit existe
        const existing = await db
          .select()
          .from(products)
          .where(eq(products.id, id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("Produit non trouvé");
        }

        await db
          .update(products)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(products.id, id));

        return {
          success: true,
          message: "Produit mis à jour avec succès",
        };
      } catch (error) {
        throw new Error(`Erreur lors de la mise à jour du produit: ${error}`);
      }
    }),

  // Supprimer un produit
  delete: protectedProcedure
    .input(z.object({ id: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Only admins can delete products");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Vérifier que le produit existe
        const existing = await db
          .select()
          .from(products)
          .where(eq(products.id, input.id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("Produit non trouvé");
        }

        await db.delete(products).where(eq(products.id, input.id));

        return {
          success: true,
          message: "Produit supprimé avec succès",
        };
      } catch (error) {
        throw new Error(`Erreur lors de la suppression du produit: ${error}`);
      }
    }),

  // Mettre à jour le stock
  updateStock: protectedProcedure
    .input(
      z.object({
        id: z.number().positive(),
        stock: z.number().nonnegative(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Vérifier que le produit existe
        const existing = await db
          .select()
          .from(products)
          .where(eq(products.id, input.id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("Produit non trouvé");
        }

        await db
          .update(products)
          .set({
            stock: input.stock,
            updatedAt: new Date(),
          })
          .where(eq(products.id, input.id));

        return {
          success: true,
          message: "Stock mis à jour avec succès",
        };
      } catch (error) {
        throw new Error(`Erreur lors de la mise à jour du stock: ${error}`);
      }
    }),

  // Mettre à jour le prix
  updatePrice: protectedProcedure
    .input(
      z.object({
        id: z.number().positive(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Vérifier que le produit existe
        const existing = await db
          .select()
          .from(products)
          .where(eq(products.id, input.id))
          .limit(1);

        if (existing.length === 0) {
          throw new Error("Produit non trouvé");
        }

        await db
          .update(products)
          .set({
            price: input.price as any,
            updatedAt: new Date(),
          })
          .where(eq(products.id, input.id));

        return {
          success: true,
          message: "Prix mis à jour avec succès",
        };
      } catch (error) {
        throw new Error(`Erreur lors de la mise à jour du prix: ${error}`);
      }
    }),
});
