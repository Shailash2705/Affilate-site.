import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
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
import { Pencil, Trash2, Plus, LogOut, Upload } from "lucide-react";

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
        <Tabs defaultValue="products">
          <TabsList className="glass rounded-full">
            <TabsTrigger value="products" className="rounded-full">Products</TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-full">Feedback</TabsTrigger>
          </TabsList>
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
