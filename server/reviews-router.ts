import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getProductReviews,
  createReview,
  getAverageRating,
  getUserReviewForProduct,
} from "./db";
import type { InsertReview } from "../drizzle/schema";

export const reviewsRouter = router({
  getByProduct: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      return getProductReviews(input.productId);
    }),
  
  getAverageRating: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      return getAverageRating(input.productId);
    }),
  
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().min(1).max(255),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingReview = await getUserReviewForProduct(ctx.user.id, input.productId);
      if (existingReview) {
        throw new Error("You have already reviewed this product");
      }
      
      const review: InsertReview = {
        productId: input.productId,
        userId: ctx.user.id,
        rating: input.rating,
        title: input.title,
        content: input.content,
        isVerifiedPurchase: false,
      };
      
      await createReview(review);
      return { success: true };
    }),
});
