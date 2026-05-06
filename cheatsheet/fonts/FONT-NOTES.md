# PICO-8 Font Notes

Source: https://www.lexaloffle.com/bbs/?tid=3760 (RhythmLynx, 2016; Simbax update 2022)
File: `PICO-8.ttf` — jacobpierce/pico-8-font (MIT licence)

## Variant: "Reversed"

This is the **reversed** variant. Uppercase and lowercase letter slots are swapped vs standard Unicode:

| Input in HTML/CSS | Font renders as |
|---|---|
| `a-z` (lowercase) | PICO-8 caps-style block glyphs ✓ |
| `A-Z` (uppercase) | Emoji / special shift-chars ✗ |
| `0-9`, symbols | Normal as expected |

**Rule: always use lowercase text with this font.**

CSS fix applied globally in `style.css`:
```css
body { text-transform: lowercase; }
```

## "Puny" mode

In PICO-8's runtime, `\f` (or a poke) activates "puny" mode — smaller actual-lowercase-looking glyphs. These exist in the font at separate code points. Not relevant for our cheatsheet; we don't use them.

## Wide glyphs

Double-wide pixel characters mapped to U+00C0–U+00D9 (À–Ù). These are PICO-8 extended block chars. Not used in cheatsheet content; avoid that Unicode range.

## Character set

Full P8SCII — 256 chars. Includes:
- Standard ASCII printable (U+0020–U+007E) with reversed case mapping
- Extended symbols / emoji via shifted keys (U+0080 range in PICO-8, mapped to U+00C0–U+00D9 in this TTF)
- Hiragana and Katakana in later PICO-8 versions (may not be in this TTF)

## Usage in HTML/CSS

- Write all visible text in **lowercase**
- `text-transform: uppercase` would break everything — never use it
- `text-transform: lowercase` (applied to body) ensures correct rendering regardless of source case
- The font looks best at pixel-multiples: 8px, 12px, 16px, 24px (original is 4×6 pixels)
