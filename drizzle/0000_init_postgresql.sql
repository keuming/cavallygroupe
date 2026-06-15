CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."cart_status" AS ENUM('active', 'converted', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."gallery_image_type" AS ENUM('front_cover', 'back_cover', 'spine', 'interior', 'other');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'pending', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."order_tracking_status" AS ENUM('pending', 'confirmed', 'preparing', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('wave', 'moov', 'mtn', 'orange', 'stripe', 'cash');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."school_list_status" AS ENUM('uploaded', 'analyzing', 'analyzed', 'error');--> statement-breakpoint
CREATE TYPE "public"."supply_file_type" AS ENUM('pdf', 'image', 'document', 'text');--> statement-breakpoint
CREATE TYPE "public"."supply_status" AS ENUM('uploaded', 'processing', 'processed', 'error');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('client', 'vendor');--> statement-breakpoint
CREATE TABLE "cartItems" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cartItems_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cartId" integer NOT NULL,
	"userId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "carts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"status" "cart_status" DEFAULT 'active' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0',
	"shippingCost" numeric(10, 2) DEFAULT '0',
	"tax" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) DEFAULT '0',
	"discountCode" varchar(50),
	"discountAmount" numeric(10, 2) DEFAULT '0',
	"expiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"parentCategoryId" integer,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"displayOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conversations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clientId" integer NOT NULL,
	"vendorId" integer NOT NULL,
	"orderId" integer,
	"lastMessageAt" timestamp DEFAULT now() NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliveryAddresses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "deliveryAddresses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"label" varchar(50),
	"fullName" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"postalCode" varchar(20),
	"isDefault" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "discounts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"type" "discount_type" NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"minOrderAmount" numeric(10, 2),
	"maxUses" integer,
	"usedCount" integer DEFAULT 0,
	"expiresAt" timestamp,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "discounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "educationClasses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "educationClasses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"educationLevelId" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"icon" varchar(50),
	"displayOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "educationClasses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "educationLevels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "educationLevels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"displayOrder" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "educationLevels_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "invoiceItems" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invoiceItems_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"invoiceId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invoices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"supplyListId" integer NOT NULL,
	"invoiceNumber" varchar(50) NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"shippingCost" numeric(10, 2) DEFAULT '0',
	"taxAmount" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"pdfUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE("invoiceNumber")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"conversationId" integer NOT NULL,
	"senderId" integer NOT NULL,
	"content" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orderItems_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"orderId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderTracking" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orderTracking_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"orderId" integer NOT NULL,
	"status" "order_tracking_status" DEFAULT 'pending' NOT NULL,
	"statusLabel" varchar(100) NOT NULL,
	"description" text,
	"estimatedDeliveryDate" timestamp,
	"actualDeliveryDate" timestamp,
	"location" varchar(255),
	"latitude" numeric(10, 6),
	"longitude" numeric(10, 6),
	"courierName" varchar(255),
	"courierPhone" varchar(20),
	"trackingNumber" varchar(100),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer,
	"orderNumber" varchar(50) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"paymentMethod" "payment_method" NOT NULL,
	"paymentStatus" "payment_status" DEFAULT 'pending' NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"shippingCost" numeric(10, 2) DEFAULT '0',
	"customerName" varchar(255) NOT NULL,
	"customerPhone" varchar(20) NOT NULL,
	"customerEmail" varchar(320),
	"deliveryAddress" text NOT NULL,
	"deliveryCity" varchar(100) NOT NULL,
	"deliveryPostalCode" varchar(20),
	"stripePaymentIntentId" varchar(255),
	"mobileMoneyTransactionId" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "paymentTransactions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "paymentTransactions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"orderId" integer NOT NULL,
	"paymentMethod" "payment_method" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"transactionId" varchar(255),
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productGalleryImages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "productGalleryImages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"productId" integer NOT NULL,
	"imageUrl" text NOT NULL,
	"altText" varchar(255),
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"imageType" "gallery_image_type" DEFAULT 'other' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"categoryId" integer NOT NULL,
	"educationLevelId" integer,
	"educationClassId" integer,
	"title" varchar(255) NOT NULL,
	"author" varchar(255) NOT NULL,
	"publisher" varchar(255),
	"isbn" varchar(20),
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"coverImageUrl" text,
	"vendorId" integer,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_isbn_unique" UNIQUE("isbn")
);
--> statement-breakpoint
CREATE TABLE "recruitmentApplications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recruitmentApplications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(320) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"educationLevel" varchar(100) NOT NULL,
	"diploma" varchar(255) NOT NULL,
	"yearsOfExperience" integer NOT NULL,
	"diplomaCopyUrl" text,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"rejectionReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reviews_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"productId" integer NOT NULL,
	"userId" integer NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"isVerifiedPurchase" boolean DEFAULT false,
	"helpfulCount" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schoolListAnalysis" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "schoolListAnalysis_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"schoolListId" integer NOT NULL,
	"analysisMethod" varchar(50) NOT NULL,
	"extractedText" text,
	"aiPrompt" text,
	"aiResponse" text,
	"processingTime" integer,
	"confidence" numeric(3, 2),
	"itemsExtracted" integer DEFAULT 0,
	"itemsMatched" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schoolListItems" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "schoolListItems_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"schoolListId" integer NOT NULL,
	"productId" integer,
	"itemName" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit" varchar(50),
	"estimatedPrice" numeric(10, 2),
	"matchedProductId" integer,
	"matchConfidence" numeric(3, 2),
	"isMatched" boolean DEFAULT false,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schoolLists" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "schoolLists_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"schoolName" varchar(255) NOT NULL,
	"className" varchar(100) NOT NULL,
	"studentName" varchar(255) NOT NULL,
	"fileName" varchar(255) NOT NULL,
	"fileUrl" text NOT NULL,
	"fileType" varchar(50) NOT NULL,
	"status" "school_list_status" DEFAULT 'uploaded' NOT NULL,
	"analysisResult" json,
	"totalItems" integer DEFAULT 0,
	"estimatedCost" numeric(10, 2) DEFAULT '0',
	"convertedToOrder" boolean DEFAULT false,
	"orderId" integer,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplyListItems" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "supplyListItems_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"supplyListId" integer NOT NULL,
	"productId" integer,
	"itemName" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"matchConfidence" numeric(3, 2) DEFAULT '0',
	"isMatched" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplyLists" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "supplyLists_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"fileName" varchar(255) NOT NULL,
	"fileUrl" text NOT NULL,
	"fileType" "supply_file_type" NOT NULL,
	"extractedText" text,
	"status" "supply_status" DEFAULT 'uploaded' NOT NULL,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tutors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(320) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"educationLevel" varchar(100) NOT NULL,
	"diploma" varchar(255) NOT NULL,
	"yearsOfExperience" integer NOT NULL,
	"diplomaCopyUrl" text,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"rejectionReason" text,
	"isPublished" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"phone" varchar(20),
	"passwordHash" varchar(255),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"userType" "user_type" DEFAULT 'client' NOT NULL,
	"isApproved" boolean DEFAULT false NOT NULL,
	"defaultAddressId" integer,
	"preferredPaymentMethod" varchar(50),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
