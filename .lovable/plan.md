## Goal

Each time the website loads, pick a random palette from the existing 4 (Aqua Mint, Sunset Berry, Forest Lime, Rose Sage) and apply it site-wide. The user can still override via the palette switcher, but the choice does NOT persist — every refresh re-randomizes.

## Changes

**`src/components/theme-provider.tsx`**
- Remove `localStorage` persistence for the palette (keep it for `mode` / dark-light).
- On initial mount, pick a random `PaletteId` from `PALETTES` and apply it.
- `setPalette` still updates state in-memory (so the switcher works during the session) but no longer writes to `localStorage`.
- Keep `MODE_KEY` behavior unchanged.

No other files need changes — `PaletteSwitcher` and all `var(--brand-*)` usages keep working as-is.

## Result

- Fresh load / refresh → random palette every time.
- Manual palette pick → applies until next refresh.
- Dark/light preference still persists.
