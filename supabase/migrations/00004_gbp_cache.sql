-- GBPアカウント・ロケーション情報のキャッシュテーブル
CREATE TABLE IF NOT EXISTS gbp_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cache_type TEXT NOT NULL, -- 'accounts' or 'locations'
  cache_key TEXT NOT NULL DEFAULT '',
  data JSONB NOT NULL DEFAULT '[]',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, cache_type, cache_key)
);

ALTER TABLE gbp_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on gbp_cache"
  ON gbp_cache FOR ALL USING (true) WITH CHECK (true);
