import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { authSchema } from "@/lib/validators";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin · Pickly" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin" });
  }, [user, isAdmin, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Toaster richColors position="top-center" />
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground mb-4">
          ← Back to site
        </Link>
        <div className="glass-strong rounded-3xl p-8">
          <div className="flex items-center justify-center mb-6">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#73D1D3] to-[#DBA380] text-white">
              <ShieldCheck className="h-6 w-6" />
            </span>
          </div>
          <h1 className="text-2xl font-bold text-center">Admin access</h1>
          <p className="text-center text-sm text-muted-foreground mt-1">
            Secure dashboard for managing products.
          </p>

          {user && !isAdmin && (
            <div className="mt-4 glass rounded-xl p-3 text-sm text-center">
              Signed in but no admin role assigned. Contact site owner.
              <Button
                variant="link"
                onClick={() => supabase.auth.signOut()}
                className="block mx-auto mt-1"
              >
                Sign out
              </Button>
            </div>
          )}

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <AuthForm mode="signin" />
            </TabsContent>
            <TabsContent value="signup">
              <AuthForm mode="signup" />
              <p className="text-xs text-muted-foreground mt-3 text-center">
                First account requires admin role to be granted manually.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) toast.error(error.message);
      else toast.success("Welcome back");
    } else {
      const { error } = await supabase.auth.signUp({
        ...parsed.data,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) toast.error(error.message);
      else toast.success("Account created. Check your email.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-3 mt-4">
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />
      <Input
        type="password"
        placeholder="Password (min 8 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        required
      />
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-foreground text-background hover:opacity-90"
      >
        {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
      </Button>
    </form>
  );
}
