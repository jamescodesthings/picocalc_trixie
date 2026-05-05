# PicoCalc TODO

## Workflow (after each task)

After each task is marked complete:
1. Code review via `superpowers:requesting-code-review` skill
2. Fix any issues found, re-review if needed
3. Update `docs/keyboard.md` if driver changed
4. Update `CLAUDE.md` if architecture/behaviour changed — no stale info
5. Mark task complete here, add **Task Complete** summary block under it
6. `git add` → `git commit` (descriptive message) → `git push`

## Task Dependencies

```
2b (mouse buttons) ──────────────────────────────────────────────────┐
1  (lshift+arrows) ──────────────────────────────┐                   │
2  (rshift layer)  ──────────────────────────────┴──► 4 ──► 5        │
4b (sticky alt)    ───────────────────────────────────────────────────┤
6  (display)       ───────────────────────────────────────────────────┤
7  (poweroff)      ───────────────────────────────────────────────────┘
                   └── first wave: all independent, run in parallel ──┘
```

## Keyboard Driver

- [ ] **1. Text selection — Left Shift + Arrows**
  - Goal: LSHIFT+arrow emits Shift+arrow to OS so text selection works in PICO-8 and terminal
  - Problem: currently nothing happens — no shifted arrow event reaches the OS
  - File: `keyboard/picocalc_kbd/picocalc_kbd.c` → `key_report_event()`
  - [ ] Investigate: does firmware send LSHIFT (0xA2) + arrow (0xB4–0xB7) as separate FIFO events or combined
  - [ ] If separate: verify driver isn't consuming or dropping the shift event before the arrow arrives
  - [ ] If combined scancode: add modifier state tracking to `kbd_ctx`, synthesise Shift+arrow
  - [ ] Test in PICO-8 editor and terminal

- [ ] **2. RSHIFT as function layer / Ctrl key**
  - Right shift (scancode 0xA3 / KEY_RIGHTSHIFT) repurposed as a function layer modifier
  - When RSHIFT held and another key is pressed:
    1. Check macro table — if RSHIFT+scancode has a defined mapping, emit that keycode with no modifiers
    2. No macro found → synthesise CTRL+key (emit CTRL down, key press/release, CTRL up)
    3. LSHIFT also held → synthesise CTRL+SHIFT+key
  - RSHIFT alone (released with no other key actioned while held): emit nothing
  - No shift modifier ever leaks into the event stream from RSHIFT
  - Initial macro table (d-pad arrows → nav keys):
    - RSHIFT + left (0xB4) → KEY_HOME
    - RSHIFT + right (0xB7) → KEY_END
    - RSHIFT + up (0xB5) → KEY_PAGEUP
    - RSHIFT + down (0xB6) → KEY_PAGEDOWN
  - Fall-through examples: RSHIFT+S = Ctrl+S, RSHIFT+Z = Ctrl+Z, LSHIFT+RSHIFT+Z = Ctrl+Shift+Z
  - LSHIFT+RSHIFT+arrows = Ctrl+Shift+arrows (word-select / jump)
  - File: `keyboard/picocalc_kbd/picocalc_kbd.c`
  - [ ] Add `rshift_held` and `rshift_used` flags to `kbd_ctx`
  - [ ] Add static macro table (scancode/keycode pairs, zero-terminated)
  - [ ] Intercept 0xA3 in `key_report_event()`: set/clear `rshift_held` on press/release; return without emitting shift
  - [ ] On any key press while `rshift_held`: macro lookup → emit nav key, OR synthesise CTRL+(SHIFT+)key; set `rshift_used`
  - [ ] Test: RSHIFT+S = Ctrl+S, RSHIFT+arrows = HOME/END/PGUP/PGDN, LSHIFT+RSHIFT+S = Ctrl+Shift+S
  - [ ] Test: LSHIFT+RSHIFT+arrows = Ctrl+Shift+arrows
  - [ ] Confirm no shift event leaks when using RSHIFT combos

- [ ] **2b. Fix mouse button mapping (LMB/RMB swapped)**
  - Independent, one-line fix
  - `[` should be BTN_LEFT (left click), `]` should be BTN_RIGHT (right click)
  - File: `keyboard/picocalc_kbd/picocalc_kbd.c` → `key_report_event()` mouse mode block
  - [ ] Swap BTN_LEFT/BTN_RIGHT in the `[` and `]` cases

- [ ] **4b. Sticky Alt key — investigate and fix**
  - Symptom: after mashing Shift/Ctrl/Alt combos, Alt stays logically held after release
  - [ ] Enable `DEBUG_LEVEL_FE | DEBUG_LEVEL_RW`, reproduce, watch `dmesg` for missing RELEASED events
  - [ ] Use `evtest` on keyboard input device during stuck-Alt scenario
  - [ ] Check for FIFO overflow: is `key_fifo_count` hitting 31 (KBD_FIFO_SIZE)?
  - [ ] If release events drop: fix FIFO read loop to never skip a non-zero entry
  - [ ] If modifier tracking drifts: add synthetic "release all modifiers" event when FIFO empties

## After Keyboard Fixes (blocked on 1 + 2)

- [ ] **4. Brainstorm additional convenience shortcuts**
  - Depends on: tasks 1 and 2 complete
  - [ ] Review what remains awkward in PICO-8 and terminal after fixes
  - [ ] Agree final shortcut set with user
  - [ ] Extend RSHIFT macro table in driver if new macros agreed
  - [ ] Update `docs/keyboard.md` confirmed combos section

- [ ] **5. Printable HTML cheatsheet**
  - Depends on: task 4 complete
  - Style reference: https://ztiromoritz.github.io/pico-8-spick/index_en.html
  - Font: PICO-8 font variants from https://www.lexaloffle.com/bbs/?tid=3760
  - [ ] Download PICO-8 font files to `docs/fonts/`
  - [ ] Build cheatsheet:
    - `cheatsheet/data.json` — array of shortcut objects: `{ shortcut, description, category }`. Categories e.g. `PICO-8: General`, `PICO-8: Editor`, `General`, `Mouse Mode`
    - `cheatsheet/index.js` — reads `data.json`, builds the HTML
    - `cheatsheet/cheatsheet.html` — built output, self-contained, printable A4/Letter

## Display

- [ ] **6. Investigate and fix display issues**
  - Independent — run in parallel with keyboard tasks
  - Known config: 320x320 SPI0, panel-mipi-dbi-spi, 70 MHz, fbcon=map:1, fbcon=font:MINI4x6
  - [ ] Check `docs/forum_wiki.md` Bugs & Fixes section (fb0/fb1 race condition, BGR colour swap)
  - [ ] The display boots with brightness about 50%: we want it 100% based on the overlay/config.txt defined in `../README.md` (backlight-def-brightness=16)

## Documentation

- [x] `docs/keyboard.md` — keyboard layout, driver summary, function docs
- [x] `docs/forum_wiki.md` — full forum thread wiki
- [x] `docs/build_log.md` — build steps summary
- [x] `docs/pico8_reference.md` — PICO-8 keyboard/mouse reference
- [ ] `cheatsheet/cheatsheet.html` — printable shortcut cheatsheet (blocked on task 5)
