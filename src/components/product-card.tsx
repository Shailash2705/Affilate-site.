import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <article className="glass-card rounded-3xl overflow-hidden flex flex-col group">
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
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-[var(--brand-1)]/25 text-foreground/80 capitalize">
            {product.platform}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[var(--brand-2)]/35 text-foreground/80 capitalize">
            {product.category}
          </span>
        </div>
        <h3 className="font-semibold text-lg leading-tight line-clamp-2">{product.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{product.description}</p>
        <Button
          asChild
          className="mt-2 bg-gradient-to-r from-[var(--brand-1)] to-[var(--brand-3)] text-foreground hover:opacity-90 rounded-full"
        >
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            View Deal <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </article>
  );
}
