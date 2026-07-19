import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { createSessionToken } from "./_core/auth";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createCheckoutSession } from "./stripe";
import { mobileMoneyRouter } from "./mobile-money-router";

import { paymentsRouter } from "./payments-router";
import { smsRouter } from "./sms-router";
import { adminRouter } from "./admin-router";
import { reviewsRouter } from "./reviews-router";
import { emailRouter } from "./email-router";
import { orderManagementRouter } from "./order-management-router";
import { recruitmentRouter } from "./recruitment-router";
import { aiChatRouter } from "./ai-chat-router";
import { manualsRouter } from "./manuals-procedures";
import { productsCrudRouter } from "./products-crud";

import {
  getAllCategories,
  getCategoryBySlug,
  getAllProducts,
  getProductsByCategory,
  getProductsByEducationLevel,
  getProductsByCategoryAndEducationLevel,
  getProductById,
  searchProducts,
  getProductsWithFilters,
  getProductCountWithFilters,
  getPriceRange,
  getCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  createOrder,
  getOrderById,
  getOrderByNumber,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
  getAllUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  disableUser,
  enableUser,
  updateUserRole,
  getApprovedUsersCount,
  getPendingUsersCount,
  addOrderItems as addOrderItemsDb,
  getOrderItems,
  getOrderItemsWithDetails,
  createPaymentTransaction,
  getPaymentTransactions,
  createOrderTracking,
  getOrderTracking,
  updateOrderTrackingStatus,
  getOrderTrackingHistory,
  getProductReviews,
  createReview,
  getAverageRating,
  getUserReviewForProduct,
  getProductGalleryImages,
  getOrCreateConversation,
  getConversations,
  getConversationById,
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getUnreadMessageCount,
  addProductGalleryImage,
  deleteProductGalleryImage,
  updateGalleryImageOrder,
  getAllSupplyLists,
  getSupplyListById,
  getSupplyListsByUserId,
  updateSupplyListStatus,
  getUserByEmail,
  createUserWithPassword,
  updateUserLastSignedIn,
  getDb,
  getAllEducationLevels,
  getEducationClassesByLevel,
} from "./db";
import type { InsertReview } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const addOrderItems = addOrderItemsDb;

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  reviews: reviewsRouter,
  payments: paymentsRouter,
  email: emailRouter,
  recruitment: recruitmentRouter,
  aiChat: aiChatRouter,
  manuals: manualsRouter,
  productsCrud: productsCrudRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    register: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
        phone: z.string().optional(),
        userType: z.enum(["client", "vendor"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const bcrypt = await import("bcryptjs");
        const existing = await getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Un compte existe déjà avec cet email." });
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const user = await createUserWithPassword({
          email: input.email,
          name: input.name,
          passwordHash,
          phone: input.phone,
          userType: input.userType,
        });

        const token = await createSessionToken({ userId: user.id, openId: user.openId });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true, user, token };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const bcrypt = await import("bcryptjs");
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou mot de passe incorrect." });
        }

        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou mot de passe incorrect." });
        }

        await updateUserLastSignedIn(user.id);

        const token = await createSessionToken({ userId: user.id, openId: user.openId });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true, user, token };
      }),

    logout: publicProcedure.mutation(({ ctx }: any) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    updateUserType: protectedProcedure
      .input(z.object({ userType: z.enum(["client", "vendor"]) }))
      .mutation(async ({ ctx, input }: any) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { users } = await import("../drizzle/schema");
        await db.update(users).set({ userType: input.userType }).where(eq(users.id, ctx.user.id));
        return { success: true };
      }),
  }),

  // CATEGORIES
  education: router({
    getLevels: publicProcedure.query(async () => getAllEducationLevels()),
    getClasses: publicProcedure
      .input(z.object({ levelId: z.number() }))
      .query(async ({ input }) => getEducationClassesByLevel(input.levelId)),
  }),

  categories: router({
    list: publicProcedure.query(async () => {
      return getAllCategories();
    }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getCategoryBySlug(input.slug);
      }),
  }),

  // PRODUCTS
  products: router({
    getUploadUrl: protectedProcedure
      .input(z.object({ fileName: z.string(), fileType: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin only" });
        const { nanoid } = await import("nanoid");
        const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
        const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
        const { ENV } = await import("./_core/env");
        if (!ENV.s3Bucket) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "S3 non configuré" });
        const ext = input.fileName.split(".").pop() ?? "jpg";
        const key = `products/${nanoid()}.${ext}`;
        const client = new S3Client({ region: ENV.s3Region, credentials: { accessKeyId: ENV.s3AccessKeyId, secretAccessKey: ENV.s3SecretAccessKey } });
        const cmd = new PutObjectCommand({ Bucket: ENV.s3Bucket, Key: key, ContentType: input.fileType });
        const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 300 });
        const base = ENV.s3PublicUrl ? ENV.s3PublicUrl.replace(/\/$/, "") : `https://${ENV.s3Bucket}.s3.${ENV.s3Region}.amazonaws.com`;
        return { uploadUrl, publicUrl: `${base}/${key}`, key };
      }),
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return getAllProducts(input.limit, input.offset);
      }),
    getByCategory: publicProcedure
      .input(
        z.object({
          categoryId: z.number(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return getProductsByCategory(input.categoryId, input.limit, input.offset);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getProductById(input.id);
      }),
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return searchProducts(input.query);
      }),
    withFilters: publicProcedure
      .input(
        z.object({
          categoryId: z.number().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          inStockOnly: z.boolean().optional(),
          sortBy: z.enum(["price-asc", "price-desc", "newest", "popular", "rating"]).optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const results = await getProductsWithFilters(
          input.categoryId,
          input.minPrice,
          input.maxPrice,
          input.inStockOnly,
          input.sortBy,
          input.limit,
          input.offset
        );
        // Optimiser: ne pas envoyer les base64 complètes dans les listes
        return results.map((p: any) => ({
          ...p,
          coverImageUrl: p.coverImageUrl?.startsWith('data:')
            ? p.coverImageUrl.substring(0, 100) + '__BASE64__'
            : p.coverImageUrl,
        }));
      }),
    count: publicProcedure
      .input(
        z.object({
          categoryId: z.number().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          inStockOnly: z.boolean().optional(),
        })
      )
      .query(async ({ input }) => {
        return getProductCountWithFilters(
          input.categoryId,
          input.minPrice,
          input.maxPrice,
          input.inStockOnly
        );
      }),
    priceRange: publicProcedure
      .input(z.object({ categoryId: z.number().optional() }))
      .query(async ({ input }) => {
        return getPriceRange(input.categoryId);
      }),
    byEducationLevel: publicProcedure
      .input(
        z.object({
          educationLevelId: z.number(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return getProductsByEducationLevel(input.educationLevelId, input.limit, input.offset);
      }),
    byCategoryAndEducationLevel: publicProcedure
      .input(
        z.object({
          categoryId: z.number(),
          educationLevelId: z.number(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return getProductsByCategoryAndEducationLevel(
          input.categoryId,
          input.educationLevelId,
          input.limit,
          input.offset
        );
      }),
    gallery: router({
      getImages: publicProcedure
        .input(z.object({ productId: z.number() }))
        .query(async ({ input }) => {
          return getProductGalleryImages(input.productId);
        }),
      addImage: protectedProcedure
        .input(z.object({
          productId: z.number(),
          imageUrl: z.string().url(),
          altText: z.string().optional(),
          imageType: z.enum(["front_cover", "back_cover", "spine", "interior", "other"]).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          // Only admin can add images
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized");
          }
          return addProductGalleryImage(
            input.productId,
            input.imageUrl,
            input.altText,
            input.imageType || "other"
          );
        }),
      deleteImage: protectedProcedure
        .input(z.object({ imageId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          // Only admin can delete images
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized");
          }
          return deleteProductGalleryImage(input.imageId);
        }),
      updateImageOrder: protectedProcedure
        .input(z.object({
          imageId: z.number(),
          displayOrder: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
          // Only admin can update order
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized");
          }
          return updateGalleryImageOrder(input.imageId, input.displayOrder);
        }),
    }),
  }),

  // CART
  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getCartItems(ctx.user.id);
    }),
    add: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          quantity: z.number().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await addToCart(ctx.user.id, input.productId, input.quantity);
        return { success: true };
      }),
    update: protectedProcedure
      .input(
        z.object({
          cartItemId: z.number(),
          quantity: z.number().min(0),
        })
      )
      .mutation(async ({ input }) => {
        await updateCartItem(input.cartItemId, input.quantity);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input }) => {
        await removeFromCart(input.cartItemId);
        return { success: true };
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // ORDERS
  orders: router({
    create: protectedProcedure
      .input(
        z.object({
          paymentMethod: z.enum(["wave", "moov", "mtn", "orange", "stripe", "cash"]),
          customerName: z.string().min(1),
          customerPhone: z.string().min(1),
          customerEmail: z.string().email().optional(),
          deliveryAddress: z.string().min(1),
          deliveryCity: z.string().min(1),
          deliveryPostalCode: z.string().optional(),
          items: z.array(
            z.object({
              productId: z.number(),
              quantity: z.number().min(1),
              unitPrice: z.string(),
            })
          ),
          totalAmount: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Generate order number
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
        const random = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(5, "0");
        const orderNumber = `ORD-${dateStr}-${random}`;

        // Create order
        const result = await createOrder({
          userId: ctx.user.id,
          orderNumber,
          paymentMethod: input.paymentMethod as any,
          paymentStatus: "pending",
          status: "pending",
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          deliveryAddress: input.deliveryAddress,
          deliveryCity: input.deliveryCity,
          deliveryPostalCode: input.deliveryPostalCode,
          totalAmount: input.totalAmount as any,
          shippingCost: "0",
        });

        // Add order items
        if (result) {
          const orderId = Number((result as any).insertId);
          const orderItems = input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: (Number(item.unitPrice) * item.quantity).toString(),
          }));
          await addOrderItems(orderId, orderItems as any);
          await clearCart(ctx.user.id);

          // Envoyer email + SMS de confirmation (sans bloquer la réponse)
          const { sendOrderConfirmationEmail } = await import('./email-service');
          const smsService = await import('./sms-service');
          const { getOrderItems: getItems } = await import('./db');

          // Email de confirmation
          if (input.customerEmail) {
            try {
              const orderItems2 = await getItems(orderId);
              await sendOrderConfirmationEmail({
                orderNumber,
                customerName: input.customerName,
                customerEmail: input.customerEmail,
                items: orderItems2 || [],
                totalAmount: input.totalAmount,
                shippingCost: '0',
                deliveryAddress: input.deliveryAddress,
                deliveryCity: input.deliveryCity,
                deliveryPostalCode: input.deliveryPostalCode,
                paymentMethod: input.paymentMethod,
                trackingUrl: `https://www.cavallygroupe.com/order-confirmation?orderId=${orderId}`,
              });
            } catch(emailErr) { console.error('[Order] Email error:', emailErr); }
          }

          // SMS de confirmation
          if (input.customerPhone) {
            try {
              const SMS = smsService.default;
              const svc = new SMS({
                provider: (process.env.SMS_PROVIDER as any) || 'mock',
                apiKey: process.env.SMS_API_KEY,
                apiSecret: process.env.SMS_API_SECRET,
                senderName: 'CavallyLivres',
              });
              await svc.sendSMS(
                input.customerPhone,
                `Bonjour ${input.customerName}, votre commande ${orderNumber} a bien été reçue ! Montant: ${input.totalAmount} FCFA. Suivez votre commande sur cavallygroupe.com`
              );
            } catch(smsErr) { console.error('[Order] SMS error:', smsErr); }
          }

          return { success: true, orderId, orderNumber };
        }
        throw new Error("Failed to create order");
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await getOrderById(input.id);
        if (order && order.length > 0) {
          const items = await getOrderItems(order[0].id);
          return { ...order[0], items };
        }
        return null;
      }),
    getByNumber: publicProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input }) => {
        const order = await getOrderByNumber(input.orderNumber);
        if (order) {
          const items = await getOrderItems(order.id);
          return { ...order, items };
        }
        return null;
      }),
    getUserOrders: protectedProcedure.query(async ({ ctx }) => {
      return getUserOrders(ctx.user.id);
    }),
    listAll: protectedProcedure.query(async ({ ctx }) => {
      // Only admin can list all orders
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      return getAllOrders();
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      // Only admin can list all orders
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }
      const orders = await getAllOrders();
      return orders;
    }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          status: z.enum(["pending", "confirmed", "in_transit", "delivered", "cancelled"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Only admin can update order status
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),
    updatePaymentStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          paymentStatus: z.enum(["pending", "completed", "failed", "refunded"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Only admin can update payment status
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await updateOrderPaymentStatus(input.orderId, input.paymentStatus);
        return { success: true };
      }),
    getItems: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return getOrderItemsWithDetails(input.orderId);
      }),
  }),

  // PAYMENTS - Using new paymentsRouter with mobile money support
  // Note: paymentsRouter is already added above in the router definition

  // MOBILE MONEY PAYMENTS
  mobileMoney: mobileMoneyRouter,

  // SMS NOTIFICATIONS
  sms: smsRouter,

  // ORDER MANAGEMENT - Admin actions and notifications
  orderManagement: orderManagementRouter,

  // ORDER TRACKING
  tracking: router({
    getTracking: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return getOrderTracking(input.orderId);
      }),
    
    getHistory: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return getOrderTrackingHistory(input.orderId);
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "confirmed", "preparing", "in_transit", "out_for_delivery", "delivered", "cancelled"]),
        statusLabel: z.string(),
        description: z.string().optional(),
        estimatedDeliveryDate: z.date().optional(),
        location: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        courierName: z.string().optional(),
        courierPhone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can update tracking
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        
        const tracking = await getOrderTracking(input.orderId);
        if (!tracking) {
          // Create new tracking
          return createOrderTracking({
            orderId: input.orderId,
            status: input.status,
            statusLabel: input.statusLabel,
            description: input.description,
            estimatedDeliveryDate: input.estimatedDeliveryDate,
            location: input.location,
            latitude: input.latitude ? input.latitude.toString() : undefined,
            longitude: input.longitude ? input.longitude.toString() : undefined,
            courierName: input.courierName,
            courierPhone: input.courierPhone,
          });
        } else {
          // Update existing tracking
          await updateOrderTrackingStatus(tracking.id, {
            status: input.status,
            statusLabel: input.statusLabel,
            description: input.description,
            estimatedDeliveryDate: input.estimatedDeliveryDate,
            location: input.location,
            latitude: input.latitude ? input.latitude.toString() : undefined,
            longitude: input.longitude ? input.longitude.toString() : undefined,
            courierName: input.courierName,
            courierPhone: input.courierPhone,
          });
          return tracking;
        }
      }),
  }),

  // SUPPLY LISTS (Demandes de Devis)
  supplyLists: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Only admins can view all supply lists');
      }
      return getAllSupplyLists();
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return getSupplyListById(input.id);
    }),
    getByUserId: protectedProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => {
      return getSupplyListsByUserId(input.userId);
    }),
    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Only admins can update supply list status');
        }
        await updateSupplyListStatus(input.id, input.status);
        return { success: true };
      }),
  }),
  messaging: router({
    getOrCreateConversation: protectedProcedure
      .input(z.object({ vendorId: z.number(), orderId: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        return await getOrCreateConversation(ctx.user!.id, input.vendorId, input.orderId);
      }),
    getConversations: protectedProcedure
      .query(async ({ ctx }) => {
        return await getConversations(ctx.user!.id);
      }),
    getConversationById: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return await getConversationById(input.conversationId);
      }),
    sendMessage: protectedProcedure
      .input(z.object({ conversationId: z.number(), content: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        return await sendMessage(input.conversationId, ctx.user!.id, input.content);
      }),
    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number(), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return await getMessages(input.conversationId, input.limit, input.offset);
      }),
    markAsRead: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await markMessagesAsRead(input.conversationId, ctx.user!.id);
        return { success: true };
      }),
    getUnreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUnreadMessageCount(ctx.user!.id);
      }),
  }),
});
export type AppRouter = typeof appRouter;


// Ajouter les procédures de filtrage après la procédure search
// Insérer dans la section products: router({...})
