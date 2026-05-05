# PicoCalc TODO

## Priority: Keyboard Driver

### 1. Text selection with Left Shift + Arrows
- **Goal:** Left shift + arrow keys produce shift+arrow events in PICO-8 (and generally) so text selection works
- **Problem:** Currently nothing happens — PICO-8 does not see a shifted arrow event
- **Location:** `keyboard/picocalc_kbd/picocalc_kbd.c` → `key_report_event()`
- **Approach:** Investigate whether the keyboard firmware sends Left Shift (0xA2) + arrow (0xB4–0xB7) as
  separate FIFO events, or a combined scancode. May need to track modifier state in `kbd_ctx` and
  synthesise shift+arrow combos, or ensure EV_KEY events for shift and arrow are sent without consuming.

### 2. Right Shift as "Cmd"-style function key (HOME / END / PGUP / PGDN)
- **Goal:** Right shift + some key → HOME, END, PGUP, PGDN navigation without text selection
- **Current state:** Scancode 0x85 (physical RSHIFT) is already intercepted and toggles mouse mode.
  We need to repurpose or layer on top of this.
- **Design decisions needed:**
  - Pick key combos: e.g. RSHIFT+G = HOME, RSHIFT+H = END, RSHIFT+E = PGUP, RSHIFT+R = PGDN
    (or whatever feels natural on the physical layout)
  - Emit `KEY_HOME`, `KEY_END`, `KEY_PAGEUP`, `KEY_PAGEDOWN` WITHOUT emitting any shift modifier
  - Ensure no BTN_LEFT/RIGHT mouse clicks fire during these combos
- **Location:** `key_report_event()` — extend the existing `if (ev->scancode == 0x85)` block to
  handle state (RSHIFT held = function layer active), or use a separate context flag like `mouse_mode`
- **Note:** Currently RSHIFT press toggles mouse mode — new design must either:
  - Replace mouse mode trigger with a different key, or
  - Use RSHIFT-hold as function layer + tap as mouse toggle

### 2b. Fix mouse button mapping (LMB/RMB swapped)
- **Problem:** `[` fires `BTN_RIGHT` and `]` fires `BTN_LEFT` — backwards. Left bracket should be
  left click, right bracket should be right click.
- **Fix:** In `key_report_event()`, swap the two cases:
  ```c
  case ']': input_report_key(ctx->input_dev, BTN_RIGHT, ...);  // currently BTN_LEFT — wrong
  case '[': input_report_key(ctx->input_dev, BTN_LEFT, ...);   // currently BTN_RIGHT — wrong
  ```
  Change `]` → `BTN_RIGHT` and `[` → `BTN_LEFT`.
- **File:** `keyboard/picocalc_kbd/picocalc_kbd.c`, `key_report_event()`, mouse mode section

### 3. Right Shift + nav key must NOT cause text selection
- **Goal:** When RSHIFT+key emits HOME/END/PGUP/PGDN, no shift modifier must be in the event stream
- **Approach:** In `key_report_event()`, when processing these combos, emit only the nav keycode
  without any preceding KEY_RIGHTSHIFT event. The driver currently returns early on 0x85 without
  emitting shift — so just emit the desired nav key directly and return.

---

## After Keyboard Fixes

### 4. Brainstorm additional convenience shortcuts
- Think through what operations are annoying on a 40% keyboard in PICO-8 and the terminal
- Candidates: select-all (Ctrl+A already works?), undo/redo, line delete, word jump, etc.
- Create a design doc / update this todo once shortcuts are agreed

### 5. Printable HTML cheatsheet
- **Goal:** A single-page printable cheatsheet of all shortcuts including our custom driver modifications
- **Style reference:** https://ztiromoritz.github.io/pico-8-spick/index_en.html
- **Font:** Use PICO-8 font variants from https://www.lexaloffle.com/bbs/?tid=3760
  — download the font files to somewhere useful in this repo (e.g. `docs/fonts/`)
- **Content:**
  - Physical keyboard layout diagram showing our custom shortcuts
  - PICO-8 editor shortcuts
  - Mouse mode activation + controls
  - RSHIFT function layer shortcuts
  - Terminal shortcuts (if any custom ones added)
- **Output:** `docs/cheatsheet.html` — self-contained, printable at A4/Letter

### 4b. Investigate and fix sticky Alt key
- **Symptom:** After mashing Shift/Ctrl/Alt combos (hold, press, double-press) while testing shortcuts,
  the Alt key goes "sticky" — it stays logically held down even after releasing, causing subsequent
  keypresses to be treated as Alt+key
- **Impact:** Blocks shortcut testing and would be terrible UX on-device
- **Possible causes:**
  - Kernel input system's modifier tracking getting out of sync (missed key-release events from FIFO)
  - Driver dropping KEY_RELEASED events for modifier scancodes under certain timing conditions
  - The 128 Hz timer polling missing a release event if the key is released between polls
  - Keyboard firmware FIFO overflow dropping release events when many keys pressed simultaneously
- **Investigation steps:**
  1. Enable `DEBUG_LEVEL_FE | DEBUG_LEVEL_RW` and reproduce — watch `dmesg` for missing RELEASED events
  2. Use `evtest` on the keyboard input device to see raw events during the stuck-Alt scenario
  3. Check whether the FIFO is overflowing (key_fifo_count hitting KBD_FIFO_SIZE=31)
  4. Check whether `input_sync()` is being called after each batch — it is, but verify no events dropped before sync
- **Fix direction:** Likely need to emit a "release all modifiers" synthetic event, or ensure release
  events are never dropped from the FIFO read loop

---

## Display

### 6. Investigate display niggles
- Identify specific display issues (to be documented as they are found)
- Known display config: 320×320 SPI0, panel-mipi-dbi-spi, 70 MHz, `fbcon=map:1`, `fbcon=font:MINI4x6`

---

## System / Services

### 7. Fix poweroff service
- **Status:** NOT WORKING — service does not function correctly on this build
- **Location:** `poweroff/` directory — `picopoweroff.service`, `poweroff-logs`, `poweroff-status`
- **To investigate:**
  - Check service unit file for correct paths and ExecStart
  - Check `picopoweroff` script in `user_bin/`
  - Run `systemctl status picopoweroff` and check logs
  - Determine if issue is I2C write to keyboard MCU or something else

---

## Documentation (in progress)

- [x] `docs/keyboard.md` — keyboard layout, driver summary, C code details
- [ ] `docs/forum_wiki.md` — full forum thread wiki (agent in progress)
- [ ] `docs/build_log.md` — build steps summary (agent in progress)
- [ ] `docs/pico8_reference.md` — PICO-8 keyboard/mouse reference (agent in progress)
- [ ] `docs/cheatsheet.html` — printable shortcut cheatsheet (blocked on #4/#5)
