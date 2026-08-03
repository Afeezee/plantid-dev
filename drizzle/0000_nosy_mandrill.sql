CREATE TYPE "public"."analysis_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."analysis_type" AS ENUM('standard', 'drone');--> statement-breakpoint
CREATE TYPE "public"."contact_status" AS ENUM('unread', 'read', 'replied');--> statement-breakpoint
CREATE TYPE "public"."critical_rating" AS ENUM('Low', 'Moderate', 'High', 'Severe');--> statement-breakpoint
CREATE TYPE "public"."feedback_value" AS ENUM('positive', 'negative');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" text NOT NULL,
	"images" jsonb NOT NULL,
	"analysis_type" "analysis_type" DEFAULT 'standard' NOT NULL,
	"status" "analysis_status" DEFAULT 'pending' NOT NULL,
	"result" jsonb,
	"plant_common_name" text,
	"plant_scientific_name" text,
	"is_healthy" boolean,
	"disease_name" text,
	"critical_rating" "critical_rating",
	"is_controlled_plant" boolean DEFAULT false,
	"identification_confidence" real,
	"health_confidence" real,
	"controlled_confidence" real,
	"feedback" "feedback_value",
	"feedback_timestamp" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" "contact_status" DEFAULT 'unread' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" text NOT NULL,
	"title" text DEFAULT 'New conversation' NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rate_limit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bucket" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
