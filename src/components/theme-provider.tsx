import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Mode = "light" | "dark";
export type PaletteId = "default" | "sunset" | "forest" | "rosewood";

export interface Palette {
  id: PaletteId;
  name: string;
  swatches: string[];
  brand: { c1: string; c2: string; c3: string };
}

export const PALETTES: Palette[] = [
  {
    id: "default",
    name: "Aqua Mint",
    swatches: ["#73D1D3", "#BADCC3", "#DBA380", "#F7F1EA"],
    brand: { c1: "#73D1D3", c2: "#BADCC3", c3: "#DBA380" },
  },
  {
    id: "sunset",
    name: "Sunset Berry",
    swatches: ["#FCEDDE", "#FFD464", "#FF5E5E", "#E23C64", "#B0183D"],
    brand: { c1: "#FFD464", c2: "#FF5E5E", c3: "#B0183D" },
  },
  {
    id: "forest",
    name: "Forest Lime",
    swatches: ["#F4FFFC", "#91EAAF", "#C3E956", "#4D7111", "#1F4B2C"],
    brand: { c1: "#91EAAF", c2: "#C3E956", c3: "#1F4B2C" },
  },
  {
    id: "rosewood",
    name: "Rose Sage",
    swatches: ["#9EABA2", "#BDD1C5", "#EECCBC", "#E88298", "#D3A29D", "#A36361"],
    brand: { c1: "#BDD1C5", c2: "#EECCBC", c3: "#E88298" },
  },
];

interface Ctx {
  mode: Mode;
  palette: PaletteId;
  setMode: (m: Mode) => void;
  setPalette: (p: PaletteId) => void;
}

const ThemeContext = createContext<Ctx | null>(null);

const MODE_KEY = "pickly.mode";
const PAL_KEY = "pickly.palette";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("light");
  // Deterministic default for SSR; randomize on client after mount to avoid hydration mismatch.
  const [palette, setPaletteState] = useState<PaletteId>(PALETTES[0].id);

  useEffect(() => {
    const m = (localStorage.getItem(MODE_KEY) as Mode) || "light";
    setModeState(m);
    const random = PALETTES[Math.floor(Math.random() * PALETTES.length)].id;
    setPaletteState(random);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.dataset.palette = palette;

    const pal = PALETTES.find((p) => p.id === palette) ?? PALETTES[0];
    root.style.setProperty("--brand-1", pal.brand.c1);
    root.style.setProperty("--brand-2", pal.brand.c2);
    root.style.setProperty("--brand-3", pal.brand.c3);
  }, [mode, palette]);

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem(MODE_KEY, m);
  };
  const setPalette = (p: PaletteId) => {
    setPaletteState(p);
  };


  return (
    <ThemeContext.Provider value={{ mode, palette, setMode, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
