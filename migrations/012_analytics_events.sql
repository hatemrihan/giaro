-- Analytics events table for funnel tracking
-- Designed for high-volume append-only writes with efficient read queries

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL,
    session_id VARCHAR(64),
    event_name VARCHAR(50) NOT NULL,
    url_path TEXT,
    referrer TEXT,
    locale VARCHAR(5) DEFAULT 'ar',
    payload JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_event_id UNIQUE (event_id)
);

-- Indexes optimized for funnel queries
CREATE INDEX IF NOT EXISTS idx_events_name_created ON analytics_events (event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events (session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events USING BRIN (created_at);

-- RLS: Only server-side inserts (via service role key)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
