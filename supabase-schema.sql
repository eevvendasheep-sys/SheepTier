CREATE SCHEMA IF NOT EXISTS sheeptier;
REVOKE ALL ON SCHEMA sheeptier FROM PUBLIC,anon,authenticated;
SET search_path TO sheeptier,public;
CREATE TABLE IF NOT EXISTS site_owner (
	id bigint PRIMARY KEY NOT NULL,
	user_id text NOT NULL
);

CREATE TABLE IF NOT EXISTS site_state (
	id bigint PRIMARY KEY NOT NULL,
	revision bigint DEFAULT 0 NOT NULL,
	document text NOT NULL
);

CREATE TABLE IF NOT EXISTS community_levels (
	id text PRIMARY KEY NOT NULL,
	title text NOT NULL,
	author text NOT NULL,
	level text NOT NULL,
	created_at bigint NOT NULL,
	publisher_hash text NOT NULL
);

CREATE INDEX IF NOT EXISTS community_levels_created_idx ON community_levels (created_at,id);
CREATE INDEX IF NOT EXISTS community_levels_publisher_idx ON community_levels (publisher_hash,created_at);
CREATE TABLE IF NOT EXISTS community_clips (
	id text PRIMARY KEY NOT NULL,
	title text NOT NULL,
	author text NOT NULL,
	status text DEFAULT 'pending' NOT NULL,
	object_key text NOT NULL,
	mime text NOT NULL,
	size bigint NOT NULL,
	created_at bigint NOT NULL,
	publisher_hash text NOT NULL
);

CREATE INDEX IF NOT EXISTS community_clips_status_idx ON community_clips (status,created_at);
CREATE INDEX IF NOT EXISTS community_clips_publisher_idx ON community_clips (publisher_hash,created_at);
CREATE TABLE IF NOT EXISTS account_limits (
	key text PRIMARY KEY NOT NULL,
	window_start bigint NOT NULL,
	attempts bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS player_accounts (
	id text PRIMARY KEY NOT NULL,
	username text NOT NULL,
	username_key text NOT NULL,
	password_hash text NOT NULL,
	recovery_hash text NOT NULL,
	created_at bigint NOT NULL,
	revision bigint DEFAULT 0 NOT NULL,
	progress text DEFAULT '{}' NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS player_accounts_username_key_unique ON player_accounts (username_key);
CREATE TABLE IF NOT EXISTS player_sessions (
	token_hash text PRIMARY KEY NOT NULL,
	account_id text NOT NULL,
	expires_at bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS player_sessions_account_idx ON player_sessions (account_id);
CREATE INDEX IF NOT EXISTS player_sessions_expiry_idx ON player_sessions (expires_at);
ALTER TABLE community_clips ADD COLUMN IF NOT EXISTS upload_token_hash text;
INSERT INTO site_owner(id,user_id) VALUES(1,'cloudflare-owner') ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION sheeptier.protect_owner() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN RAISE EXCEPTION 'Owner is immutable'; END $$;
DROP TRIGGER IF EXISTS owner_immutable ON site_owner;
CREATE TRIGGER owner_immutable BEFORE UPDATE OR DELETE ON site_owner FOR EACH ROW EXECUTE FUNCTION sheeptier.protect_owner();
ALTER TABLE site_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE site_state FROM PUBLIC,anon,authenticated;
ALTER TABLE site_owner ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE site_owner FROM PUBLIC,anon,authenticated;
ALTER TABLE community_levels ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE community_levels FROM PUBLIC,anon,authenticated;
ALTER TABLE community_clips ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE community_clips FROM PUBLIC,anon,authenticated;
ALTER TABLE account_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE account_limits FROM PUBLIC,anon,authenticated;
ALTER TABLE player_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE player_accounts FROM PUBLIC,anon,authenticated;
ALTER TABLE player_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE player_sessions FROM PUBLIC,anon,authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA sheeptier FROM PUBLIC,anon,authenticated;
