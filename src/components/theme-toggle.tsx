import { Moon, Sun, Palette as PaletteIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, PALETTES } from "@/components/theme-provider";

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setMode(mode === "dark" ? "light" : "dark")}
      className="rounded-full h-9 w-9"
    >
      {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function PaletteSwitcher() {
  const { palette, setPalette } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change colors" className="rounded-full h-9 w-9">
          <PaletteIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-strong border-white/60">
        <DropdownMenuLabel>Color palette</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PALETTES.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => setPalette(p.id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex -space-x-1">
              {p.swatches.slice(0, 4).map((c, i) => (
                <span
                  key={i}
                  className="h-4 w-4 rounded-full ring-1 ring-white/70"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="text-sm flex-1">{p.name}</span>
            {palette === p.id && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
