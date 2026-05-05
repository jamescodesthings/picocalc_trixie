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

Tasks 1, 2, 2b, 4b all touch `picocalc_kbd.c` — they must run **sequentially** in this order.
Task 6 (display) is fully independent — run in parallel with the keyboard sequence.
Cheatsheet and task 4 are downstream.

```
picocalc_kbd.c tasks (sequential):  2b ──► 1 ──► 2 ──► 4b ──┐
                                                               ├──► 4 ──► cheatsheet
display (independent, parallel):    6 ────────────────────────┘
```

## [ ] Keyboard Driver
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

- [x] **2b. Fix mouse button mapping (LMB/RMB swapped)**
  - Independent, one-line fix
  - `[` should be BTN_LEFT (left click), `]` should be BTN_RIGHT (right click)
  - File: `keyboard/picocalc_kbd/picocalc_kbd.c` → `key_report_event()` mouse mode block
  - [x] Swap BTN_LEFT/BTN_RIGHT in the `[` and `]` cases

  **Task Complete** — Swapped `BTN_LEFT`↔`BTN_RIGHT` in the `]` and `[` switch cases in `key_report_event()`. Updated `docs/keyboard.md` to remove the "swapped — see todo" caveat. Committed as `c41dadb`.

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
  - [ ] Extend RSHIFT macro table in driver
  - [ ] Agree final shortcut set with user
  - [ ] Update `docs/keyboard.md` confirmed combos section

## [x] Display

- [x] **6. Investigate and fix display issues**
  - Independent — run in parallel with keyboard tasks
  - Known config: 320x320 SPI0, panel-mipi-dbi-spi, 70 MHz, fbcon=map:1, fbcon=font:MINI4x6
  - [x] Check `docs/forum_wiki.md` Bugs & Fixes section (fb0/fb1 race condition, BGR colour swap)
  - [x] The display boots with brightness about 50%: we want it 100% based on the overlay/config.txt defined in `../README.md` (backlight-def-brightness=16)

  **Task Complete** — Added `dtparam=backlight-def-brightness=16` after `dtparam=backlight-gpio=18` in `CLAUDE.md` config.txt reference block. The `panel-mipi-dbi-spi` overlay uses 0–16 range; 16 = 100%. Forum wiki had no conflicting notes. Change is local-only (CLAUDE.md is gitignored by design).

## [x] Documentation

- [x] `docs/keyboard.md` — keyboard layout, driver summary, function docs
- [x] `docs/forum_wiki.md` — full forum thread wiki
- [x] `docs/build_log.md` — build steps summary
- [x] `docs/pico8_reference.md` — PICO-8 keyboard/mouse reference

## [ ] Printable HTML Cheatsheet: Keyboard and Pico-8 functions

Purpose:
```
The main Function of our picocalc/devterm is to build pico-8 games. We run terminal using the Pi's framebuffer console, and launch PICO-8 from there. This gives us a very lightweight, fast-booting system, but it means we don't have access to any of the usual desktop environment niceties — including on-screen keyboard shortcuts reference.

In the terminal we'll sometimes use `git`, `httpie`, `bat` and other local command line tools to sync, download stuff, read docs and code, etc.
```

  - Depends on: task 4 complete
  - Create a simple md file first with the confirmed shortcuts
    - Keyboard Section (Keyboard Shortcuts):
      - General for linux termm, which we run using raspberry pi OS's 'console mode' (no X server).
        - Includes things like:
          - Shift+Arrow for text selection,
          - Ctrl+Shift+Arrow for word selection,
          - Home/End/PgUp/PgDn for navigation,
          - and any other useful shortcuts we want to add.
      - PICO-8 Subsection:
        - Controls
        - Editor
        - Console
        - etc.
      - Mouse Mode
        - Arrow keys for mouse movement
        - `[`/`]` for left/right click
        - F5 to toggle
    - Pico-8 Section (PICO-8 Reference):
      - This should be a more traditional cheatsheet and function reference for commonly used PICO-8 features and functions.
        - [ ] Check out: https://ztiromoritz.github.io/pico-8-spick/index_en.html for reference.
        - [ ] Check out: https://www.lexaloffle.com/bbs/?tid=54246https://www.lexaloffle.com/bbs/?tid=54246 as another reference.
  - Style reference: https://ztiromoritz.github.io/pico-8-spick/index_en.html
  - Font: PICO-8 font variants from https://www.lexaloffle.com/bbs/?tid=3760
  - [ ] Check out the references
  - [ ] Create the `cheatsheet/cheatsheet.md`
  - [ ] Finalise the content, make sure it's accurate and complete based on our confirmed shortcuts and the PICO-8 reference.
  - [ ] Download PICO-8 font files to `cheatsheet/fonts/`
  - [ ] Create cheatsheet:
    - A node project in `./cheatsheet` which has an `npm start` command that runs `node index` to build our cheatsheet and output logs about what we're doing using `npm.js/debug`, it uses `ejs` to build the cheatsheet.
    - `cheatsheet/data.json` — array of shortcut objects: `{ shortcut, description, category }`. Categories e.g. `PICO-8: General`, `PICO-8: Editor`, `General`, `Mouse Mode`
    - `cheatsheet/style.css` — the stylesheet.
    - `cheatsheet/template.ejs` - an EJS template for the cheatsheet
    - `cheatsheet/index.js` — reads `data.json`, builds the HTML
  - [ ] Populate the data.json
  - [ ] Create the EJS template for the cheatsheet, use the style.css for styling.
  - [ ] create the `style.css` for the cheatsheet, make it look nice and print-friendly.
  - [ ] Create the `index.js` script to build the cheatsheet
  - [ ] Run the script, generate the cheatsheet HTML, check logs for any issues.
  - [ ] use the front end design skill to improve the cheatsheet, give it context of what we're doing, and what it's for (print primarily, but responsive browser use too).
    - Make sure it's clear, easy to read, and visually appealing. (within the confines of a simple cheatsheet style using the pico-8 font).
  - [ ] Add a dark mode, and a dark mode toggle button on the page. With an external `script.js` to handle the toggle and remember the user's preference in local storage.
  - [ ] Make sure it's responsive down to the phone screen size (up to iphone 14 pro max size) and then also suits screens of 480p, 720p, 1080p, and 4k.
  - [ ] Final review of the cheatsheet, make sure all shortcuts are correct and the formatting is good.
