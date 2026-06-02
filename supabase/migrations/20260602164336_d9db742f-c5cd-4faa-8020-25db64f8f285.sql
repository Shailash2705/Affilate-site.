CREATE TABLE public.suggested_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  query TEXT NOT NULL,
  category TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.suggested_queries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suggested_queries TO authenticated;
GRANT ALL ON public.suggested_queries TO service_role;

ALTER TABLE public.suggested_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled suggestions"
ON public.suggested_queries FOR SELECT
USING (enabled = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert suggestions"
ON public.suggested_queries FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update suggestions"
ON public.suggested_queries FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete suggestions"
ON public.suggested_queries FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_suggested_queries_updated_at
BEFORE UPDATE ON public.suggested_queries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Allow tracking suggestion clicks (extend interaction_events constraint already allows any event_type)
-- No schema change needed; we'll use event_type = 'suggestion_click'