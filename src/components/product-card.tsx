import { ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";
import { trackInteraction } from "@/lib/analytics";

export interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  affiliate_url: string;
  category: string;
  platform: string;
}

export function ProductCard({ product }: { product: Product }) {
  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: product.affiliate_url,
        });
      } else {
        await navigator.clipboard.writeText(product.affiliate_url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // User cancelled or share failed silently
    }
  }

  return (
    <article className="glass-card rounded-3xl overflow-hidden flex flex-col group">
      <a
        href={product.affiliate_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block"
      >
        <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-[var(--brand-1)]/20 to-[var(--brand-3)]/20">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>
      </a>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-[var(--brand-1)]/25 text-foreground/80 capitalize">
            {product.platform}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--brand-2)]/35 text-foreground/80 capitalize">
            {product.category}
          </span>
        </div>
        <a
          href={product.affiliate_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block"
        >
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 hover:underline">{product.title}</h3>
        </a>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{product.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--brand-1)] to-[var(--brand-3)] text-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            View Deal <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={handleShare}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 hover:bg-foreground/20 transition shrink-0"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
