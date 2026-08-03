import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  real,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// User identity/role lives in Clerk (publicMetadata.role). These tables only
// store the app-domain data that used to live in Base44 entities, keyed by
// Clerk's user id (a plain text column — no local users table needed).

export const analysisTypeEnum = pgEnum("analysis_type", ["standard", "drone"]);
export const analysisStatusEnum = pgEnum("analysis_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);
export const criticalRatingEnum = pgEnum("critical_rating", [
  "Low",
  "Moderate",
  "High",
  "Severe",
]);
export const feedbackEnum = pgEnum("feedback_value", ["positive", "negative"]);
export const contactStatusEnum = pgEnum("contact_status", [
  "unread",
  "read",
  "replied",
]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant"]);

// --- Analysis (was the `Analysis` entity) ---
export const analyses = pgTable("analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdBy: text("created_by").notNull(), // Clerk user id — RLS equivalent enforced in query layer
  images: jsonb("images").$type<string[]>().notNull(),
  analysisType: analysisTypeEnum("analysis_type").notNull().default("standard"),
  status: analysisStatusEnum("status").notNull().default("pending"),
  result: jsonb("result"), // full structured LLM response, kept for audit/debug
  plantCommonName: text("plant_common_name"),
  plantScientificName: text("plant_scientific_name"),
  isHealthy: boolean("is_healthy"),
  diseaseName: text("disease_name"),
  criticalRating: criticalRatingEnum("critical_rating"),
  isControlledPlant: boolean("is_controlled_plant").default(false),
  identificationConfidence: real("identification_confidence"),
  healthConfidence: real("health_confidence"),
  controlledConfidence: real("controlled_confidence"),
  feedback: feedbackEnum("feedback"),
  feedbackTimestamp: timestamp("feedback_timestamp", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Conversation (was the `Conversation` entity) ---
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdBy: text("created_by").notNull(),
  title: text("title").notNull().default("New conversation"),
  messages: jsonb("messages").$type<ChatMessage[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Rate limit event log ---
// One row per LLM-costing request. `checkRateLimit` counts rows in the
// current window to enforce a per-user, per-bucket sliding cap. Rows older
// than the longest window can be pruned by any convenient cron; nothing
// in the app depends on their persistence.
export const rateLimitEvents = pgTable("rate_limit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  bucket: text("bucket").notNull(), // "analyze" | "chat"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- ContactMessage (was the `ContactMessage` entity) ---
export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: contactStatusEnum("status").notNull().default("unread"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
