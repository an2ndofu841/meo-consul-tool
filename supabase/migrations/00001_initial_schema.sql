-- ============================================================
-- MEO Consul Tool - Initial Schema Migration
-- ============================================================

-- ==== ENUM TYPES ====

CREATE TYPE user_role AS ENUM (
  'agency_admin',
  'operator',
  'client_viewer',
  'client_operator'
);

CREATE TYPE task_status AS ENUM (
  'draft',
  'pending_approval',
  'approved',
  'in_progress',
  'completed',
  'reviewing'
);

CREATE TYPE reply_status AS ENUM (
  'pending',
  'draft',
  'approved',
  'published'
);

CREATE TYPE approval_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE asset_status AS ENUM (
  'requested',
  'uploaded',
  'approved',
  'rejected'
);

CREATE TYPE notification_type AS ENUM (
  'rank_drop',
  'review_negative',
  'competitor_change',
  'dangerous_edit',
  'approval_required',
  'task_assigned',
  'asset_requested'
);


-- ==== TABLES ====

-- Organizations (consulting agencies)
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users (all roles)
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid    UUID NOT NULL UNIQUE,  -- references auth.users(id)
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id   UUID,  -- set for client roles, FK added after clients table
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'client_viewer',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_auth_uid ON users(auth_uid);
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_role ON users(role);

-- Clients (customer companies)
CREATE TABLE clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_name  TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_org_id ON clients(org_id);

-- Add FK from users.client_id -> clients.id
ALTER TABLE users
  ADD CONSTRAINT fk_users_client_id
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Locations (stores)
CREATE TABLE locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  address         TEXT NOT NULL,
  gbp_place_id    TEXT,
  phone           TEXT,
  category        TEXT,
  attributes      JSONB DEFAULT '{}',
  business_hours  JSONB DEFAULT '{}',
  target_kpi      JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_locations_client_id ON locations(client_id);

-- User-Location access mapping
CREATE TABLE user_locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, location_id)
);

-- Keywords
CREATE TABLE keywords (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  keyword     TEXT NOT NULL,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_keywords_location_id ON keywords(location_id);

-- Rank Observations (daily rank per keyword per grid point)
CREATE TABLE rank_observations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  keyword_id    UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
  observed_date DATE NOT NULL,
  grid_point    TEXT,  -- e.g. "35.6812,139.7671" or label
  rank          INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rank_obs_location ON rank_observations(location_id);
CREATE INDEX idx_rank_obs_keyword ON rank_observations(keyword_id);
CREATE INDEX idx_rank_obs_date ON rank_observations(observed_date);

-- Competitors
CREATE TABLE competitors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id   UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  gbp_place_id  TEXT,
  category      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_competitors_location_id ON competitors(location_id);

-- Competitor Observations (detected changes)
CREATE TABLE competitor_observations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  observed_date DATE NOT NULL,
  field_name    TEXT NOT NULL,
  old_value     TEXT,
  new_value     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comp_obs_competitor ON competitor_observations(competitor_id);

-- Reviews
CREATE TABLE reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id       UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  google_review_id  TEXT,
  author            TEXT NOT NULL,
  rating            INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body              TEXT,
  theme             TEXT,
  reply_status      reply_status NOT NULL DEFAULT 'pending',
  reviewed_at       TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_location_id ON reviews(location_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Review Reply Drafts
CREATE TABLE review_reply_drafts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id),
  body        TEXT NOT NULL,
  status      approval_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Task Templates
CREATE TABLE task_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  industry        TEXT,
  description     TEXT,
  default_purpose TEXT,
  default_impact  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks (施策)
CREATE TABLE tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id       UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  assignee_id       UUID REFERENCES users(id),
  created_by_id     UUID NOT NULL REFERENCES users(id),
  template_id       UUID REFERENCES task_templates(id),
  title             TEXT NOT NULL,
  description       TEXT,
  purpose           TEXT,
  expected_impact   TEXT,
  status            task_status NOT NULL DEFAULT 'draft',
  due_date          DATE,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_location_id ON tasks(location_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Approvals
CREATE TABLE approvals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  status      approval_status NOT NULL DEFAULT 'pending',
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_approvals_task_id ON approvals(task_id);

-- Reports
CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  generated_by_id UUID NOT NULL REFERENCES users(id),
  report_month    DATE NOT NULL,  -- first day of month
  summary         TEXT,
  pdf_url         TEXT,
  share_url       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_location_id ON reports(location_id);

-- Audit Logs
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  user_id     UUID NOT NULL REFERENCES users(id),
  action      TEXT NOT NULL,  -- e.g. 'create', 'update', 'delete'
  target_type TEXT NOT NULL,  -- e.g. 'location', 'task', 'review_reply'
  target_id   TEXT NOT NULL,
  old_value   JSONB,
  new_value   JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_location ON audit_logs(location_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Assets (素材)
CREATE TABLE assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  requested_by_id UUID NOT NULL REFERENCES users(id),
  uploaded_by_id  UUID REFERENCES users(id),
  title           TEXT NOT NULL,
  description     TEXT,
  file_url        TEXT,
  status          asset_status NOT NULL DEFAULT 'requested',
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assets_location_id ON assets(location_id);

-- Notifications
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  link        TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE NOT is_read;


-- ==== ROW LEVEL SECURITY ====

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reply_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's app user record
CREATE OR REPLACE FUNCTION get_current_app_user()
RETURNS users AS $$
  SELECT * FROM users WHERE auth_uid = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if current user is admin role
CREATE OR REPLACE FUNCTION is_admin_role()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE auth_uid = auth.uid()
    AND role IN ('agency_admin', 'operator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations: users can see their own org
CREATE POLICY "Users can view own org"
  ON organizations FOR SELECT
  USING (id = (SELECT org_id FROM users WHERE auth_uid = auth.uid() LIMIT 1));

-- Users: can see users in same org
CREATE POLICY "Users can view org members"
  ON users FOR SELECT
  USING (org_id = (SELECT org_id FROM users u WHERE u.auth_uid = auth.uid() LIMIT 1));

-- Users: admin can manage
CREATE POLICY "Admin can manage users"
  ON users FOR ALL
  USING (is_admin_role() AND org_id = (SELECT org_id FROM users u WHERE u.auth_uid = auth.uid() LIMIT 1));

-- Clients: admin/operator see all in org; client users see own client
CREATE POLICY "View clients"
  ON clients FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE auth_uid = auth.uid() LIMIT 1)
    AND (
      is_admin_role()
      OR id = (SELECT client_id FROM users WHERE auth_uid = auth.uid() LIMIT 1)
    )
  );

-- Locations: access based on org + user_locations mapping
CREATE POLICY "View locations"
  ON locations FOR SELECT
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN users u ON u.org_id = c.org_id
      WHERE u.auth_uid = auth.uid()
      AND (
        u.role IN ('agency_admin', 'operator')
        OR (u.client_id = c.id)
      )
    )
  );

-- Keywords: same as locations
CREATE POLICY "View keywords"
  ON keywords FOR SELECT
  USING (
    location_id IN (
      SELECT l.id FROM locations l
      JOIN clients c ON l.client_id = c.id
      JOIN users u ON u.org_id = c.org_id
      WHERE u.auth_uid = auth.uid()
      AND (u.role IN ('agency_admin', 'operator') OR u.client_id = c.id)
    )
  );

-- Rank observations: same scope
CREATE POLICY "View rank observations"
  ON rank_observations FOR SELECT
  USING (
    location_id IN (
      SELECT l.id FROM locations l
      JOIN clients c ON l.client_id = c.id
      JOIN users u ON u.org_id = c.org_id
      WHERE u.auth_uid = auth.uid()
      AND (u.role IN ('agency_admin', 'operator') OR u.client_id = c.id)
    )
  );

-- Reviews: same scope
CREATE POLICY "View reviews"
  ON reviews FOR SELECT
  USING (
    location_id IN (
      SELECT l.id FROM locations l
      JOIN clients c ON l.client_id = c.id
      JOIN users u ON u.org_id = c.org_id
      WHERE u.auth_uid = auth.uid()
      AND (u.role IN ('agency_admin', 'operator') OR u.client_id = c.id)
    )
  );

-- Tasks: same scope
CREATE POLICY "View tasks"
  ON tasks FOR SELECT
  USING (
    location_id IN (
      SELECT l.id FROM locations l
      JOIN clients c ON l.client_id = c.id
      JOIN users u ON u.org_id = c.org_id
      WHERE u.auth_uid = auth.uid()
      AND (u.role IN ('agency_admin', 'operator') OR u.client_id = c.id)
    )
  );

-- Admin-only write policies for tasks
CREATE POLICY "Admin can manage tasks"
  ON tasks FOR ALL
  USING (is_admin_role());

-- Competitors: admin/operator only
CREATE POLICY "View competitors"
  ON competitors FOR SELECT
  USING (
    location_id IN (
      SELECT l.id FROM locations l
      JOIN clients c ON l.client_id = c.id
      JOIN users u ON u.org_id = c.org_id
      WHERE u.auth_uid = auth.uid()
      AND u.role IN ('agency_admin', 'operator')
    )
  );

-- Audit logs: admin only
CREATE POLICY "Admin can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin_role());

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Notifications: user sees own
CREATE POLICY "User sees own notifications"
  ON notifications FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth_uid = auth.uid() LIMIT 1));

CREATE POLICY "User manages own notifications"
  ON notifications FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth_uid = auth.uid() LIMIT 1));

-- Assets: scoped by location
CREATE POLICY "View assets"
  ON assets FOR SELECT
  USING (
    location_id IN (
      SELECT l.id FROM locations l
      JOIN clients c ON l.client_id = c.id
      JOIN users u ON u.org_id = c.org_id
      WHERE u.auth_uid = auth.uid()
      AND (u.role IN ('agency_admin', 'operator') OR u.client_id = c.id)
    )
  );

-- Reports: scoped by location
CREATE POLICY "View reports"
  ON reports FOR SELECT
  USING (
    location_id IN (
      SELECT l.id FROM locations l
      JOIN clients c ON l.client_id = c.id
      JOIN users u ON u.org_id = c.org_id
      WHERE u.auth_uid = auth.uid()
      AND (u.role IN ('agency_admin', 'operator') OR u.client_id = c.id)
    )
  );

-- Approvals: scoped through tasks
CREATE POLICY "View approvals"
  ON approvals FOR SELECT
  USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN locations l ON t.location_id = l.id
      JOIN clients c ON l.client_id = c.id
      JOIN users u ON u.org_id = c.org_id
      WHERE u.auth_uid = auth.uid()
      AND (u.role IN ('agency_admin', 'operator') OR u.client_id = c.id)
    )
  );


-- ==== UPDATED_AT TRIGGER ====

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON organizations FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON clients FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_locations
  BEFORE UPDATE ON locations FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_tasks
  BEFORE UPDATE ON tasks FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_approvals
  BEFORE UPDATE ON approvals FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_assets
  BEFORE UPDATE ON assets FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_review_reply_drafts
  BEFORE UPDATE ON review_reply_drafts FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
