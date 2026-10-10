import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
export const siteState = sqliteTable("site_state", {
  id: integer("id").primaryKey(),
  revision: integer("revision").notNull().default(0),
  document: text("document").notNull(),
});
export const siteOwner = sqliteTable("site_owner", {
  id: integer("id").primaryKey(), userId: text("user_id").notNull(),
});
export const communityLevels = sqliteTable("community_levels", {
  id: text("id").primaryKey(), title: text("title").notNull(), author: text("author").notNull(),
  level: text("level").notNull(), createdAt: integer("created_at").notNull(), publisherHash: text("publisher_hash").notNull(),
}, table => [index("community_levels_created_idx").on(table.createdAt, table.id), index("community_levels_publisher_idx").on(table.publisherHash, table.createdAt)]);
export const communityClips = sqliteTable("community_clips", {
  id:text("id").primaryKey(), title:text("title").notNull(),author:text("author").notNull(),
  status:text("status").notNull().default("pending"), objectKey:text("object_key").notNull(),
  mime:text("mime").notNull(),size:integer("size").notNull(), createdAt:integer("created_at").notNull(),
  publisherHash:text("publisher_hash").notNull(),
}, t=>[index("community_clips_status_idx").on(t.status,t.createdAt),index("community_clips_publisher_idx").on(t.publisherHash,t.createdAt)]);
export const playerAccounts=sqliteTable('player_accounts',{
 id:text('id').primaryKey(),username:text('username').notNull(),usernameKey:text('username_key').notNull().unique(),passwordHash:text('password_hash').notNull(),recoveryHash:text('recovery_hash').notNull(),createdAt:integer('created_at').notNull(),revision:integer('revision').notNull().default(0),progress:text('progress').notNull().default('{}')
});
export const playerSessions=sqliteTable('player_sessions',{tokenHash:text('token_hash').primaryKey(),accountId:text('account_id').notNull(),expiresAt:integer('expires_at').notNull()},t=>[index('player_sessions_account_idx').on(t.accountId),index('player_sessions_expiry_idx').on(t.expiresAt)]);
export const accountLimits=sqliteTable('account_limits',{key:text('key').primaryKey(),windowStart:integer('window_start').notNull(),attempts:integer('attempts').notNull()});
