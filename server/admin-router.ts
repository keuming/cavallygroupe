import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { products, categories, orders, orderItems, users } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { getAllUsers, getPendingUsers, approveUser, rejectUser, disableUser, enableUser, updateUserRole, getApprovedUsersCount, getPendingUsersCount } from "./db";

// Middleware to check if user is admin
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can access this resource",
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Dashboard Statistics
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const totalProducts = await db.select().from(products);
      const totalOrders = await db.select().from(orders);
      const totalUsersResult = await db.select().from(users).where(eq(users.role, "user"));
      const totalRevenue = totalOrders.reduce((sum, order) => {
        return sum + (parseFloat(order.totalAmount) || 0);
      }, 0);

      const lowStockProducts = totalProducts.filter((p) => p.stock < 10);

      return {
        totalProducts: totalProducts.length,
        totalOrders: totalOrders.length,
        totalRevenue,
        lowStockProducts: lowStockProducts.length,
        totalUsers: totalUsersResult.length,
        recentOrders: totalOrders.slice(-5).reverse(),
      };
    } catch (error) {
      console.error("[Admin Router] Error getting stats:", error);
      throw error;
    }
  }),

  // Product Management
  listProducts: adminProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        let baseQuery = db.select().from(products);

        let allProducts = await baseQuery;

        if (input.categoryId) {
          allProducts = allProducts.filter(
            (p) => p.categoryId === input.categoryId
          );
        }

        if (input.search) {
          const searchLower = input.search.toLowerCase();
          allProducts = allProducts.filter(
            (p) =>
              p.title.toLowerCase().includes(searchLower) ||
              p.author.toLowerCase().includes(searchLower)
          );
        }

        return allProducts;
      } catch (error) {
        console.error("[Admin Router] Error listing products:", error);
        throw error;
      }
    }),

  // Create Product
  createProduct: adminProcedure
    .input(
      z.object({
        title: z.string(),
        author: z.string(),
        categoryId: z.number(),
        price: z.string(),
        stock: z.number(),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const values = {
          title: input.title,
          author: input.author,
          categoryId: input.categoryId,
          price: input.price,
          stock: input.stock,
          description: input.description || "",
          coverImageUrl: input.coverImageUrl || "",
        };

        await db.insert(products).values(values);

        return { success: true };
      } catch (error) {
        console.error("[Admin Router] Error creating product:", error);
        throw error;
      }
    }),

  // Update Product
  updateProduct: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        author: z.string().optional(),
        price: z.string().optional(),
        stock: z.number().optional(),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const updateData: Record<string, unknown> = {
          updatedAt: new Date(),
        };

        if (input.title !== undefined) updateData.title = input.title;
        if (input.author !== undefined) updateData.author = input.author;
        if (input.price !== undefined) updateData.price = input.price;
        if (input.stock !== undefined) updateData.stock = input.stock;
        if (input.description !== undefined)
          updateData.description = input.description;
        if (input.coverImageUrl !== undefined) updateData.coverImageUrl = input.coverImageUrl;

        await db
          .update(products)
          .set(updateData)
          .where(eq(products.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("[Admin Router] Error updating product:", error);
        throw error;
      }
    }),

  // Update Category
  updateCategory: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.icon !== undefined) updateData.icon = input.icon;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      await db.update(categories).set(updateData).where(eq(categories.id, input.id));
      return { success: true };
    }),

  // Delete Product
  deleteProduct: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.delete(products).where(eq(products.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("[Admin Router] Error deleting product:", error);
        throw error;
      }
    }),

  // Order Management
  listOrders: adminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const allOrders = await db.select().from(orders);

        let filteredOrders = allOrders;
        if (input.status) {
          filteredOrders = filteredOrders.filter(
            (o) => o.status === input.status
          );
        }

        const result = filteredOrders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return result;
      } catch (error) {
        console.error("[Admin Router] Error listing orders:", error);
        throw error;
      }
    }),

  // Get Order Details
  getOrderDetails: adminProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const allOrders = await db.select().from(orders);
        const order = allOrders.find((o) => o.id === input.orderId);

        if (!order) {
          throw new Error("Order not found");
        }

        const allItems = await db.select().from(orderItems);
        const items = allItems.filter((i) => i.orderId === input.orderId);

        return {
          order,
          items,
        };
      } catch (error) {
        console.error("[Admin Router] Error getting order details:", error);
        throw error;
      }
    }),

  // Update Order Status
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum([
          "pending",
          "confirmed",
          "in_transit",
          "delivered",
          "cancelled",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const updateData: Record<string, unknown> = {
          status: input.status,
          updatedAt: new Date(),
        };

        await db
          .update(orders)
          .set(updateData)
          .where(eq(orders.id, input.orderId));

        return { success: true };
      } catch (error) {
        console.error("[Admin Router] Error updating order status:", error);
        throw error;
      }
    }),

  // Low Stock Alert
  getLowStockProducts: adminProcedure
    .input(z.object({ threshold: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const allProducts = await db.select().from(products);
        return allProducts.filter((p) => p.stock < input.threshold);
      } catch (error) {
        console.error("[Admin Router] Error getting low stock products:", error);
        throw error;
      }
    }),

  // Sales Report
  getSalesReport: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const allOrders = await db.select().from(orders);

        let filteredOrders = allOrders;
        if (input.startDate) {
          filteredOrders = filteredOrders.filter(
            (o) => new Date(o.createdAt) >= input.startDate!
          );
        }
        if (input.endDate) {
          filteredOrders = filteredOrders.filter(
            (o) => new Date(o.createdAt) <= input.endDate!
          );
        }

        const totalRevenue = filteredOrders.reduce((sum, order) => {
          return sum + (parseFloat(order.totalAmount) || 0);
        }, 0);

        const totalOrders = filteredOrders.length;
        const averageOrderValue =
          totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          orders: filteredOrders,
        };
      } catch (error) {
        console.error("[Admin Router] Error getting sales report:", error);
        throw error;
      }
    }),

  getAllUsers: adminProcedure.query(async () => {
    return await getAllUsers();
  }),

  getPendingUsers: adminProcedure.query(async () => {
    return await getPendingUsers();
  }),

  approveUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      return await approveUser(input.userId);
    }),

  rejectUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      return await rejectUser(input.userId);
    }),

  disableUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      return await disableUser(input.userId);
    }),

  enableUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      return await enableUser(input.userId);
    }),

  updateUserRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["admin", "user"]) }))
    .mutation(async ({ input }) => {
      return await updateUserRole(input.userId, input.role);
    }),

  getUserStats: adminProcedure.query(async () => {
    const approved = await getApprovedUsersCount();
    const pending = await getPendingUsersCount();
    return { approved, pending, total: approved + pending };
  }),
});
