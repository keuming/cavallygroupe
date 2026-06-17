import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { InsertUser, users, categories, products, cartItems, carts, orders, orderItems, paymentTransactions, orderTracking, reviews, InsertOrder, productGalleryImages, recruitmentApplications, tutors, supplyLists, conversations, messages, InsertConversation, InsertMessage, educationLevels, educationClasses } from "../drizzle/schema";
import { ENV } from './_core/env';
import type { InsertOrderItem, InsertPaymentTransaction, InsertOrderTracking, InsertReview, InsertRecruitmentApplication, InsertTutor } from "../drizzle/schema";
import { eq, and, or, like, gte, lte, gt, desc, asc, sql, inArray } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = neon(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.email === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * AUTH (email/password)
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createUserWithPassword(data: {
  email: string;
  name: string;
  passwordHash: string;
  role?: "user" | "admin";
  userType?: "client" | "vendor";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // openId is historically required/unique; generate a stable local identifier.
  const openId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;


  const result = await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    loginMethod: "password",
    role: data.role ?? (data.email === ENV.ownerOpenId ? "admin" : "user"),
    userType: data.userType ?? "client",
    isApproved: data.userType === "vendor" ? false : true,
    lastSignedIn: new Date(),
  }).returning();

  return result[0];
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

/**
 * ORDER ITEMS
 */
export async function addOrderItems(orderId: number, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) return;
  for (const item of items) {
    await db.insert(orderItems).values({ ...item, orderId });
  }
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

/**
 * Get order items with full product details
 */
export async function getOrderItemsWithDetails(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: orderItems.id,
    orderId: orderItems.orderId,
    productId: orderItems.productId,
    quantity: orderItems.quantity,
    unitPrice: orderItems.unitPrice,
    subtotal: orderItems.subtotal,
    product: {
      id: products.id,
      title: products.title,
      author: products.author,
      isbn: products.isbn,
      price: products.price,
      coverImageUrl: products.coverImageUrl,
    },
  }).from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));
}

/**
 * PAYMENT TRANSACTIONS
 */
export async function createPaymentTransaction(data: InsertPaymentTransaction) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(paymentTransactions).values(data);
  return result;
}

export async function getPaymentTransactions(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentTransactions).where(eq(paymentTransactions.orderId, orderId));
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

/**
 * CATEGORIES
 */
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

/**
 * PRODUCTS
 */
export async function getAllProducts(limit?: number, offset?: number) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(products).where(eq(products.isActive, true)) as any;
  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);
  return query;
}

export async function getProductsByCategory(categoryId: number, limit?: number, offset?: number) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(products).where(
    and(eq(products.categoryId, categoryId), eq(products.isActive, true))
  ) as any;
  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);
  return query;
}


export async function getAllEducationLevels() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(educationLevels).where(eq(educationLevels.isActive, true)).orderBy(educationLevels.displayOrder);
}

export async function getEducationClassesByLevel(levelId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(educationClasses)
    .where(and(eq(educationClasses.educationLevelId, levelId), eq(educationClasses.isActive, true)))
    .orderBy(educationClasses.displayOrder);
}

export async function getProductsByEducationLevel(educationLevelId: number, limit?: number, offset?: number) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(products).where(
    and(eq(products.educationLevelId, educationLevelId), eq(products.isActive, true))
  ) as any;
  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);
  return query;
}

export async function getProductsByCategoryAndEducationLevel(categoryId: number, educationLevelId: number, limit?: number, offset?: number) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(products).where(
    and(
      eq(products.categoryId, categoryId),
      eq(products.educationLevelId, educationLevelId),
      eq(products.isActive, true)
    )
  ) as any;
  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);
  return query;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function searchProducts(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(
    and(
      eq(products.isActive, true),
      or(
        like(products.title, `%${query}%`),
        like(products.author, `%${query}%`),
        like(products.isbn, `%${query}%`)
      )
    )
  ).limit(20);
}

/**
 * CART
 */

// Get (or create) the active cart for a user
async function getOrCreateActiveCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(carts)
    .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const created = await db.insert(carts).values({ userId, status: "active" }).returning();
  return created[0];
}

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: cartItems.id,
    productId: cartItems.productId,
    quantity: cartItems.quantity,
    product: {
      id: products.id,
      title: products.title,
      author: products.author,
      price: products.price,
      coverImageUrl: products.coverImageUrl,
      stock: products.stock,
    },
  }).from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));
}

export async function addToCart(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) return;

  const cart = await getOrCreateActiveCart(userId);

  // Check if item already in cart
  const existing = await db.select().from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    // Update quantity
    await db.update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    // Insert new item
    await db.insert(cartItems).values({ userId, cartId: cart.id, productId, quantity });
  }
}

export async function updateCartItem(cartItemId: number, quantity: number) {
  const db = await getDb();
  if (!db) return;
  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
  }
}

export async function removeFromCart(cartItemId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

/**
 * ORDERS
 */
export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  
  // Get the created order by orderNumber to retrieve the ID
  const createdOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, data.orderNumber))
    .limit(1);
  
  if (createdOrder && createdOrder.length > 0) {
    return { insertId: createdOrder[0].id };
  }
  
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.select().from(orders).where(eq(orders.id, id)).limit(1);
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result[0];
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

export async function updateOrderPaymentStatus(orderId: number, paymentStatus: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ paymentStatus: paymentStatus as any }).where(eq(orders.id, orderId));
}

/**
 * ORDER TRACKING
 */
export async function createOrderTracking(tracking: InsertOrderTracking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orderTracking).values(tracking).returning();
  return result[0];
}

export async function getOrderTracking(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(orderTracking).where(eq(orderTracking.orderId, orderId));
  return result.length > 0 ? result[0] : null;
}

export async function updateOrderTrackingStatus(trackingId: number, updates: Partial<InsertOrderTracking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orderTracking).set(updates).where(eq(orderTracking.id, trackingId));
}

export async function getOrderTrackingHistory(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(orderTracking).where(eq(orderTracking.orderId, orderId)).orderBy(desc(orderTracking.createdAt));
  return result;
}


// REVIEWS
export async function getProductReviews(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
  return result;
}

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(reviews).values(review);
  return result;
}

export async function getReviewById(reviewId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(reviews).where(eq(reviews.id, reviewId));
  return result.length > 0 ? result[0] : null;
}

export async function getAverageRating(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId));
  
  if (allReviews.length === 0) return 0;
  
  const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((totalRating / allReviews.length) * 10) / 10;
}

export async function getUserReviewForProduct(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)));
  
  return result.length > 0 ? result[0] : null;
}


/**
 * ADVANCED FILTERING AND SORTING
 */
export async function getProductsWithFilters(
  categoryId?: number,
  minPrice?: number,
  maxPrice?: number,
  inStockOnly?: boolean,
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating',
  limit?: number,
  offset?: number
) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(products).where(eq(products.isActive, true)) as any;

  // Apply category filter
  if (categoryId) {
    query = query.where(eq(products.categoryId, categoryId));
  }

  // Apply price filters
  if (minPrice !== undefined && maxPrice !== undefined) {
    query = query.where(
      and(
        gte(products.price, minPrice.toString()),
        lte(products.price, maxPrice.toString())
      )
    );
  } else if (minPrice !== undefined) {
    query = query.where(gte(products.price, minPrice.toString()));
  } else if (maxPrice !== undefined) {
    query = query.where(lte(products.price, maxPrice.toString()));
  }

  // Apply stock filter
  if (inStockOnly) {
    query = query.where(gt(products.stock, 0));
  }

  // Apply sorting
  switch (sortBy) {
    case 'price-asc':
      query = query.orderBy(asc(products.price));
      break;
    case 'price-desc':
      query = query.orderBy(desc(products.price));
      break;
    case 'newest':
      query = query.orderBy(desc(products.createdAt));
      break;
    case 'popular':
      // For now, just order by ID (can be enhanced with review count later)
      query = query.orderBy(desc(products.id));
      break;
    case 'rating':
      // For now, just order by ID (can be enhanced with average rating later)
      query = query.orderBy(desc(products.id));
      break;
    default:
      query = query.orderBy(desc(products.createdAt));
  }

  // Apply pagination
  if (limit) query = query.limit(limit);
  if (offset) query = query.offset(offset);

  return query;
}

export async function getProductCountWithFilters(
  categoryId?: number,
  minPrice?: number,
  maxPrice?: number,
  inStockOnly?: boolean
) {
  const db = await getDb();
  if (!db) return 0;

  let query = db.select({ count: sql`COUNT(*)` }).from(products).where(eq(products.isActive, true)) as any;

  if (categoryId) {
    query = query.where(eq(products.categoryId, categoryId));
  }

  if (minPrice !== undefined && maxPrice !== undefined) {
    query = query.where(
      and(
        gte(products.price, minPrice.toString()),
        lte(products.price, maxPrice.toString())
      )
    );
  } else if (minPrice !== undefined) {
    query = query.where(gte(products.price, minPrice.toString()));
  } else if (maxPrice !== undefined) {
    query = query.where(lte(products.price, maxPrice.toString()));
  }

  if (inStockOnly) {
    query = query.where(gt(products.stock, 0));
  }

  const result = await query;
  return Number(result[0]?.count ?? 0);
}

export async function getPriceRange(categoryId?: number) {
  const db = await getDb();
  if (!db) return { min: 0, max: 0 };

  let query = db.select({
    min: sql`MIN(CAST(${products.price} AS DECIMAL(10,2)))`,
    max: sql`MAX(CAST(${products.price} AS DECIMAL(10,2)))`
  }).from(products).where(eq(products.isActive, true)) as any;

  if (categoryId) {
    query = query.where(eq(products.categoryId, categoryId));
  }

  const result = await query;
  return {
    min: Number(result[0]?.min ?? 0),
    max: Number(result[0]?.max ?? 0)
  };
}


// Gallery Images Management
export async function getProductGalleryImages(productId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const images = await db
      .select()
      .from(productGalleryImages)
      .where(eq(productGalleryImages.productId, productId))
      .orderBy(asc(productGalleryImages.displayOrder));
    return images;
  } catch (error) {
    console.error("[Database] Error getting gallery images:", error);
    return [];
  }
}

export async function addProductGalleryImage(
  productId: number,
  imageUrl: string,
  altText?: string,
  imageType: "front_cover" | "back_cover" | "spine" | "interior" | "other" = "other"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get the next display order
    const lastImage = await db
      .select({ displayOrder: productGalleryImages.displayOrder })
      .from(productGalleryImages)
      .where(eq(productGalleryImages.productId, productId))
      .orderBy(desc(productGalleryImages.displayOrder))
      .limit(1);

    const nextOrder = lastImage.length > 0 ? (lastImage[0].displayOrder || 0) + 1 : 0;

    const result = await db.insert(productGalleryImages).values({
      productId,
      imageUrl,
      altText,
      imageType,
      displayOrder: nextOrder,
    });

    return result;
  } catch (error) {
    console.error("[Database] Error adding gallery image:", error);
    throw error;
  }
}

export async function deleteProductGalleryImage(imageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .delete(productGalleryImages)
      .where(eq(productGalleryImages.id, imageId));
    return result;
  } catch (error) {
    console.error("[Database] Error deleting gallery image:", error);
    throw error;
  }
}

export async function updateGalleryImageOrder(imageId: number, displayOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .update(productGalleryImages)
      .set({ displayOrder })
      .where(eq(productGalleryImages.id, imageId));
    return result;
  } catch (error) {
    console.error("[Database] Error updating gallery image order:", error);
    throw error;
  }
}


/**
 * RECRUITMENT APPLICATIONS
 */
export async function createRecruitmentApplication(app: InsertRecruitmentApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(recruitmentApplications).values(app);
  return result;
}

export async function getRecruitmentApplications() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(recruitmentApplications).orderBy(desc(recruitmentApplications.createdAt));
}

export async function getRecruitmentApplicationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(recruitmentApplications).where(eq(recruitmentApplications.id, id));
  return result.length > 0 ? result[0] : null;
}

export async function updateRecruitmentApplicationStatus(id: number, status: "pending" | "approved" | "rejected", rejectionReason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updates: any = { status };
  if (rejectionReason) {
    updates.rejectionReason = rejectionReason;
  }
  
  await db.update(recruitmentApplications).set(updates).where(eq(recruitmentApplications.id, id));
}

/**
 * TUTORS (RÉPÉTITEURS)
 */
export async function createTutor(tutor: InsertTutor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tutors).values(tutor);
  return result;
}

export async function getTutorApplications() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tutors).orderBy(desc(tutors.createdAt));
}

export async function getPublishedTutors() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tutors).where(and(eq(tutors.status, "approved"), eq(tutors.isPublished, true))).orderBy(asc(tutors.lastName));
}

export async function getTutorById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(tutors).where(eq(tutors.id, id));
  return result.length > 0 ? result[0] : null;
}

export async function updateTutorStatus(id: number, status: "pending" | "approved" | "rejected", rejectionReason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updates: any = { status };
  if (rejectionReason) {
    updates.rejectionReason = rejectionReason;
  }
  
  await db.update(tutors).set(updates).where(eq(tutors.id, id));
}

export async function publishTutor(id: number, isPublished: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tutors).set({ isPublished }).where(eq(tutors.id, id));
}


/**
 * Supply Lists (Demandes de Devis)
 */
export async function getAllSupplyLists() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      id: supplyLists.id,
      userId: supplyLists.userId,
      fileName: supplyLists.fileName,
      fileUrl: supplyLists.fileUrl,
      fileType: supplyLists.fileType,
      status: supplyLists.status,
      createdAt: supplyLists.createdAt,
      updatedAt: supplyLists.updatedAt,
      // Join with users to get customer info
      customerName: users.name,
      customerEmail: users.email,
      customerPhone: users.phone,
    })
    .from(supplyLists)
    .leftJoin(users, eq(supplyLists.userId, users.id))
    .orderBy(desc(supplyLists.createdAt));

  return result;
}

export async function getSupplyListById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(supplyLists)
    .where(eq(supplyLists.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getSupplyListsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(supplyLists)
    .where(eq(supplyLists.userId, userId))
    .orderBy(desc(supplyLists.createdAt));

  return result;
}

export async function updateSupplyListStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(supplyLists)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(supplyLists.id, id));
}


// ============ MESSAGING ============

export async function getOrCreateConversation(clientId: number, vendorId: number, orderId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if conversation already exists
  const existing = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.clientId, clientId),
        eq(conversations.vendorId, vendorId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new conversation
  const result = await db.insert(conversations).values({
    clientId,
    vendorId,
    orderId,
  }).returning();

  return result[0];
}

export async function getConversations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(conversations)
    .where(
      or(
        eq(conversations.clientId, userId),
        eq(conversations.vendorId, userId)
      )
    )
    .orderBy(desc(conversations.lastMessageAt));
}

export async function getConversationById(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1)
    .then(rows => rows[0]);
}

export async function sendMessage(conversationId: number, senderId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Insert message
  const result = await db.insert(messages).values({
    conversationId,
    senderId,
    content,
    isRead: false,
  }).returning();

  // Update conversation's lastMessageAt
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return result[0];
}

export async function getMessages(conversationId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markMessagesAsRead(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get all unread messages from other users
  const unreadMessages = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.isRead, false),
        // Not sent by the current user
        sql`${messages.senderId} != ${userId}`
      )
    );

  if (unreadMessages.length === 0) return;

  // Mark them as read
  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.isRead, false),
        sql`${messages.senderId} != ${userId}`
      )
    );
}

export async function getUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get conversations where user is involved
  const userConversations = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      or(
        eq(conversations.clientId, userId),
        eq(conversations.vendorId, userId)
      )
    );

  if (userConversations.length === 0) return 0;

  const conversationIds = userConversations.map(c => c.id);

  // Count unread messages not sent by the user
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(messages)
    .where(
      and(
        inArray(messages.conversationId, conversationIds),
        eq(messages.isRead, false),
        sql`${messages.senderId} != ${userId}`
      )
    );

  return Number(result[0]?.count ?? 0);
}


// ============================================================================
// USER MANAGEMENT FUNCTIONS
// ============================================================================

export async function getAllUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(users).orderBy(desc(users.createdAt));
}
export async function getPendingUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(users).where(eq(users.isApproved, false)).orderBy(asc(users.createdAt));
}

export async function approveUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ isApproved: true, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return await getUserById(userId);
}

export async function rejectUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ isApproved: false, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return await getUserById(userId);
}

export async function disableUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ isApproved: false, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return await getUserById(userId);
}

export async function enableUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ isApproved: true, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return await getUserById(userId);
}

export async function updateUserRole(userId: number, role: "admin" | "user") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return await getUserById(userId);
}

export async function getApprovedUsersCount() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(eq(users.isApproved, true));

  return Number(result[0]?.count ?? 0);
}

export async function getPendingUsersCount() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(eq(users.isApproved, false));

  return Number(result[0]?.count ?? 0);
}
