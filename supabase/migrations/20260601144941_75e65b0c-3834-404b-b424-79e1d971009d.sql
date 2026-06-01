
CREATE TABLE public.search_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.interaction_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  product_id uuid,
  product_title text,
  category text,
  platform text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.search_events TO anon, authenticated;
GRANT ALL ON public.search_events TO service_role;
GRANT SELECT, INSERT ON public.interaction_events TO anon, authenticated;
GRANT ALL ON public.interaction_events TO service_role;

ALTER TABLE public.search_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert search events" ON public.search_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(query) > 0 AND length(query) <= 200);

CREATE POLICY "Admins can view search events" ON public.search_events
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert interaction events" ON public.interaction_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(event_type) > 0 AND length(event_type) <= 50);

CREATE POLICY "Admins can view interaction events" ON public.interaction_events
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_search_events_created ON public.search_events (created_at DESC);
CREATE INDEX idx_interaction_events_created ON public.interaction_events (created_at DESC);
CREATE INDEX idx_interaction_events_type ON public.interaction_events (event_type);
