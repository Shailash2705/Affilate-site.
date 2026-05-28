import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles, ShieldCheck, Send } from "lucide-react";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pickly — Curated affiliate picks" },
      {
        name: "description",
        content:
          "Discover handpicked, premium affiliate products from Amazon, Flipkart, Myntra and more. Minimal, fast, beautifully designed.",
      },
      { property: "og:title", content: "Pickly — Curated affiliate picks" },
      { property: "og:description", content: "Premium affiliate product showcase." },
    ],
  }),
  component: Home,
});

function Home() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Failed to load products");
        setProducts((data as Product[]) ?? []);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!products) return null;
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.platform.toLowerCase().includes(q),
    );
  }, [products, query]);

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-center" />
      <SiteHeader />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 md:pt-24 pb-12 text-center fade-up">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs mb-6">
          <Sparkles className="h-3.5 w-3.5 text-[#DBA380]" />
          Handpicked daily
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Premium picks,
          <br />
          <span className="bg-gradient-to-r from-[#73D1D3] via-[#BADCC3] to-[#DBA380] bg-clip-text text-transparent">
            beautifully curated.
          </span>
        </h1>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
          A minimal showcase of affiliate products from Amazon, Flipkart, Myntra and more.
          Browse, search and shop with confidence.
        </p>

        <div className="mt-8 max-w-xl mx-auto glass-strong rounded-full p-2 flex items-center gap-2">
          <Search className="h-5 w-5 ml-3 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories, platforms..."
            className="border-0 bg-transparent focus-visible:ring-0 shadow-none"
          />
          <Button
            onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-full bg-foreground text-background hover:opacity-90"
          >
            Explore
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure</span>
          <span>•</span>
          <span>No ads, no clutter</span>
          <span>•</span>
          <span>Updated daily</span>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Latest Picks</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {filtered ? `${filtered.length} products` : "Loading..."}
            </p>
          </div>
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
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-muted-foreground text-sm mt-2">
              {query
                ? "Try a different search."
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

function FeedbackSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  // simple math captcha
  const [captcha] = useState(() => ({
    a: Math.floor(Math.random() * 9) + 1,
    b: Math.floor(Math.random() * 9) + 1,
  }));
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (Number(captchaAnswer) !== captcha.a + captcha.b) {
      toast.error("Captcha incorrect");
      return;
    }
    const parsed = feedbackSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("feedback").insert(parsed.data);
    setLoading(false);
    if (error) return toast.error("Failed to send. Please try again.");
    toast.success("Thanks! We received your message.");
    setForm({ name: "", email: "", message: "" });
    setCaptchaAnswer("");
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Quick check:</span>
            <span className="font-medium">
              {captcha.a} + {captcha.b} =
            </span>
            <Input
              type="number"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="w-20"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="sm:ml-auto rounded-full bg-gradient-to-r from-[#73D1D3] to-[#DBA380] text-foreground hover:opacity-90"
          >
            {loading ? "Sending..." : (<>Send <Send className="ml-2 h-4 w-4" /></>)}
          </Button>
        </div>
      </form>
    </section>
  );
}
