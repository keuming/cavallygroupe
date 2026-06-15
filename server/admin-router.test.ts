import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AdminUser = NonNullable<TrpcContext["user"]> & { role: "admin" };

function createAdminContext(): { ctx: TrpcContext } {
  const user: AdminUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const user = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Admin Router", () => {
  it("should allow admin to get stats", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getStats();

    expect(result).toBeDefined();
    expect(result.totalProducts).toBeGreaterThanOrEqual(0);
    expect(result.totalOrders).toBeGreaterThanOrEqual(0);
    expect(result.totalRevenue).toBeGreaterThanOrEqual(0);
  });

  it("should deny regular user access to admin stats", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.getStats();
      expect.fail("Should have thrown an error");
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      expect(err.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to list products", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.listProducts({});

    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow admin to list orders", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.listOrders({});

    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow admin to get low stock products", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getLowStockProducts({ threshold: 10 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow admin to get sales report", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getSalesReport({});

    expect(result).toBeDefined();
    expect(result.totalRevenue).toBeGreaterThanOrEqual(0);
    expect(result.totalOrders).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.orders)).toBe(true);
  });
});
