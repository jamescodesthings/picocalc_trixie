# PICO-8 Keyboard & Mouse Reference

Input-focused reference for PICO-8, covering all keyboard shortcuts, mouse interactions, and
runtime controls. Extracted from the official PICO-8 manual.

---

## Contents

1. [General / System Keys](#1-general--system-keys)
2. [Editor Navigation](#2-editor-navigation)
3. [Code Editor Shortcuts](#3-code-editor-shortcuts)
4. [Sprite Editor Shortcuts](#4-sprite-editor-shortcuts)
5. [Map Editor Shortcuts](#5-map-editor-shortcuts)
6. [SFX / Music Editor Shortcuts](#6-sfx--music-editor-shortcuts)
7. [Runtime Player Controls](#7-runtime-player-controls)
8. [Pause Menu](#8-pause-menu)
9. [Console / REPL](#9-console--repl)
10. [Mouse & Keyboard in Games (Devkit Mode)](#10-mouse--keyboard-in-games-devkit-mode)
11. [Screenshot & Recording](#11-screenshot--recording)
12. [SPLORE Browser](#12-splore-browser)
13. [Special Characters & Glyphs](#13-special-characters--glyphs)
14. [On PicoCalc](#14-on-picocalc)

---

## 1. General / System Keys

These work at any point in PICO-8 (editor, runtime, console).

| Key | Action |
|-----|--------|
| `ESC` | Toggle between console and editor; stop running program (press twice to reach editor) |
| `Alt+Enter` | Toggle fullscreen |
| `Alt+F4` | Fast quit (Windows) |
| `Ctrl+Q` | Fast quit (macOS / Linux) |
| `Ctrl+R` | Reload / run / restart cartridge |
| `Ctrl+S` | Quick-save working cartridge |
| `Ctrl+M` | Mute / unmute sound |
| `Ctrl+P` | Toggle CPU usage meter (during execution) |
| `Ctrl+6` | Save screenshot to desktop |
| `Ctrl+7` | Capture cartridge label image |
| `Ctrl+8` | Start recording GIF video |
| `Ctrl+9` | Save GIF to desktop (8 seconds by default) |

---

## 2. Editor Navigation

Switching between the five editing panels (Code, Sprite, Map, SFX, Music):

| Key | Action |
|-----|--------|
| Click tab | Click editing mode tabs at top-right of the PICO-8 window |
| `Alt+Left / Alt+Right` | Cycle to previous / next editor tab |
| `Ctrl+Tab` | Next tab |
| `Shift+Ctrl+Tab` | Previous tab |
| `ESC` | Toggle between editor and console/REPL |

> Note: The PICO-8 manual does **not** document F1–F6 for tab switching. Tab order is:
> Code → Sprite → Map → SFX → Music (→ Code). Use Alt+Left/Right or Ctrl+Tab.

---

## 3. Code Editor Shortcuts

### Navigation

| Key | Action |
|-----|--------|
| `Ctrl+Up / Ctrl+Down` | Jump to start / end of file |
| `Alt+Up / Alt+Down` | Navigate to previous / next function definition |
| `Ctrl+Left / Ctrl+Right` | Jump by word |
| `Ctrl+W` | Jump to start of current line |
| `Ctrl+E` | Jump to end of current line |
| `Ctrl+L` | Jump to a specific line number |
| `Ctrl+F` | Search for text in the current tab |
| `Ctrl+G` | Repeat the last search |
| `Home / End` | Line start / end |

### Selection & Editing

| Key | Action |
|-----|--------|
| `Shift+cursor` | Extend selection (or click and drag with mouse) |
| `Ctrl+X` | Cut selected text |
| `Ctrl+C` | Copy selected text |
| `Ctrl+V` | Paste |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+D` | Duplicate current line |
| `Tab` | Indent selected block |
| `Shift+Tab` | Un-indent selected block |
| `Ctrl+B` | Comment / uncomment selected block |
| `Del / Backspace` | Delete character / selection |

### Help & Special Input

| Key | Action |
|-----|--------|
| `Ctrl+U` | Get help on keyword under the cursor |
| `Ctrl+J` | Switch to Hiragana input (type romaji: ka, ki, ku...) |
| `Ctrl+K` | Switch to Katakana input; `Shift+0..9` for extra symbols |
| `Ctrl+P` | Switch to Puny font input; hold `Shift` while in Puny mode to enter standard font |

---

## 4. Sprite Editor Shortcuts

### Tools & Drawing

| Key | Action |
|-----|--------|
| `S` or `Shift` | Select tool |
| `Space` | Pan tool |
| Left mouse button drag | Plot pixels |
| `RMB` (right mouse button) | Pick the colour under the cursor (eyedropper) |
| `Ctrl` + drag | Search and replace a colour |
| Click and drag | Create a rectangular selection |

### Navigation & Zoom

| Key | Action |
|-----|--------|
| `Q` or `A` | Switch to previous sprite |
| `W` or `Z` | Switch to next sprite |
| `1` | Switch to previous colour |
| `2` | Switch to next colour |
| `Tab` | Toggle fullscreen sprite view |
| `Mousewheel` | Zoom in / out |
| `<` / `>` | Zoom out / in |
| `Ctrl+H` | Toggle hex view |
| `Ctrl+G` | Toggle grid lines when zoomed in |

### Edit Operations

| Key | Action |
|-----|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+C` | Copy selected area or selected sprites |
| `Ctrl+X` | Cut selected area or selected sprites |
| `Ctrl+V` | Paste to current sprite location |
| `F` | Flip sprite horizontally |
| `V` | Flip sprite vertically |
| `R` | Rotate selection (requires square selection) |
| `Arrow keys` | Shift sprite/selection (loops within sprite bounds) |
| `Del / Backspace` | Clear selected area |

---

## 5. Map Editor Shortcuts

| Key | Action |
|-----|--------|
| `Q` | Switch to previous sprite (for tile painting) |
| `W` | Switch to next sprite |
| `Mousewheel` | Zoom in / out |
| `<` / `>` | Zoom out / in |
| `Ctrl+H` | Toggle hex view |
| `Enter` | Clear any current map selection |
| `Ctrl+X` | Cut selected map region |
| `Ctrl+V` | Paste to current map location |
| Left mouse button | Paint tiles |
| `RMB` | Pick tile under cursor |

---

## 6. SFX / Music Editor Shortcuts

### Playback & Navigation

| Key | Action |
|-----|--------|
| `Space` | Play / stop current SFX |
| `Shift+Space` | Play from the current SFX quarter-point |
| `-` / `+` | Navigate to previous / next SFX slot |
| `<` / `>` | Decrease / increase playback speed |
| `A` | Release a looping sample |
| `Tab` | Toggle between pitch (piano roll) and tracker mode |

### Tracker Mode — Note Entry

The keyboard is laid out like a piano:

```
  q2w3er5t6y7ui     (upper row — sharps/flats)
  zsxdcvgbhnjm      (lower row — naturals)
```

| Key | Action |
|-----|--------|
| Piano keys (above layout) | Enter a note at the current step |
| `Shift` + note key | Enter a note transposed up one octave |
| `PageUp / PageDown` | Skip up / down 4 steps |
| `Ctrl+Up / Ctrl+Down` | Skip up / down 4 steps (alternative) |
| `Home` | Jump to first note |
| `End` | Jump to last note |
| `Ctrl+Left / Ctrl+Right` | Jump across note attribute columns |
| Click then `Shift`+click | Select a range of notes |
| Double-click | Select all attributes of a single note |

### Music Pattern Editor

| Key | Action |
|-----|--------|
| `Ctrl+C` | Copy pattern |
| `Ctrl+V` | Paste pattern |

---

## 7. Runtime Player Controls

### Default Key Bindings

PICO-8 exposes 6 buttons per player (indices 0–5): left, right, up, down, O, X.

**Player 1 (default):**

| Button | Index | Default Keys |
|--------|-------|--------------|
| Left | 0 | `←` cursor key |
| Right | 1 | `→` cursor key |
| Up | 2 | `↑` cursor key |
| Down | 3 | `↓` cursor key |
| O (confirm) | 4 | `Z`, `C`, or `N` |
| X (cancel) | 5 | `X`, `V`, or `M` |

**Player 2 (default):**

| Button | Index | Default Keys |
|--------|-------|--------------|
| Left | 0 | `S` |
| Right | 1 | `D` or `F` |
| Up | 2 | `E` |
| Down | 3 | *(not clearly mapped)* |
| O (confirm) | 4 | `Tab` or `Q` |
| X (cancel) | 5 | `Shift` or `A` |

> Full player 2 layout from manual: `SDFE + tab,Q / shift A`

To reconfigure: run `KEYCONFIG` from the PICO-8 console.

### BTN / BTNP API

```lua
BTN([b], [pl])   -- returns true while button b is held for player pl (0-indexed)
BTNP([b], [pl])  -- returns true only on the frame the button is first pressed,
                 -- then repeats after 15 frames, every 4 frames (at 30fps)
```

Button indices: `0=left 1=right 2=up 3=down 4=O 5=X` — players 0–7 supported.

**Custom repeat rate:**
```lua
POKE(0x5F5C, delay)  -- initial delay before repeat (frames at 30fps); 255 = never repeat
POKE(0x5F5D, delay)  -- repeating interval; 0 = default (15 and 4)
```

### Gamepad / Controller

PICO-8 uses the SDL2 controller configuration scheme. Custom mappings can be placed in
`sdl_controllers.txt` in the PICO-8 config directory.

---

## 8. Pause Menu

| Key | Action |
|-----|--------|
| `Enter` or `P` | Open pause menu while a cartridge is running |
| `ESC` | Stop the running program; press again to enter editor |

Games can add up to 5 custom items to the pause menu:

```lua
MENUITEM(index, label, callback)
-- index: 1..5 (determines display order)
-- label: string up to 16 characters
-- callback: function called when the item is selected
```

---

## 9. Console / REPL

### Interactive Mode

| Key / Command | Action |
|---------------|--------|
| `ESC` | Toggle between console and editor |
| `Enter` (empty line) | In frame-by-frame mode: advance one frame |
| `.` (single dot) | Enter frame-by-frame debug mode; advance one frame |
| `Ctrl+R` | Reload cartridge from the command line |

### Console Commands

Commands typed at the `>` prompt. String quotes and brackets can be omitted:

| Command | Description |
|---------|-------------|
| `LOAD filename` | Load a cartridge |
| `SAVE filename` | Save current cartridge |
| `RUN` | Run the loaded cartridge |
| `STOP` | Stop the running cartridge |
| `RESUME` | Resume a stopped cartridge |
| `REBOOT` | Reboot PICO-8 |
| `FOLDER` | Open the carts folder in the host OS file browser |
| `KEYCONFIG` | Launch the key configuration utility |
| `EXPORT` | Export to PNG, WAV, HTML, or native binary |

> Shorthand: `LOAD BLAH.P8` instead of `LOAD("BLAH.P8")`

### Clipboard

```lua
-- In code: read clipboard (only available after user presses Ctrl+V at runtime)
STAT(4)

-- Load/save from clipboard using filename @clip:
LOAD @clip
SAVE @clip
```

---

## 10. Mouse & Keyboard in Games (Devkit Mode)

Mouse and raw keyboard input require enabling **devkit input mode** at runtime:

```lua
POKE(0x5F2D, flags)
-- flags:
--   0x1  Enable devkit input
--   0x2  Mouse buttons also trigger BTN(4)..BTN(6)
--   0x4  Pointer lock (relative mouse movement)
```

> When publishing to the Lexaloffle BBS, the manual encourages making mouse/keyboard
> controls optional and disabled by default.

### STAT() — Mouse & Keyboard Query

| STAT index | Returns |
|------------|---------|
| `STAT(30)` | Boolean — true when a keypress is available |
| `STAT(31)` | String — the character from the most recent keypress |
| `STAT(32)` | Mouse X position |
| `STAT(33)` | Mouse Y position |
| `STAT(34)` | Mouse buttons (bitfield: bit0=left, bit1=right, bit2=middle) |
| `STAT(36)` | Mouse wheel event delta |
| `STAT(38)` | Relative X movement in host pixels (requires pointer lock flag 0x4) |
| `STAT(39)` | Relative Y movement in host pixels (requires pointer lock flag 0x4) |

### Other Useful STAT() Values

| STAT index | Returns |
|------------|---------|
| `STAT(4)` | Clipboard contents (after user presses Ctrl+V) |
| `STAT(6)` | Parameter string passed to the cartridge via RUN or LOAD |
| `STAT(110)` | Boolean — true when in frame-by-frame debug mode |

### Reading Keyboard in a Game

```lua
-- Typical polling loop for keyboard input:
POKE(0x5F2D, 1)   -- enable devkit input

function _update()
  while STAT(30) do          -- while keys available in buffer
    local c = STAT(31)       -- read one character
    -- handle c
  end
end
```

---

## 11. Screenshot & Recording

| Key | Action |
|-----|--------|
| `Ctrl+6` | Save a screenshot (PNG) to the desktop |
| `Ctrl+7` | Capture the current screen as the cartridge label image |
| `Ctrl+8` | Start recording a GIF video |
| `Ctrl+9` | Save the recorded GIF to the desktop (8 seconds by default) |

---

## 12. SPLORE Browser

SPLORE is the built-in cartridge browser (`SPLORE` from the console).

| Key | Action |
|-----|--------|
| `Left / Right` | Navigate between cartridge lists |
| `Up / Down` | Move selection within a list |
| `X`, `O`, or menu key | Launch the selected cartridge |
| `F` | Favourite an item |
| `Left / Right` | Move cursor in the search tab |
| `Up / Down` | Cycle through letters in the search tab |

---

## 13. Special Characters & Glyphs

### Button Glyphs in Code / Strings

PICO-8 has built-in glyphs for the six game buttons (left, right, up, down, O, X).
Enter them in the code editor with:

| Key Combo | Glyph produced |
|-----------|----------------|
| `Shift+L` | Left button glyph |
| `Shift+R` | Right button glyph |
| `Shift+U` | Up button glyph |
| `Shift+D` | Down button glyph |
| `Shift+O` | O button glyph |
| `Shift+X` | X button glyph |

These appear as the corresponding arrow/button icons in PICO-8's custom character set.

### Font Modes (in Code Editor)

| Key | Mode |
|-----|------|
| `Ctrl+J` | Hiragana input — type romaji (ka, ki, ku, ...) |
| `Ctrl+K` | Katakana input — `Shift+0..9` gives extra symbols |
| `Ctrl+P` | Puny font (small double-width characters) — hold `Shift` while in Puny mode to enter standard font characters |

### BTN() with Glyphs

Instead of a number, BTN() and BTNP() also accept a button glyph literal directly in code.

---

## 14. On PicoCalc

The PicoCalc uses a 40% BBQ10-style keyboard with an I2C connection. This section maps
every PICO-8 action to the physical keys available on this device.

### Keyboard layout summary

- **Main matrix:** 4 rows × 10 columns, QWERTY layout
- **Left Alt** (`LFTALT` key, bottom-left of matrix): accesses the top legend on each key (numbers, symbols)
- **Right Alt / SYM** (`RALT`, bottom row): accesses the bottom legend on each key
- **Left Shift** (`LSHIFT`, bottom row): standard shift modifier
- **Right Shift** (`RSHIFT`, bottom-right): **currently remapped — toggles mouse mode instead of acting as a shift key**
- **Function column** (left side, 8 small keys): F1–F10 in pairs (primary / secondary per key)
- **D-pad:** physical 4-way directional cross below the function column
- **Ctrl:** `CTRL` key is available on the main matrix

### How to type numbers and symbols

Since the main matrix has no dedicated number row, numbers and symbols come from `Left Alt + key`:

| To type | Press |
|---------|-------|
| `1` through `9` | `LAlt+W` through `LAlt+Z` (see layout) |
| `0` | `LAlt+~` (tilde key, bottom row) |
| `(` `)` `_` `-` `+` `@` | `LAlt+T`, `LAlt+Y`, `LAlt+U`, `LAlt+I`, `LAlt+O`, `LAlt+P` |
| `*` `/` `:` `;` `'` `"` | `LAlt+A`, `LAlt+G`, `LAlt+H`, `LAlt+J`, `LAlt+K`, `LAlt+L` |
| `?` `!` `,` `.` `` ` `` | `LAlt+V`, `LAlt+B`, `LAlt+N`, `LAlt+M`, `LAlt+$` |
| `ESC` | `LAlt+BKSP` (or the `Esc/Brk` key in the function column) |
| `DELETE` | `RAlt+BKSP` |
| `[` `]` | `RAlt+D`, `RAlt+F` |
| `\` | `RAlt+T` |
| `^` `=` `{` `}` | `RAlt+U`, `RAlt+I`, `RAlt+O`, `RAlt+P` |
| `<` `>` | `RAlt+V`, `RAlt+N` |
| `&` | `RAlt+SPACE` |
| `~` | The `~` key (bottom row, plain) |

### Navigation keys

| Key needed | How to press it |
|------------|-----------------|
| Arrow keys (Up/Down/Left/Right) | D-pad **or** `RAlt+Y`, `RAlt+B`, `RAlt+G`, `RAlt+J` |
| `Page Up` | `RAlt+E` |
| `Page Down` | `RAlt+R` |
| `Home` | D-pad centre **or** `RAlt+H` or `Tab/Home` function column key (secondary) |
| `End` | `KEY_END` via function column extended key |
| `Insert` | scancode 0xD1 — no direct physical key documented |
| `Tab` | `Tab/Home` key (function column, primary) |
| `Escape` | `Esc/Brk` key (function column, primary) **or** `LAlt+BKSP` |

### PICO-8 general shortcuts on PicoCalc

| PICO-8 action | PicoCalc key |
|---------------|--------------|
| Toggle fullscreen | `Alt+Enter` → `LAlt+Enter` |
| Quit PICO-8 | `Ctrl+Q` |
| Run / reload cart | `Ctrl+R` |
| Quick save | `Ctrl+S` |
| Toggle sound | `Ctrl+M` |
| CPU meter | `Ctrl+P` |
| Screenshot | `Ctrl+6` → `Ctrl+LAlt+W` (since 6 = LAlt+W) |
| Save GIF label | `Ctrl+7` → `Ctrl+LAlt+X` |
| Start GIF recording | `Ctrl+8` → `Ctrl+LAlt+C` |
| Save GIF | `Ctrl+9` → `Ctrl+LAlt+V` |
| Next editor tab | `Ctrl+Tab` |
| Previous editor tab | `Shift+Ctrl+Tab` |
| Toggle console/editor | `ESC` (function column) |

> **Ctrl+number note:** To issue `Ctrl+6`, you need `Ctrl` + `LAlt+W` simultaneously (since `LAlt+W`
> produces `1`... wait — check the layout: `LAlt+W = 1`, `LAlt+E = 2`, `LAlt+R = 3`, `LAlt+S = 4`,
> `LAlt+D = 5`, `LAlt+F = 6`, `LAlt+Z = 7`, `LAlt+X = 8`, `LAlt+C = 9`, `LAlt+~ = 0`).
> So `Ctrl+6` = hold `Ctrl` + hold `LAlt` + press `F`.

### PICO-8 code editor shortcuts on PicoCalc

| PICO-8 action | PicoCalc key |
|---------------|--------------|
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` |
| Cut / Copy / Paste | `Ctrl+X / C / V` |
| Search | `Ctrl+F` |
| Jump to line | `Ctrl+L` |
| Jump to start/end | `Ctrl+Up / Down` (D-pad Up/Down + Ctrl) |
| Jump by word | `Ctrl+Left / Right` (D-pad Left/Right + Ctrl) |
| Duplicate line | `Ctrl+D` |
| Comment block | `Ctrl+B` |
| Indent | `Tab` |
| Un-indent | `Shift+Tab` (LSHIFT + Tab) |
| Keyword help | `Ctrl+U` |
| Puny font mode | `Ctrl+P` |

### Runtime player controls on PicoCalc

Player 1 uses arrow keys and Z/X — these map naturally:

| PICO-8 button | PicoCalc key |
|---------------|--------------|
| Left | D-pad Left **or** `RAlt+G` |
| Right | D-pad Right **or** `RAlt+J` |
| Up | D-pad Up **or** `RAlt+Y` |
| Down | D-pad Down **or** `RAlt+B` |
| O (btn 4) | `Z` key or `C` key or `N` key |
| X (btn 5) | `X` key or `V` key or `M` key |
| Pause | `Enter` or `P` |

Player 2 keys (`SDFE + Tab/Q / Shift+A`) are all available on the main matrix.
Note: `Shift` for player 2 X-button must use **Left Shift** (Right Shift is mouse mode toggle).

### Mouse mode

The **Right Shift** key toggles the driver's built-in mouse mode:
- While mouse mode is active, the **D-pad** moves the mouse cursor
- `RAlt+D` (`[`) = right mouse button
- `RAlt+F` (`]`) = left mouse button
- Movement accelerates with hold time (step 1 → 2 → 4)

This is a kernel-driver feature separate from PICO-8's devkit mouse input. If a PICO-8 game
uses devkit mouse mode (`POKE(0x5F2D, 1)`), you would use mouse mode to move the pointer and
click within the game.

### Function keys

The function column on the left provides F1–F10 (two functions per physical key).
PICO-8 does not document F-key editor tab switching in the manual, but the OS-level function
keys are available if needed for custom tooling or terminal use outside PICO-8.

### Known limitations

- **No dedicated number row** — all numbers require `LAlt+key` chord. `Ctrl+digit` shortcuts
  (screenshots, etc.) require three-key chords: `Ctrl+LAlt+key`.
- **Right Shift unavailable as shift** — player 2's X-button default binding uses `Shift`; only
  Left Shift is available. KEYCONFIG can remap player 2 to avoid needing right shift.
- **No F-row on the main matrix** — F1–F10 are on the side column only; they may be awkward to
  reach while typing code or while a game is running.
- **Mouse mode vs. Right Shift** — you cannot use Right Shift as a text modifier; to restore it,
  uncomment the `0xA3` section in `keyboard/picocalc_kbd/picocalc_kbd.c` and rebuild/reinstall
  the driver.
