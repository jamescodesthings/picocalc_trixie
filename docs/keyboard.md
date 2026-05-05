# PicoCalc Keyboard

## Overview

Custom BBQ10-style 40% keyboard connected over I2C (address `0x1F`, bus I2C-1, GPIO2/3). The keyboard
microcontroller maintains a FIFO of key events; the Linux driver polls it at ~128 Hz via a kernel timer.

Hardware: BBQ10 Keyboard FeatherWing from arturo182 / wallComputer firmware, adapted for PicoCalc.

---

## Physical Layout

The physical keyboard has three sections:

1. **Left function column** — 8 small keys (F1–F10 + nav, two functions per key)
2. **D-pad** — 4-way directional cross below the function column
3. **Main QWERTY matrix** — 4 rows × 10 columns

### Photo reference

![Keyboard photo](./keyboard.png)

---

## ASCII Layout

> Layout based on the physical keyboard image. Secondary labels (small text on key faces) are
> printed on the keys but **the mechanism to produce them is currently unconfirmed** — Alt+key
> combos from older BBQ10 documentation do NOT work on this keyboard. See
> [Confirmed combos](#confirmed-key-combos) for what is known to work.

```
 ┌──────────┐
 │  F1  F6  │  ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬──────┐
 ├──────────┤  │ #  │ 1  │ 2  │ 3  │    │    │    │    │    │   @  │
 │  F2  F7  │  │ Q  │ W  │ E  │ R  │ T  │ Y  │ U  │ I  │ O  │  P   │
 ├──────────┤  ├────┼────┼────┼────┼────┼────┼────┼────┼────┼──────┤
 │  F3  F8  │  │ *  │ 4  │ 5  │ 6  │    │    │    │    │    │      │
 ├──────────┤  │ A  │ S  │ D  │ F  │ G  │ H  │ J  │ K  │ L  │ BKSP │
 │F4  F9    │  ├────┼────┼────┼────┼────┼────┼────┼────┼────┼──────┤
 │Del End   │  │    │ 7  │ 8  │ 9  │    │    │    │    │    │      │
 ├──────────┤  │    │ Z  │ X  │ C  │ V  │ B  │ N  │ M  │ $  │ENTER │
 │  F5  F10 │  ├────┴──┬─┴───┴────┴────┴────┴────┴──┬─┴──┬─┴──────┤
 ├──────────┤  │       │ ~                           │    │        │
 │  Esc Brk │  │LSHIFT │       SPACE           ALT  │CTRL│ RSHIFT*│
 ├──────────┤  └───────┴─────────────────────────────┴────┴────────┘
 │  Tab Hme │
 ├──────────┤       [↑]
 │  CapsLk  │    [←][·][→]
 └──────────┘       [↓]

* RSHIFT (scancode 0x85) is intercepted by the driver → toggles MOUSE MODE.
  It does NOT emit a shift keycode to the OS.
```

### Secondary labels on keys (printed, access method TBD)

The following small-text labels are printed on key faces. How to access them is currently unknown —
Alt+key combos from the old BBQ10 comment do **not** work on this keyboard.

| Key | Printed secondary |
|-----|-------------------|
| Q | # |
| W | 1 |
| E | 2 |
| R | 3 |
| A | * |
| S | 4 |
| D | 5 |
| F | 6 |
| Z | 7 |
| X | 8 |
| C | 9 |
| P | @ |

### D-pad mappings

| Physical | Scancode | Keycode |
|----------|----------|---------|
| Up | 0xB5 | KEY_UP |
| Down | 0xB6 | KEY_DOWN |
| Left | 0xB4 | KEY_LEFT |
| Right | 0xB7 | KEY_RIGHT |
| Center | 0xD2 | KEY_HOME |

### Confirmed key combos

| Combo | Result | Notes |
|-------|--------|-------|
| Shift + F1 | F6 | Confirmed working |
| Shift + F2 | F7 | Confirmed working |
| Shift + F3 | F8 | Confirmed working |
| Shift + F4 | F9 | Confirmed working |
| Shift + F5 | F10 | Confirmed working |
| Alt + Space | Keyboard brightness up | Firmware-level, confirmed working |
| RSHIFT (tap) | Toggle mouse mode | Driver intercepts; no shift emitted |

### Function column mappings

| Physical label | Plain press | Shift press |
|---|---|---|
| F1 / F6 | KEY_F1 (0x81) | KEY_F6 (0x86) ✓ |
| F2 / F7 | KEY_F2 (0x82) | KEY_F7 (0x87) ✓ |
| F3 / F8 | KEY_F3 (0x83) | KEY_F8 (0x88) ✓ |
| F4 / F9 + Del/End | KEY_F4 (0x84) | KEY_F9 (0x89) ✓ |
| F5 / F10 | KEY_F5 (0x85) → mouse toggle | KEY_F10 (0x90) ✓ |
| Esc / Brk | KEY_ESC (0xB1) | KEY_PAUSE/BREAK (0xD0) |
| Tab / Home (Hme) | KEY_TAB (0x09) | KEY_HOME (0xD2) |
| CapsLk | KEY_CAPSLOCK (0xC1) | — |

### Other special scancodes

| Scancode | Keycode |
|----------|---------|
| 0xA1 | KEY_LEFTALT |
| 0xA2 | KEY_LEFTSHIFT |
| 0xA3 | KEY_RIGHTSHIFT (defined but 0x85 used for mouse mode) |
| 0xA5 | KEY_LEFTCTRL |
| 0xD1 | KEY_INSERT |
| 0xD4 | KEY_DELETE |
| 0xD5 | KEY_END |
| 0xD6 | KEY_PAGEUP |
| 0xD7 | KEY_PAGEDOWN |
| 0xC1 | KEY_CAPSLOCK |

---

## Driver Architecture

**Module:** `picocalc_kbd` — Linux I2C kernel module (`keyboard/picocalc_kbd/picocalc_kbd.c`)

Based on the BBQ10 keyboard driver by arturo182 / wallComputer.

### Components

```
Timer (128 Hz)
  └─→ schedule_work()
        └─→ input_workqueue_handler()
              ├─→ input_fw_read_fifo()   — reads key events from I2C FIFO
              │     └─→ kbd_read_i2c_2u8() — reads 2-byte pairs from REG_FIF (0x09)
              └─→ key_report_event()    — maps scancode → keycode → input event
                    ├─→ mouse mode handling
                    └─→ input_report_key() / input_report_rel()
```

### Two logical drivers registered

| Driver | Purpose |
|--------|---------|
| `input_probe` | Allocates input device, sets up keycode map, starts timer |
| `sysfs_probe` | Creates `/sys/firmware/picocalc/` kobject and attributes |

Both run from the single `picocalc_kbd_probe` function on I2C device match.

### I2C registers used

| Register | Address | Direction | Purpose |
|----------|---------|-----------|---------|
| REG_ID_BAT | 0x0B | Read | Battery level (2 bytes) |
| REG_ID_BKL | 0x05 | Write | Screen backlight (0–255) |
| REG_ID_FIF | 0x09 | Read | Key event FIFO (2 bytes per item) |
| REG_ID_BK2 | 0x0A | Write | Keyboard backlight (0–255) |

Write operations use `reg_addr | 0x80` (PICOCALC_WRITE_MASK).

### Key event FIFO format

Each FIFO item is 2 bytes:

```
Byte 0: key state (4 bits)
Byte 1: scancode
```

States:
- `KEY_STATE_IDLE = 0`
- `KEY_STATE_PRESSED = 1`
- `KEY_STATE_HOLD = 2`
- `KEY_STATE_RELEASED = 3`
- `KEY_STATE_LONG_HOLD = 4`

The driver only acts on PRESSED, RELEASED, and HOLD. HOLD events are ignored for normal keys (no key-repeat via hold — the Linux `EV_REP` bit handles repeat at the OS level).

---

## C Code Details

### `input_fw_read_fifo()`

Polls REG_FIF (0x09) in a loop up to `KBD_FIFO_SIZE` (31) times. Each iteration reads a 2-byte pair.
Stops when `data[0] == 0` (empty FIFO). Populates `ctx->key_fifo_data[]`.

### `key_report_event()`

1. Filters non-actionable states (IDLE, LONG_HOLD)
2. Checks for scancode `0x85` → toggles `ctx->mouse_mode`, returns early (no keycode emitted)
3. If `mouse_mode` is active:
   - Arrow keys (0xB4–0xB7) update `ctx->mouse_move_dir` bitmask + reset move timer
   - `[` → BTN_RIGHT, `]` → BTN_LEFT
   - All other keys fall through to normal handling
4. Posts `EV_MSC/MSC_SCAN` (raw scancode)
5. Looks up keycode: `keycodes[scancode]`
6. Skips if keycode == 0 or KEY_UNKNOWN
7. On PRESSED: `input_report_key(dev, keycode, 1)`
8. On RELEASED: `input_report_key(dev, keycode, 0)`
9. HOLD state: returns without action (OS handles repeat)

### Mouse mode (`ctx->mouse_mode`)

Toggled by scancode 0x85 (physical RSHIFT key). When active:

- Arrow keys move the mouse cursor
- `[` = right mouse button, `]` = left mouse button
- Movement speed accelerates over time:
  - `press_time ≤ 150ms` → step 1
  - `press_time ≤ 450ms` → step 2
  - `press_time > 450ms` → step 4
- Mouse delta reported via `EV_REL / REL_X, REL_Y`

To re-enable RSHIFT as a normal modifier instead, uncomment the `0xA3` section in the `.c` file
and change the mouse mode trigger back to 0xA3.

### Timer

`g_kbd_timer` fires at `HZ/128` (~128 Hz). Each tick calls `schedule_work()` which queues
`input_workqueue_handler` in the kernel workqueue.

### Sysfs interface

Located at `/sys/firmware/picocalc/`:

| Entry | Mode | Purpose |
|-------|------|---------|
| `battery_percent` | r | Raw value; if >100: `value - 128` = actual %; if >200: charging |
| `keyboard_backlight` | w | Write 0–255 to set keyboard LED brightness |
| `screen_backlight` | w | Write 0–255 to set screen backlight |
| `last_keypress` | r | Milliseconds since last keypress (or -1) |

Example:
```bash
cat /sys/firmware/picocalc/battery_percent
echo 128 > /sys/firmware/picocalc/keyboard_backlight
echo 200 > /sys/firmware/picocalc/screen_backlight
```

### Device tree overlay

`keyboard/picocalc_kbd/dts/picocalc_kbd-overlay.dts` — targets `i2c1`, registers device at
address `0x1F` with `compatible = "picocalc_kbd"`.

---

## Build & Install

```bash
# Build only (from keyboard/picocalc_kbd/)
make

# Build + install (from keyboard/ directory — requires root)
sudo ./setup_keyboard.sh
```

`setup_keyboard.sh` does:
1. `apt-get install build-essential device-tree-compiler`
2. Compiles module against running kernel (`/lib/modules/$(uname -r)/build`)
3. Installs `.ko` to `/lib/modules/<uname>/extra/` + runs `depmod`
4. Copies `.dtbo` to `/boot/firmware/overlays/`
5. Prepends `dtoverlay=picocalc_kbd` and `dtparam=i2c_arm=on` to `/boot/firmware/config.txt` (if missing)
6. Hot-reloads module if config was already correct, otherwise prompts reboot

---

## Debug

Verbosity controlled by `DEBUG_LEVEL` in `keyboard/picocalc_kbd/debug_levels.h`.

| Constant | Value | What it logs |
|----------|-------|--------------|
| `DEBUG_LEVEL_OFF` | 0 | Nothing (default) |
| `DEBUG_LEVEL_FE` | 1 | Function entries (probe, init, exit, IRQ) |
| `DEBUG_LEVEL_RW` | 2 | I2C read/write values |
| `DEBUG_LEVEL_LD` | 4 | Logic flow |

Can be OR'd: `DEBUG_LEVEL_FE | DEBUG_LEVEL_RW | DEBUG_LEVEL_LD` = full verbosity.

Monitor live:
```bash
dmesg -wH | grep picocalc_kbd
```
