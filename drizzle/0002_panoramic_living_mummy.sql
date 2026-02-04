CREATE TYPE "public"."invite_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "public"."ping_status" AS ENUM('pending', 'active', 'completed', 'expired');--> statement-breakpoint
CREATE TABLE "ping_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"ping_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "invite_status" DEFAULT 'pending' NOT NULL,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pings" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"message" text,
	"game" text,
	"scheduled_at" timestamp,
	"scheduled_end_at" timestamp,
	"status" "ping_status" DEFAULT 'pending' NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ping_invites" ADD CONSTRAINT "ping_invites_ping_id_pings_id_fk" FOREIGN KEY ("ping_id") REFERENCES "public"."pings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ping_invites" ADD CONSTRAINT "ping_invites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pings" ADD CONSTRAINT "pings_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;