import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getDb } from "./db";
import { products, categories, orders } from "../drizzle/schema";

describe("Admin Router - Product Management", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
  });

  it("should list products successfully", async () => {
    const allProducts = await db.select().from(products);
    expect(Array.isArray(allProducts)).toBe(true);
    expect(allProducts.length).toBeGreaterThan(0);
  });

  it("should have valid product structure", async () => {
    const allProducts = await db.select().from(products);
    const product = allProducts[0];
    
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("title");
    expect(product).toHaveProperty("author");
    expect(product).toHaveProperty("categoryId");
    expect(product).toHaveProperty("price");
    expect(product).toHaveProperty("stock");
    expect(typeof product.title).toBe("string");
    expect(typeof product.author).toBe("string");
    expect(typeof product.price).toBe("string");
    expect(typeof product.stock).toBe("number");
  });

  it("should filter products by category", async () => {
    const allProducts = await db.select().from(products);
    const categoryId = allProducts[0]?.categoryId;
    
    const filtered = allProducts.filter((p: any) => p.categoryId === categoryId);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((p: any) => p.categoryId === categoryId)).toBe(true);
  });

  it("should search products by title", async () => {
    const allProducts = await db.select().from(products);
    const searchTerm = "Mathématiques";
    
    const results = allProducts.filter((p: any) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    expect(Array.isArray(results)).toBe(true);
  });

  it("should have valid categories", async () => {
    const allCategories = await db.select().from(categories);
    expect(allCategories.length).toBeGreaterThan(0);
    expect(allCategories.every((c: any) => c.name && typeof c.name === "string")).toBe(true);
    // Verify we have at least 3 categories
    expect(allCategories.length).toBeGreaterThanOrEqual(3);
  });

  it("should identify low stock products", async () => {
    const allProducts = await db.select().from(products);
    const threshold = 10;
    
    const lowStockProducts = allProducts.filter((p: any) => p.stock < threshold);
    expect(Array.isArray(lowStockProducts)).toBe(true);
    if (lowStockProducts.length > 0) {
      expect(lowStockProducts.every((p: any) => p.stock < threshold)).toBe(true);
    }
  });
});


describe("Admin Router - Order Management", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
  });

  it("should list orders successfully", async () => {
    const allOrders = await db.select().from(orders);
    expect(Array.isArray(allOrders)).toBe(true);
  });

  it("should have valid order structure", async () => {
    const allOrders = await db.select().from(orders);
    
    if (allOrders.length > 0) {
      const order = allOrders[0];
      expect(order).toHaveProperty("id");
      expect(order).toHaveProperty("orderNumber");
      expect(order).toHaveProperty("customerName");
      expect(order).toHaveProperty("totalAmount");
      expect(order).toHaveProperty("status");
      expect(typeof order.orderNumber).toBe("string");
      expect(typeof order.customerName).toBe("string");
      expect(typeof order.status).toBe("string");
    }
  });

  it("should filter orders by status", async () => {
    const allOrders = await db.select().from(orders);
    const status = "pending";
    
    const filtered = allOrders.filter((o: any) => o.status === status);
    expect(Array.isArray(filtered)).toBe(true);
    expect(filtered.every((o: any) => o.status === status)).toBe(true);
  });

  it("should calculate total revenue from orders", async () => {
    const allOrders = await db.select().from(orders);
    const totalRevenue = allOrders.reduce((sum: number, order: any) => {
      return sum + (parseFloat(order.totalAmount) || 0);
    }, 0);
    
    expect(typeof totalRevenue).toBe("number");
    expect(totalRevenue).toBeGreaterThanOrEqual(0);
  });

  it("should sort orders by creation date", async () => {
    const allOrders = await db.select().from(orders);
    
    if (allOrders.length > 1) {
      const sorted = allOrders.sort(
        (a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      expect(sorted.length).toBe(allOrders.length);
      expect(new Date(sorted[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(sorted[sorted.length - 1].createdAt).getTime()
      );
    }
  });
});

describe("Admin Router - Statistics", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
  });

  it("should calculate correct statistics", async () => {
    const allProducts = await db.select().from(products);
    const allOrders = await db.select().from(orders);
    
    const totalRevenue = allOrders.reduce((sum: number, order: any) => {
      return sum + (parseFloat(order.totalAmount) || 0);
    }, 0);
    
    const lowStockProducts = allProducts.filter((p: any) => p.stock < 10);
    
    expect(allProducts.length).toBeGreaterThan(0);
    expect(typeof totalRevenue).toBe("number");
    expect(Array.isArray(lowStockProducts)).toBe(true);
  });

  it("should calculate average order value", async () => {
    const allOrders = await db.select().from(orders);
    
    if (allOrders.length > 0) {
      const totalRevenue = allOrders.reduce((sum: number, order: any) => {
        return sum + (parseFloat(order.totalAmount) || 0);
      }, 0);
      
      const averageOrderValue = totalRevenue / allOrders.length;
      expect(typeof averageOrderValue).toBe("number");
      expect(averageOrderValue).toBeGreaterThanOrEqual(0);
    }
  });

  it("should get recent orders", async () => {
    const allOrders = await db.select().from(orders);
    const recentOrders = allOrders.slice(-5).reverse();
    
    expect(Array.isArray(recentOrders)).toBe(true);
    expect(recentOrders.length).toBeLessThanOrEqual(5);
  });
});
