import { supabase } from "@/integrations/supabase/client";

export function trackSearch(query: string, category?: string) {
  const q = query.trim();
  if (!q) return;
  supabase
    .from("search_events")
    .insert({ query: q.slice(0, 200), category: category ?? null })
    .then(() => {});
}

export type InteractionType =
  | "product_view"
  | "view_deal_click"
  | "share_click"
  | "category_select"
  | "explore_click"
  | "feedback_submit"
  | "suggestion_click"
  | "suggestion_impression";

export function trackInteraction(
  event_type: InteractionType,
  payload?: {
    product_id?: string;
    product_title?: string;
    category?: string;
    platform?: string;
    meta?: Record<string, unknown>;
  },
) {
  supabase
    .from("interaction_events")
    .insert({
      event_type,
      product_id: payload?.product_id ?? null,
      product_title: payload?.product_title?.slice(0, 200) ?? null,
      category: payload?.category ?? null,
      platform: payload?.platform ?? null,
      meta: (payload?.meta as never) ?? null,
    })
    .then(() => {});
}
