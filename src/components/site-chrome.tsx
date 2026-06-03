import { Link } from "@tanstack/react-router";
import { User, Twitter, Instagram, Youtube, Facebook } from "lucide-react";
import { ThemeToggle, PaletteSwitcher } from "@/components/theme-toggle";
import logoAsset from "@/assets/smart-finds-logo.png.asset.json";

export function SiteHeader() {
  return (
    <header className="sticky top-4 z-40 mx-auto max-w-6xl px-4">
      <nav className="glass-strong rounded-full px-5 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src={logoAsset.url} alt="Smart Finds logo" className="h-8 w-8 rounded-full object-contain" />
          <span>Smart Finds</span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <a href="#categories" className="hidden sm:inline px-3 py-1.5 rounded-full hover:bg-white/40 transition">
            Categories
          </a>
          <a href="#products" className="hidden sm:inline px-3 py-1.5 rounded-full hover:bg-white/40 transition">
            Products
          </a>
          <a href="#feedback" className="hidden md:inline px-3 py-1.5 rounded-full hover:bg-white/40 transition">
            Feedback
          </a>
          <PaletteSwitcher />
          <ThemeToggle />
          <Link
            to="/auth"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/40 transition"
            aria-label="Admin"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/40 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Smart Finds. Curated affiliate picks.</p>
        <div className="flex items-center gap-3">
          <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition" aria-label="Twitter">
            <Twitter className="h-4 w-4" />
          </a>
          <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition" aria-label="Instagram">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition" aria-label="YouTube">
            <Youtube className="h-4 w-4" />
          </a>
          <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition" aria-label="Facebook">
            <Facebook className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
