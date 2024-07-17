CREATE TABLE IF NOT EXISTS "oidc_state_store" (
	"id" uuid PRIMARY KEY NOT NULL,
	"value" varchar(256) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
