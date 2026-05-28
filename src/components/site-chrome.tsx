import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-4 z-40 mx-auto max-w-6xl px-4">
      <nav className="glass-strong rounded-full px-5 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#73D1D3] to-[#DBA380] text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>Pickly</span>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <a href="#products" className="px-3 py-1.5 rounded-full hover:bg-white/40 transition">
            Products
          </a>
          <a href="#feedback" className="px-3 py-1.5 rounded-full hover:bg-white/40 transition">
            Feedback
          </a>
          <Link
            to="/auth"
            className="px-3 py-1.5 rounded-full bg-foreground/90 text-background hover:opacity-90 transition"
          >
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/40">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Pickly. Curated affiliate picks.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-foreground transition">Twitter</a>
          <a href="#" className="hover:text-foreground transition">Instagram</a>
          <a href="#" className="hover:text-foreground transition">YouTube</a>
        </div>
      </div>
    </footer>
  );
}
