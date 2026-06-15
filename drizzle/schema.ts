import { pgTable, integer, varchar, text, timestamp, boolean, json, numeric, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const userTypeEnum = pgEnum("user_type", ["client", "vendor"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "in_transit", "delivered", "cancelled"]);
export const paymentMethodEnum = pgEnum("payment_method", ["wave", "moov", "mtn", "orange", "stripe", "cash"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);
export const orderTrackingStatusEnum = pgEnum("order_tracking_status", ["pending", "confirmed", "preparing", "in_transit", "out_for_delivery", "delivered", "cancelled"]);
export const supplyFileTypeEnum = pgEnum("supply_file_type", ["pdf", "image", "document", "text"]);
export const supplyStatusEnum = pgEnum("supply_status", ["uploaded", "processing", "processed", "error"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "pending", "paid", "cancelled"]);
export const galleryImageTypeEnum = pgEnum("gallery_image_type", ["front_cover", "back_cover", "spine", "interior", "other"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected"]);
export const cartStatusEnum = pgEnum("cart_status", ["active", "converted", "abandoned"]);
export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed"]);
export const schoolListStatusEnum = pgEnum("school_list_status", ["uploaded", "analyzing", "analyzed", "error"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  userType: userTypeEnum("userType").default("client").notNull(),
  isApproved: boolean("isApproved").default(false).notNull(),
  defaultAddressId: integer("defaultAddressId"),
  preferredPaymentMethod: varchar("preferredPaymentMethod", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserType = "client" | "vendor";

export const deliveryAddresses = pgTable("deliveryAddresses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  label: varchar("label", { length: 50 }),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  postalCode: varchar("postalCode", { length: 20 }),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type DeliveryAddress = typeof deliveryAddresses.$inferSelect;
export type InsertDeliveryAddress = typeof deliveryAddresses.$inferInsert;

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  parentCategoryId: integer("parentCategoryId"),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  displayOrder: integer("displayOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const categoryRelations = relations(categories, ({ one, many }) => ({
  parentCategory: one(categories, {
    fields: [categories.parentCategoryId],
    references: [categories.id],
  }),
  subCategories: many(categories),
}));

export const educationLevels = pgTable("educationLevels", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  displayOrder: integer("displayOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type EducationLevel = typeof educationLevels.$inferSelect;
export type InsertEducationLevel = typeof educationLevels.$inferInsert;

export const educationClasses = pgTable("educationClasses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  educationLevelId: integer("educationLevelId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }),
  displayOrder: integer("displayOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type EducationClass = typeof educationClasses.$inferSelect;
export type InsertEducationClass = typeof educationClasses.$inferInsert;

export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  categoryId: integer("categoryId").notNull(),
  educationLevelId: integer("educationLevelId"),
  educationClassId: integer("educationClassId"),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  publisher: varchar("publisher", { length: 255 }),
  isbn: varchar("isbn", { length: 20 }).unique(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  coverImageUrl: text("coverImageUrl"),
  vendorId: integer("vendorId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const carts = pgTable("carts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  status: cartStatusEnum("status").default("active").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).default("0"),
  shippingCost: numeric("shippingCost", { precision: 10, scale: 2 }).default("0"),
  tax: numeric("tax", { precision: 10, scale: 2 }).default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).default("0"),
  discountCode: varchar("discountCode", { length: 50 }),
  discountAmount: numeric("discountAmount", { precision: 10, scale: 2 }).default("0"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Cart = typeof carts.$inferSelect;
export type InsertCart = typeof carts.$inferInsert;

export const cartItems = pgTable("cartItems", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cartId: integer("cartId").notNull(),
  userId: integer("userId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId"),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  status: orderStatusEnum("status").default("pending").notNull(),
  paymentMethod: paymentMethodEnum("paymentMethod").notNull(),
  paymentStatus: paymentStatusEnum("paymentStatus").default("pending").notNull(),
  totalAmount: numeric("totalAmount", { precision: 10, scale: 2 }).notNull(),
  shippingCost: numeric("shippingCost", { precision: 10, scale: 2 }).default("0"),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  deliveryAddress: text("deliveryAddress").notNull(),
  deliveryCity: varchar("deliveryCity", { length: 100 }).notNull(),
  deliveryPostalCode: varchar("deliveryPostalCode", { length: 20 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  mobileMoneyTransactionId: varchar("mobileMoneyTransactionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const orderItems = pgTable("orderItems", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export const paymentTransactions = pgTable("paymentTransactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("orderId").notNull(),
  paymentMethod: paymentMethodEnum("paymentMethod").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

export const orderTracking = pgTable("orderTracking", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("orderId").notNull(),
  status: orderTrackingStatusEnum("status").default("pending").notNull(),
  statusLabel: varchar("statusLabel", { length: 100 }).notNull(),
  description: text("description"),
  estimatedDeliveryDate: timestamp("estimatedDeliveryDate"),
  actualDeliveryDate: timestamp("actualDeliveryDate"),
  location: varchar("location", { length: 255 }),
  latitude: numeric("latitude", { precision: 10, scale: 6 }),
  longitude: numeric("longitude", { precision: 10, scale: 6 }),
  courierName: varchar("courierName", { length: 255 }),
  courierPhone: varchar("courierPhone", { length: 20 }),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type OrderTracking = typeof orderTracking.$inferSelect;
export type InsertOrderTracking = typeof orderTracking.$inferInsert;

export const supplyLists = pgTable("supplyLists", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileType: supplyFileTypeEnum("fileType").notNull(),
  extractedText: text("extractedText"),
  status: supplyStatusEnum("status").default("uploaded").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SupplyList = typeof supplyLists.$inferSelect;
export type InsertSupplyList = typeof supplyLists.$inferInsert;

export const supplyListItems = pgTable("supplyListItems", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  supplyListId: integer("supplyListId").notNull(),
  productId: integer("productId"),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  matchConfidence: numeric("matchConfidence", { precision: 3, scale: 2 }).default("0"),
  isMatched: boolean("isMatched").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupplyListItem = typeof supplyListItems.$inferSelect;
export type InsertSupplyListItem = typeof supplyListItems.$inferInsert;

export const invoices = pgTable("invoices", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  supplyListId: integer("supplyListId").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  totalAmount: numeric("totalAmount", { precision: 10, scale: 2 }).notNull(),
  shippingCost: numeric("shippingCost", { precision: 10, scale: 2 }).default("0"),
  taxAmount: numeric("taxAmount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  pdfUrl: text("pdfUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export const invoiceItems = pgTable("invoiceItems", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  invoiceId: integer("invoiceId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

export const reviews = pgTable("reviews", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("productId").notNull(),
  userId: integer("userId").notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isVerifiedPurchase: boolean("isVerifiedPurchase").default(false),
  helpfulCount: integer("helpfulCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export const productGalleryImages = pgTable("productGalleryImages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("productId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  altText: varchar("altText", { length: 255 }),
  displayOrder: integer("displayOrder").notNull().default(0),
  imageType: galleryImageTypeEnum("imageType").default("other").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ProductGalleryImage = typeof productGalleryImages.$inferSelect;
export type InsertProductGalleryImage = typeof productGalleryImages.$inferInsert;

export const recruitmentApplications = pgTable("recruitmentApplications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  educationLevel: varchar("educationLevel", { length: 100 }).notNull(),
  diploma: varchar("diploma", { length: 255 }).notNull(),
  yearsOfExperience: integer("yearsOfExperience").notNull(),
  diplomaCopyUrl: text("diplomaCopyUrl"),
  status: applicationStatusEnum("status").default("pending").notNull(),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type RecruitmentApplication = typeof recruitmentApplications.$inferSelect;
export type InsertRecruitmentApplication = typeof recruitmentApplications.$inferInsert;

export const tutors = pgTable("tutors", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  educationLevel: varchar("educationLevel", { length: 100 }).notNull(),
  diploma: varchar("diploma", { length: 255 }).notNull(),
  yearsOfExperience: integer("yearsOfExperience").notNull(),
  diplomaCopyUrl: text("diplomaCopyUrl"),
  status: applicationStatusEnum("status").default("pending").notNull(),
  rejectionReason: text("rejectionReason"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Tutor = typeof tutors.$inferSelect;
export type InsertTutor = typeof tutors.$inferInsert;

export const discounts = pgTable("discounts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  type: discountTypeEnum("type").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: numeric("minOrderAmount", { precision: 10, scale: 2 }),
  maxUses: integer("maxUses"),
  usedCount: integer("usedCount").default(0),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Discount = typeof discounts.$inferSelect;
export type InsertDiscount = typeof discounts.$inferInsert;

export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  vendorId: integer("vendorId").notNull(),
  orderId: integer("orderId"),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  conversationId: integer("conversationId").notNull(),
  senderId: integer("senderId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export const schoolLists = pgTable("schoolLists", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  schoolName: varchar("schoolName", { length: 255 }).notNull(),
  className: varchar("className", { length: 100 }).notNull(),
  studentName: varchar("studentName", { length: 255 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(),
  status: schoolListStatusEnum("status").default("uploaded").notNull(),
  analysisResult: json("analysisResult"),
  totalItems: integer("totalItems").default(0),
  estimatedCost: numeric("estimatedCost", { precision: 10, scale: 2 }).default("0"),
  convertedToOrder: boolean("convertedToOrder").default(false),
  orderId: integer("orderId"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SchoolList = typeof schoolLists.$inferSelect;
export type InsertSchoolList = typeof schoolLists.$inferInsert;

export const schoolListItems = pgTable("schoolListItems", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  schoolListId: integer("schoolListId").notNull(),
  productId: integer("productId"),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unit: varchar("unit", { length: 50 }),
  estimatedPrice: numeric("estimatedPrice", { precision: 10, scale: 2 }),
  matchedProductId: integer("matchedProductId"),
  matchConfidence: numeric("matchConfidence", { precision: 3, scale: 2 }),
  isMatched: boolean("isMatched").default(false),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SchoolListItem = typeof schoolListItems.$inferSelect;
export type InsertSchoolListItem = typeof schoolListItems.$inferInsert;

export const schoolListAnalysis = pgTable("schoolListAnalysis", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  schoolListId: integer("schoolListId").notNull(),
  analysisMethod: varchar("analysisMethod", { length: 50 }).notNull(),
  extractedText: text("extractedText"),
  aiPrompt: text("aiPrompt"),
  aiResponse: text("aiResponse"),
  processingTime: integer("processingTime"),
  confidence: numeric("confidence", { precision: 3, scale: 2 }),
  itemsExtracted: integer("itemsExtracted").default(0),
  itemsMatched: integer("itemsMatched").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SchoolListAnalysis = typeof schoolListAnalysis.$inferSelect;
export type InsertSchoolListAnalysis = typeof schoolListAnalysis.$inferInsert;

export const schoolListRelations = relations(schoolLists, ({ one, many }) => ({
  user: one(users, {
    fields: [schoolLists.userId],
    references: [users.id],
  }),
  items: many(schoolListItems),
  analysis: one(schoolListAnalysis, {
    fields: [schoolLists.id],
    references: [schoolListAnalysis.schoolListId],
  }),
  order: one(orders, {
    fields: [schoolLists.orderId],
    references: [orders.id],
  }),
}));

export const schoolListItemRelations = relations(schoolListItems, ({ one }) => ({
  schoolList: one(schoolLists, {
    fields: [schoolListItems.schoolListId],
    references: [schoolLists.id],
  }),
  product: one(products, {
    fields: [schoolListItems.matchedProductId],
    references: [products.id],
  }),
}));
