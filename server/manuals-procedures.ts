import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { educationLevels, educationClasses, products } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const manualsRouter = router({
  // Get all education levels
  getLevels: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const levels = await db
      .select()
      .from(educationLevels)
      .where(eq(educationLevels.isActive, true))
      .orderBy(educationLevels.displayOrder);
    
    return levels;
  }),

  // Get classes by level
  getClassesByLevel: publicProcedure
    .input(z.object({ levelId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const classes = await db
        .select()
        .from(educationClasses)
        .where(
          and(
            eq(educationClasses.educationLevelId, input.levelId),
            eq(educationClasses.isActive, true)
          )
        )
        .orderBy(educationClasses.displayOrder);
      
      return classes;
    }),

  // Get all classes
  getAllClasses: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const classes = await db
      .select()
      .from(educationClasses)
      .where(eq(educationClasses.isActive, true))
      .orderBy(educationClasses.displayOrder);
    
    return classes;
  }),

  // Get manuals by class
  getManualsByClass: publicProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const manuals = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.educationClassId, input.classId),
            eq(products.isActive, true)
          )
        );
      
      return manuals;
    }),

  // Create manual
  createManual: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        author: z.string().min(1, "Author is required"),
        isbn: z.string().optional(),
        description: z.string().optional(),
        price: z.string().min(1, "Price is required"),
        stock: z.string().min(0, "Stock must be positive"),
        educationLevelId: z.number().optional(),
        educationClassId: z.number().optional(),
        coverImageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const priceDecimal = parseFloat(input.price);
      const stockInt = parseInt(input.stock, 10);

      if (isNaN(priceDecimal) || priceDecimal <= 0) {
        throw new Error("Price must be a valid positive number");
      }

      if (isNaN(stockInt) || stockInt < 0) {
        throw new Error("Stock must be a valid non-negative number");
      }

      const result = await db.insert(products).values({
        categoryId: 1 as any,
        title: input.title,
        author: input.author,
        isbn: input.isbn || null,
        description: input.description || null,
        price: priceDecimal.toString() as any,
        stock: stockInt,
        educationLevelId: input.educationLevelId,
        educationClassId: input.educationClassId,
        coverImageUrl: input.coverImageUrl || null,
        vendorId: ctx.user?.id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning({ id: products.id });

      return { success: true, id: result[0]?.id };
    }),

  // Get manuals by level
  getManualsByLevel: publicProcedure
    .input(z.object({ levelId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const manuals = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.educationLevelId, input.levelId),
            eq(products.isActive, true)
          )
        );
      
      return manuals;
    }),

  // Get vendor's manuals
  getVendorManuals: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const vendorId = ctx.user?.id;
    if (!vendorId) return [];

    const manuals = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.vendorId, vendorId),
          eq(products.isActive, true)
        )
      );

    return manuals;
  }),

  // Update manual
  updateManual: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1, "Title is required"),
        author: z.string().min(1, "Author is required"),
        isbn: z.string().optional(),
        description: z.string().optional(),
        price: z.string().min(1, "Price is required"),
        stock: z.string().min(0, "Stock must be positive"),
        educationLevelId: z.number().optional(),
        educationClassId: z.number().optional(),
        coverImageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const manual = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id));

      if (!manual || manual.length === 0) {
        throw new Error("Manual not found");
      }

      if (manual[0].vendorId !== ctx.user?.id && ctx.user?.role !== "admin") {
        throw new Error("You don't have permission to update this manual");
      }

      const priceDecimal = parseFloat(input.price);
      const stockInt = parseInt(input.stock, 10);

      if (isNaN(priceDecimal) || priceDecimal <= 0) {
        throw new Error("Price must be a valid positive number");
      }

      if (isNaN(stockInt) || stockInt < 0) {
        throw new Error("Stock must be a valid non-negative number");
      }

      await db
        .update(products)
        .set({
          title: input.title,
          author: input.author,
          isbn: input.isbn || null,
          description: input.description || null,
          price: priceDecimal.toString() as any,
          stock: stockInt,
          educationLevelId: input.educationLevelId,
          educationClassId: input.educationClassId,
          coverImageUrl: input.coverImageUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.id));

      return { success: true };
    }),

  // Delete manual (soft delete)
  deleteManual: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const manual = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id));

      if (!manual || manual.length === 0) {
        throw new Error("Manual not found");
      }

      if (manual[0].vendorId !== ctx.user?.id && ctx.user?.role !== "admin") {
        throw new Error("You don't have permission to delete this manual");
      }

      // Soft delete
      await db
        .update(products)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.id));

      return { success: true };
    }),
});
