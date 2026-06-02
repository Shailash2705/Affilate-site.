import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { productSchema, type ProductInput } from "@/lib/validators";
import type { Product } from "@/components/product-card";
import { Pencil, Trash2, Plus, LogOut, Upload, TrendingUp, Search as SearchIcon, MousePointerClick, Share2, MessageSquare, Sparkles, ArrowUp, ArrowDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const IDLE_LOGOUT_MS = 30 * 60 * 1000; // 30 min

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard · Smart Finds" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // Auto logout on inactivity
  useEffect(() => {
    if (!user) return;
    let t: number;
    const reset = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        supabase.auth.signOut();
        toast.info("Signed out due to inactivity");
      }, IDLE_LOGOUT_MS);
    };
    reset();
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset));
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      window.clearTimeout(t);
    };
  }, [user]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-48 rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl p-8 max-w-md text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-[var(--brand-1)] to-[var(--brand-3)] mb-4 animate-pulse" />
          <h1 className="text-xl font-bold">Waiting for admin access</h1>
          <p className="text-muted-foreground text-sm mt-2">
            You're signed in as <span className="font-medium text-foreground">{user.email}</span>,
            but no admin role is assigned yet. Once the site owner grants access,
            this page will unlock automatically — no refresh needed.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate({ to: "/" })} variant="ghost" className="rounded-full">
              Back to site
            </Button>
            <Button onClick={() => supabase.auth.signOut()} className="rounded-full bg-foreground text-background">
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-center" />
      <header className="sticky top-4 z-40 mx-auto max-w-6xl px-4">
        <div className="glass-strong rounded-full px-5 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">Smart Finds Admin</Link>
          <Button
            variant="ghost"
            onClick={() => supabase.auth.signOut()}
            className="rounded-full"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="analytics">
          <TabsList className="glass rounded-full">
            <TabsTrigger value="analytics" className="rounded-full">Analytics</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full">Products</TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-full">Feedback</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics" className="mt-6">
            <AnalyticsPanel />
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            <ProductsManager />
          </TabsContent>
          <TabsContent value="feedback" className="mt-6">
            <FeedbackList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ProductsManager() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load");
    setProducts((data as Product[]) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Products</h2>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-to-r from-[#73D1D3] to-[#DBA380] text-foreground">
              <Plus className="h-4 w-4 mr-1" /> Add product
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-white/60 max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
            </DialogHeader>
            <ProductForm
              initial={editing}
              onDone={() => {
                setOpen(false);
                setEditing(null);
                load();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!products && <Skeleton className="h-40 rounded-2xl bg-white/40" />}
      {products && products.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
          No products yet. Add your first one.
        </div>
      )}
      {products && products.length > 0 && (
        <div className="grid gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="glass rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-white/40 shrink-0">
                {p.image_url && (
                  <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {p.platform} · {p.category}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(p);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductForm({
  initial,
  onDone,
}: {
  initial: Product | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState<ProductInput>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    image_url: initial?.image_url ?? "",
    affiliate_url: initial?.affiliate_url ?? "",
    category: initial?.category ?? "general",
    platform: initial?.platform ?? "amazon",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.kind === "file" && it.type.startsWith("image/")) {
          const file = it.getAsFile();
          if (file) {
            e.preventDefault();
            uploadImage(file);
            return;
          }
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = productSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSaving(true);
    const op = initial
      ? supabase.from("products").update(parsed.data).eq("id", initial.id)
      : supabase.from("products").insert(parsed.data);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(initial ? "Updated" : "Added");
    onDone();
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <Input
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        maxLength={150}
        required
      />
      <Textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        maxLength={1000}
        rows={3}
      />
      <Input
        placeholder="Affiliate URL (https://...)"
        value={form.affiliate_url}
        onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <Input
          placeholder="Platform"
          value={form.platform}
          onChange={(e) => setForm({ ...form, platform: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Input
          placeholder="Image URL (or upload below)"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        />
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) uploadImage(f);
          }}
          className={`flex flex-col items-center justify-center gap-1 glass rounded-xl py-4 px-3 cursor-pointer text-sm hover:bg-white/60 transition border-2 border-dashed ${
            dragOver ? "border-foreground/60 bg-white/60" : "border-transparent"
          }`}
        >
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Click, drag & drop, or paste (Ctrl+V)"}
          </div>
          <span className="text-[11px] text-muted-foreground">
            PNG, JPG, WEBP, GIF · max 5MB
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadImage(f);
            }}
          />
        </label>
        {form.image_url && (
          <img
            src={form.image_url}
            alt=""
            className="w-full h-32 object-cover rounded-xl"
          />
        )}
      </div>
      <DialogFooter>
        <Button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-foreground text-background"
        >
          {saving ? "Saving..." : initial ? "Save changes" : "Add product"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FeedbackList() {
  const [items, setItems] = useState<
    { id: string; name: string; email: string; message: string; created_at: string }[] | null
  >(null);

  useEffect(() => {
    supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Failed to load");
        setItems(data ?? []);
      });
  }, []);

  if (!items) return <Skeleton className="h-40 rounded-2xl bg-white/40" />;
  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
        No feedback yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((f) => (
        <div key={f.id} className="glass rounded-2xl p-4">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="font-medium">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.email}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(f.created_at).toLocaleString()}
            </p>
          </div>
          <p className="mt-2 text-sm whitespace-pre-wrap">{f.message}</p>
        </div>
      ))}
    </div>
  );
}

type SearchEvent = { id: string; query: string; category: string | null; created_at: string };
type InteractionEvent = {
  id: string;
  event_type: string;
  product_id: string | null;
  product_title: string | null;
  category: string | null;
  platform: string | null;
  created_at: string;
};

const RANGES = [
  { label: "24h", hours: 24 },
  { label: "7d", hours: 24 * 7 },
  { label: "30d", hours: 24 * 30 },
  { label: "All", hours: 0 },
];

function AnalyticsPanel() {
  const [rangeHours, setRangeHours] = useState(24 * 7);
  const [searches, setSearches] = useState<SearchEvent[] | null>(null);
  const [interactions, setInteractions] = useState<InteractionEvent[] | null>(null);

  useEffect(() => {
    const since =
      rangeHours > 0
        ? new Date(Date.now() - rangeHours * 3600 * 1000).toISOString()
        : null;

    let sq = supabase.from("search_events").select("*").order("created_at", { ascending: false }).limit(1000);
    let iq = supabase.from("interaction_events").select("*").order("created_at", { ascending: false }).limit(2000);
    if (since) {
      sq = sq.gte("created_at", since);
      iq = iq.gte("created_at", since);
    }

    setSearches(null);
    setInteractions(null);
    sq.then(({ data, error }) => {
      if (error) toast.error("Failed to load searches");
      setSearches((data as SearchEvent[]) ?? []);
    });
    iq.then(({ data, error }) => {
      if (error) toast.error("Failed to load interactions");
      setInteractions((data as InteractionEvent[]) ?? []);
    });
  }, [rangeHours]);

  const loading = !searches || !interactions;

  const topSearches = useMemo(() => {
    if (!searches) return [];
    const m = new Map<string, number>();
    for (const s of searches) {
      const k = s.query.toLowerCase().trim();
      if (!k) continue;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [searches]);

  const topSearchedCategories = useMemo(() => {
    if (!searches) return [];
    const m = new Map<string, number>();
    for (const s of searches) {
      if (!s.category) continue;
      m.set(s.category, (m.get(s.category) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [searches]);

  const counts = useMemo(() => {
    if (!interactions) return { view_deal: 0, share: 0, category: 0, explore: 0, feedback: 0 };
    return {
      view_deal: interactions.filter((i) => i.event_type === "view_deal_click").length,
      share: interactions.filter((i) => i.event_type === "share_click").length,
      category: interactions.filter((i) => i.event_type === "category_select").length,
      explore: interactions.filter((i) => i.event_type === "explore_click").length,
      feedback: interactions.filter((i) => i.event_type === "feedback_submit").length,
    };
  }, [interactions]);

  const topProducts = useMemo(() => {
    if (!interactions) return [];
    const m = new Map<string, { title: string; clicks: number; shares: number }>();
    for (const i of interactions) {
      if (i.event_type !== "view_deal_click" && i.event_type !== "share_click") continue;
      const key = i.product_id ?? i.product_title ?? "unknown";
      const cur = m.get(key) ?? { title: i.product_title ?? "(unknown)", clicks: 0, shares: 0 };
      if (i.event_type === "view_deal_click") cur.clicks += 1;
      else cur.shares += 1;
      m.set(key, cur);
    }
    return Array.from(m.values())
      .sort((a, b) => b.clicks + b.shares - (a.clicks + a.shares))
      .slice(0, 10);
  }, [interactions]);

  const topClickedCategories = useMemo(() => {
    if (!interactions) return [];
    const m = new Map<string, number>();
    for (const i of interactions) {
      if (i.event_type !== "view_deal_click" || !i.category) continue;
      m.set(i.category, (m.get(i.category) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [interactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[var(--brand-3)]" /> Site analytics
        </h2>
        <div className="glass rounded-full p-1 flex gap-1 text-xs">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRangeHours(r.hours)}
              className={`px-3 py-1.5 rounded-full transition ${
                rangeHours === r.hours
                  ? "bg-foreground text-background"
                  : "hover:bg-white/50 dark:hover:bg-white/10"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <Skeleton className="h-40 rounded-2xl bg-white/40" />}

      {!loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard icon={<SearchIcon className="h-4 w-4" />} label="Searches" value={searches!.length} />
            <StatCard icon={<MousePointerClick className="h-4 w-4" />} label="View Deal" value={counts.view_deal} />
            <StatCard icon={<Share2 className="h-4 w-4" />} label="Shares" value={counts.share} />
            <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Category clicks" value={counts.category} />
            <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Explore" value={counts.explore} />
            <StatCard icon={<MessageSquare className="h-4 w-4" />} label="Feedback" value={counts.feedback} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <RankList
              title="Top searches"
              empty="No searches yet."
              icon={<SearchIcon className="h-4 w-4" />}
              items={topSearches.map((s) => ({ label: s.query, count: s.count }))}
            />
            <RankList
              title="Searched categories"
              empty="No category-filtered searches yet."
              icon={<TrendingUp className="h-4 w-4" />}
              items={topSearchedCategories.map((c) => ({ label: c.name, count: c.count }))}
            />
            <RankList
              title="Most-clicked products"
              empty="No product clicks yet."
              icon={<MousePointerClick className="h-4 w-4" />}
              items={topProducts.map((p) => ({
                label: p.title,
                count: p.clicks + p.shares,
                meta: `${p.clicks} clicks · ${p.shares} shares`,
              }))}
            />
            <RankList
              title="Top clicked categories"
              empty="No category clicks yet."
              icon={<TrendingUp className="h-4 w-4" />}
              items={topClickedCategories.map((c) => ({ label: c.name, count: c.count }))}
            />
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <SearchIcon className="h-4 w-4" /> Recent searches
            </h3>
            {searches!.length === 0 ? (
              <p className="text-sm text-muted-foreground">No searches yet.</p>
            ) : (
              <ul className="divide-y divide-white/40 dark:divide-white/10 text-sm max-h-72 overflow-auto">
                {searches!.slice(0, 50).map((s) => (
                  <li key={s.id} className="py-2 flex items-center justify-between gap-3">
                    <span className="truncate">
                      <span className="font-medium">{s.query}</span>
                      {s.category && (
                        <span className="ml-2 text-xs text-muted-foreground capitalize">
                          in {s.category}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(s.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

function RankList({
  title,
  icon,
  items,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  items: { label: string; count: number; meta?: string }[];
  empty: string;
}) {
  const max = items[0]?.count ?? 1;
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        {icon} {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it, idx) => (
            <li key={idx} className="text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate capitalize">{it.label}</span>
                <span className="text-xs font-semibold tabular-nums shrink-0">{it.count}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-white/40 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--brand-1)] to-[var(--brand-3)]"
                  style={{ width: `${Math.max(6, (it.count / max) * 100)}%` }}
                />
              </div>
              {it.meta && <p className="text-[11px] text-muted-foreground mt-0.5">{it.meta}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
