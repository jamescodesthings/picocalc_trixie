# PicoCalc Keyboard

## Overview

Custom keyboard connected over I2C (address `0x1F`, bus I2C-1, GPIO2/3). The keyboard
microcontroller maintains a FIFO of key events; the Linux driver polls it at ~128 Hz via a kernel timer.

## Physical Layout

Each key has a main character and a secondary character produced by Shift+key. Some keys have an
Alt+key function to control hardware (brightness, etc.).

**D-pad** (top left) — 4-way directional cross

**Top function row** (to the right of the d-pad, above the rest of the keyboard) — F1–F5, with
Shift+F1–F5 = F6–F10. Pressing F5 toggles mouse mode: arrows move the cursor, `]` = LMB, `[` = RMB.

**Esc/Backspace row** — Esc/Brk, Tab/Home, CapsLock, Del/End, Backspace

**Backtick row** — `` ` ``/`~`, `/`/`?`, `\`/`|`, `-`/`_`, `=`/`+`, `[`/`{`, `]`/`}`. In mouse
mode `[` = LMB and `]` = RMB. (Note: driver currently has these swapped — see todo.)

**Numbers row** — `1`–`0` with Shift giving `!@#$%^&*()`

**QWERTY row** — Q–P. Alt+I = Insert. All others: Shift = uppercase.

**ASDF row** — A–L. Rightmost key is a tall Enter shared with the ZXCV row. No modifier combos.

**ZXCV row** — Z–M plus `,` and `.`. Tall Enter shared with ASDF row. Alt+`,` = screen dim,
Alt+`.` = screen brighten.

**Modifiers row** — LShift (wide), Ctrl (wide), Alt (wide), Space (extra-wide; Alt+Space = keyboard
brightness up), `;`/`:`, `'`/`"`, RShift (wide; intercepted by driver as mouse mode toggle — no
shift emitted to OS).

### Photo reference

![Keyboard photo](./keyboard.png)

## ASCII Layout

```
  ┌─────────┐ ┌──────┬──────┬──────┬──────┬────────┐
  │    ↑    │ │  F1  │  F2  │  F3  │  F4  │  F5    │
  │ ←     → │ ├──────┼──────┼──────┼──────┼────────┤
  │    ↓    │ │  F6  │  F7  │  F8  │  F9  │  F10   │
  └─────────┘ ├──────┼──────┼──────┼──────┼────────┤
              │ Esc  │ Tab  │ Caps │ Del  │ Backsp │
              │ Brk  │ Home │      │ End  │        │
              ├──────┼──────┼──────┼──────┼────────┤
              │   `  │   /  │   \  │   [  │    ]   │
              │   ~  │   ?  │   |  │   {  │    }   │
              └──────┴──────┴──────┴──────┴────────┘
┌────────┬───┬───┬───┬───┬───┬───┬────┬──────┬─────┐
│      1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8  │  9   │  0  │
│      ! │ @ │ # │ $ │ % │ ^ │ & │ *  │  (   │  )  │
├────────┼───┼───┼───┼───┼───┼───┼────┼──────┼─────┤
│      q │ w │ e │ r │ t │ y │ u │ i  │  o   │  p  │
├────────┼───┼───┼───┼───┼───┼───┼────┼──────┼─────┤
│      a │ s │ d │ f │ g │ h │ j │ k  │  l   │     │
├────────┼───┼───┼───┼───┼───┼───┼────┼──────┤ ent │
│      z │ x │ c │ v │ b │ n │ m │ ,  │  .   │     │
├────────┼───┴──┬┴───┴┬──┴───┴┬──┴──┬─┴───┬──┴─────┤
│ LSHIFT │ CTRL │ ALT │ SPACE │  ;  │  '  │ RSHIFT │
│        │      │     │       │  :  │  "  │        │
└────────┴──────┴─────┴───────┴─────┴─────┴────────┘
```

## Mouse Emulation Mode

Activated by pressing F5.

In this mode:

- the arrow keys emit relative mouse movements instead of arrow key events
-  `]`/`[` emit left/right mouse clicks instead of their normal key events
- Pressing F5 again exits mouse mode.

## Macros

| Macro | Function |
|-------|----------|
| F5 | Toggle mouse mode |
| Alt+I | Insert |
| Alt+, | Screen dim |
| Alt+. | Screen brighten |
| Alt+Space | Keyboard backlight brighten |

## Driver Architecture

Module `picocalc_kbd` is a Linux I2C kernel module. On device match it runs two probes:
`input_probe` sets up the key event pipeline; `sysfs_probe` exposes hardware controls at
`/sys/firmware/picocalc/`.

```
kernel timer (HZ/128, ~128 Hz)
  └─ schedule_work()
       └─ input_workqueue_handler()
            ├─ input_fw_read_fifo()     reads FIFO from I2C
            ├─ key_report_event() ×N   translates each event to input events
            └─ mouse movement emit     if mouse_mode active, emits REL_X/REL_Y
```

**I2C registers**

| Register | Address | R/W | Purpose |
|----------|---------|-----|---------|
| REG_ID_FIF | 0x09 | R | Key event FIFO (2 bytes/item) |
| REG_ID_BKL | 0x05 | W | Screen backlight 0–255 |
| REG_ID_BK2 | 0x0A | W | Keyboard backlight 0–255 |
| REG_ID_BAT | 0x0B | R | Battery level (2 bytes) |

Write operations OR the address with `0x80` before sending.

**FIFO item format** (2 bytes per item)

```
byte 0: key state  (1=pressed, 2=hold, 3=released, 4=long-hold, 0=idle)
byte 1: scancode
```

## Functions

**`kbd_read_i2c_u8(client, reg, dst)`**
Single smbus byte read from `reg` into `*dst`.

**`kbd_write_i2c_u8(client, reg, src)`**
Single smbus byte write of `src` to `reg | 0x80`.

**`kbd_read_i2c_2u8(client, reg, dst)`**
smbus word read from `reg`; stores low byte to `dst[0]`, high byte to `dst[1]`.

**`input_fw_read_fifo(ctx)`**
Resets `ctx->key_fifo_count` to 0. Loops up to 31 times calling `kbd_read_i2c_2u8` on REG_ID_FIF
(0x09). Stops when `data[0] == 0` (empty FIFO). Each non-zero result is stored in
`ctx->key_fifo_data[]` and `key_fifo_count` is incremented.

**`key_report_event(ctx, ev)`**
1. Drops events where state is not pressed(1), released(3), or hold(2).
2. Scancode `0x85`: flips `ctx->mouse_mode` on press, returns — nothing emitted to OS.
3. If `mouse_mode`:
   - Arrow scancodes (0xB4–0xB7): set/clear bits in `ctx->mouse_move_dir`; reset `last_keypress_at`
     when a direction is first activated.
   - `]` (0x5D): emits `BTN_LEFT` press/release.
   - `[` (0x5B): emits `BTN_RIGHT` press/release.
   - All other scancodes fall through to normal key handling below.
4. Posts `EV_MSC / MSC_SCAN` with raw scancode.
5. Looks up `keycodes[scancode]`. Skips if 0 or `KEY_UNKNOWN`.
6. Updates `ctx->last_keypress_at` to current boot time (ns).
7. Hold state (2): returns here — no key event (OS `EV_REP` handles repeat).
8. Pressed/released: calls `input_report_key(dev, keycode, state == pressed)`.

**`input_workqueue_handler(work)`**
Retrieves `ctx` via `container_of`. Calls `input_fw_read_fifo`, then `key_report_event` for each
FIFO item. If `mouse_mode` is active, calculates `mouse_move_step` (1/2/4 pixels) from time elapsed
since `last_keypress_at` (≤150 ms → 1, ≤450 ms → 2, >450 ms → 4), then emits `REL_X`/`REL_Y` for
each active direction bit. Resets `key_fifo_count` to 0. Calls `input_sync`.

**`kbd_timer_function(data)`**
Reschedules itself for `jiffies + HZ/128`. Calls `schedule_work` on the global context's work struct.

**`input_probe(client)`**
Allocates `kbd_ctx` (device-managed). Copies keycode array. Allocates and initialises `input_dev`
with bus type, vendor/product/version IDs, keycode array, and capability bits (`EV_KEY`, `EV_REP`,
`EV_MSC/MSC_SCAN`, `EV_REL/REL_X/REL_Y`, `BTN_LEFT`, `BTN_RIGHT`). Sets `mouse_mode = false`.
Starts `g_kbd_timer`. Registers the input device.

**`input_shutdown(client)`**
Deletes `g_kbd_timer`. Sets global ctx to NULL (memory freed by device manager on probe cleanup).

**`read_battery_percent()`**
Reads 2 bytes from REG_ID_BAT via `kbd_read_i2c_2u8`. Returns `percent[1]` (second byte).
Callers interpret: value > 200 → charging; value > 100 → actual % is `value − 128`; ≤ 100 → raw %.

**`parse_and_write_i2c_u8(buf, count, reg)`**
Parses an integer 0–255 from string `buf`. If valid, writes it to `reg` over I2C. Returns `count`
on success, `-EINVAL` on bad input.

**`sysfs_probe(client)`**
Allocates a `kobject` with a custom `kobj_type` (sets GID on sysfs files). Adds it under
`firmware_kobj` as `"picocalc"`. Creates attribute group with four entries: `battery_percent`,
`screen_backlight`, `last_keypress`, `keyboard_backlight`.

**`sysfs_shutdown(client)`**
Calls `kobject_put` to release the sysfs kobject and remove `/sys/firmware/picocalc/`.

**`picocalc_kbd_probe(client)`**
Calls `input_probe` then `sysfs_probe`. Any failure returns the error code.

**`picocalc_kbd_shutdown` / `picocalc_kbd_remove`**
Both call `sysfs_shutdown` then `input_shutdown`.

**`picocalc_kbd_init` / `picocalc_kbd_exit`**
Module init/exit — registers/unregisters the I2C driver with the kernel.

## Sysfs Interface

Located at `/sys/firmware/picocalc/`:

| Entry | Mode | Notes |
|-------|------|-------|
| `battery_percent` | r | Returns raw byte. >200 = charging; >100 = actual% is value−128; ≤100 = raw% |
| `keyboard_backlight` | w | Write 0–255 to REG_ID_BK2 |
| `screen_backlight` | w | Write 0–255 to REG_ID_BKL |
| `last_keypress` | r | Milliseconds since last key event, or -1 |

```bash
cat /sys/firmware/picocalc/battery_percent
echo 200 > /sys/firmware/picocalc/screen_backlight
echo 128 > /sys/firmware/picocalc/keyboard_backlight
```

## Build & Install

```bash
# Build only
cd keyboard/picocalc_kbd && make

# Build + install (run from keyboard/, requires root)
sudo ./setup_keyboard.sh
```

`setup_keyboard.sh` installs build deps, compiles against the running kernel, copies `.ko` to
`/lib/modules/<uname>/extra/`, copies `.dtbo` to `/boot/firmware/overlays/`, updates
`config.txt` (adds `dtoverlay=picocalc_kbd` and `dtparam=i2c_arm=on` if missing), then
hot-reloads the module or prompts for reboot if config changed.

## Debug

`DEBUG_LEVEL` in `keyboard/picocalc_kbd/debug_levels.h` — default `DEBUG_LEVEL_OFF`.

| Flag | Value | Logs |
|------|-------|------|
| `DEBUG_LEVEL_FE` | 1 | Function entries |
| `DEBUG_LEVEL_RW` | 2 | I2C reads/writes |
| `DEBUG_LEVEL_LD` | 4 | Logic flow |

OR them together for full verbosity. Monitor:

```bash
dmesg -wH | grep picocalc_kbd
```
