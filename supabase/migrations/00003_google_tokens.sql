-- ============================================================
-- Google OAuth tokens for GBP API access
-- Stored per organization (one Google account per agency)
-- ============================================================

CREATE TABLE google_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  google_email    TEXT NOT NULL,
  access_token    TEXT NOT NULL,
  refresh_token   TEXT NOT NULL,
  token_expiry    TIMESTAMPTZ NOT NULL,
  scopes          TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage google tokens"
  ON google_tokens FOR ALL
  USING (
    org_id = (SELECT org_id FROM users WHERE auth_uid = auth.uid() LIMIT 1)
    AND is_admin_role()
  );

CREATE TRIGGER set_updated_at_google_tokens
  BEFORE UPDATE ON google_tokens FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add gbp_account_id to locations for linking
ALTER TABLE locations ADD COLUMN IF NOT EXISTS gbp_account_id TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS gbp_location_name TEXT;
