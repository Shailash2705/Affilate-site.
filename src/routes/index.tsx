import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, ShieldCheck, Send, Tag, LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ProductCard, type Product } from "@/components/product-card";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { feedbackSchema } from "@/lib/validators";
import { trackSearch, trackInteraction } from "@/lib/analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Finds — Curated affiliate picks" },
      {
        name: "description",
        content:
          "Discover handpicked, premium affiliate products from Amazon, Flipkart, Myntra and more. Minimal, fast, beautifully designed.",
      },
      { property: "og:title", content: "Smart Finds — Curated affiliate picks" },
      { property: "og:description", content: "Premium affiliate product showcase." },
    ],
  }),
  component: Home,
});

const ALL = "all";

function Home() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [suggestions, setSuggestions] = useState<
    { id: string; label: string; query: string; category: string | null }[]
  >([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Failed to load products");
        setProducts((data as Product[]) ?? []);
      });

    supabase
      .from("suggested_queries")
      .select("id,label,query,category")
      .eq("enabled", true)
      .order("position", { ascending: true })
      .limit(12)
      .then(({ data }) => setSuggestions(data ?? []));
  }, []);

  // Debounced search tracking
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const t = window.setTimeout(() => {
      trackSearch(q, category === ALL ? undefined : category);
    }, 800);
    return () => window.clearTimeout(t);
  }, [query, category]);

  const categories = useMemo(() => {
    if (!products) return [];
    const map = new Map<string, number>();
    for (const p of products) {
      const c = (p.category || "general").toLowerCase();
      map.set(c, (map.get(c) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return null;
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== ALL && p.category.toLowerCase() !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.platform.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [products, query, category]);

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-center" />
      <SiteHeader />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 md:pt-24 pb-12 text-center fade-up">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs mb-6">
          <Sparkles className="h-3.5 w-3.5 text-[var(--brand-3)]" />
          Handpicked daily
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Premium picks,
          <br />
          <span className="bg-gradient-to-r from-[var(--brand-1)] via-[var(--brand-2)] to-[var(--brand-3)] bg-clip-text text-transparent">
            beautifully curated.
          </span>
        </h1>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
          A minimal showcase of affiliate products from Amazon, Flipkart, Myntra and more.
          Browse, search and shop with confidence.
        </p>

        <div className="mt-8 max-w-xl mx-auto glass-strong rounded-full p-2 flex items-center gap-2">
          <Search className="h-5 w-5 ml-3 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="border-0 bg-transparent focus-visible:ring-0 shadow-none flex-1 min-w-0"
          />
          <Button
            onClick={() => {
              trackInteraction("explore_click");
              document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-full bg-foreground text-background hover:opacity-90 shrink-0"
          >
            Explore
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Try:</span>
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setQuery(s.query);
                  if (s.category) setCategory(s.category.toLowerCase());
                  trackInteraction("suggestion_click", {
                    category: s.category ?? undefined,
                    meta: { suggestion_id: s.id, label: s.label, query: s.query },
                  });
                  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="glass rounded-full px-3 py-1.5 text-xs hover:bg-white/60 dark:hover:bg-white/10 transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure</span>
          <span>•</span>
          <span>No ads, no clutter</span>
          <span>•</span>
          <span>Updated daily</span>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-6xl mx-auto px-4 py-8 scroll-mt-24">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Tag className="h-6 w-6 text-[var(--brand-3)]" /> Browse by category
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Find exactly what you're looking for.
            </p>
          </div>
        </div>

        {!products && (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full bg-white/40" />
            ))}
          </div>
        )}

        {products && (
          <div className="flex flex-wrap gap-2">
            <CategoryChip
              active={category === ALL}
              onClick={() => setCategory(ALL)}
              label="All"
              count={products.length}
              icon={<LayoutGrid className="h-3.5 w-3.5" />}
            />
            {categories.map((c) => (
              <CategoryChip
                key={c.name}
                active={category === c.name}
                onClick={() => {
                  setCategory(c.name);
                  trackInteraction("category_select", { category: c.name });
                  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                }}
                label={c.name}
                count={c.count}
              />
            ))}
          </div>
        )}
      </section>

      {/* Products */}
      <section id="products" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              {category === ALL ? "Latest Picks" : <span className="capitalize">{category}</span>}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {filtered ? `${filtered.length} product${filtered.length === 1 ? "" : "s"}` : "Loading..."}
            </p>
          </div>
          {category !== ALL && (
            <Button variant="ghost" onClick={() => setCategory(ALL)} className="rounded-full">
              Clear filter
            </Button>
          )}
        </div>

        {!filtered && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[380px] rounded-3xl bg-white/40" />
            ))}
          </div>
        )}

        {filtered && filtered.length === 0 && (
          <div className="glass rounded-3xl p-12 text-center">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-muted-foreground text-sm mt-2">
              {query || category !== ALL
                ? "Try a different search or category."
                : "Sign in as admin to add the first product."}
            </p>
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Feedback */}
      <FeedbackSection />

      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm capitalize transition border ${
        active
          ? "bg-foreground text-background border-foreground"
          : "glass border-white/50 hover:bg-white/60 dark:hover:bg-white/10"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span
        className={`text-xs rounded-full px-1.5 py-0.5 ${
          active ? "bg-background/20" : "bg-foreground/10"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function FeedbackSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = feedbackSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("feedback").insert(parsed.data);
    setLoading(false);
    if (error) return toast.error("Failed to send. Please try again.");
    trackInteraction("feedback_submit");
    toast.success("Thanks! We received your message.");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <section id="feedback" className="max-w-3xl mx-auto px-4 py-16 scroll-mt-24">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">Got feedback?</h2>
        <p className="text-muted-foreground text-sm mt-2">
          We read every message. Tell us what you'd love to see next.
        </p>
      </div>
      <form onSubmit={submit} className="glass-strong rounded-3xl p-6 md:p-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Your name"
            value={form.name}
            maxLength={100}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            type="email"
            placeholder="Your email"
            value={form.email}
            maxLength={255}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <Textarea
          placeholder="Your message"
          value={form.message}
          maxLength={2000}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={5}
          required
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full bg-gradient-to-r from-[var(--brand-1)] to-[var(--brand-3)] text-foreground hover:opacity-90"
          >
            {loading ? "Sending..." : (<>Send <Send className="ml-2 h-4 w-4" /></>)}
          </Button>
        </div>
      </form>
    </section>
  );
}
