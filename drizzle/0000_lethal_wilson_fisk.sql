CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`user_id` text NOT NULL,
	`org_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
