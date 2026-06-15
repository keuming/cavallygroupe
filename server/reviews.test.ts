import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { getProductReviews, createReview, getAverageRating, getUserReviewForProduct } from "./db";
import type { InsertReview } from "../drizzle/schema";

describe("Reviews", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should get product reviews", async () => {
    const reviews = await getProductReviews(1);
    expect(Array.isArray(reviews)).toBe(true);
  });

  it("should calculate average rating", async () => {
    const rating = await getAverageRating(1);
    expect(typeof rating).toBe("number");
    expect(rating).toBeGreaterThanOrEqual(0);
    expect(rating).toBeLessThanOrEqual(5);
  });

  it("should check if user has reviewed a product", async () => {
    const review = await getUserReviewForProduct(1, 1);
    expect(review === null || typeof review === "object").toBe(true);
  });

  it("should create a review", async () => {
    const newReview: InsertReview = {
      productId: 1,
      userId: 1,
      rating: 5,
      title: "Excellent livre",
      content: "Ce livre est vraiment excellent et très utile pour les études.",
      isVerifiedPurchase: false,
    };

    const result = await createReview(newReview);
    expect(result).toBeDefined();
  });
});
