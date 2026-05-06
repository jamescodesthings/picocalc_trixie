# zerocalc

Debian Trixie (Raspberry Pi OS Lite 64-bit) on a PicoCalc with a Raspberry Pi Zero 2W.
Terminal-only — no GUI. Primary use: running PICO-8.

Based on [`nibheis/picocalc_trixie`](https://github.com/nibheis/picocalc_trixie).


## Quick start

Clone with submodules (the keyboard firmware fork lives at `keyboard/firmware/`):

```bash
git clone --recurse-submodules https://github.com/jamescodesthings/picocalc_trixie.git
```

Or if you already cloned without `--recurse-submodules`:

```bash
git submodule update --init keyboard/firmware
```

Then SSH into the device and run:

```bash
chmod +x install
sudo ./install
```

Installs user scripts, the poweroff service, and the Linux keyboard driver.
For full setup from a fresh OS image see [how-to.md](how-to.md). To flash the
patched STM32 keyboard firmware (fixes RSHIFT+left/right → HOME/END), see
[docs/keyboard_firmware.md](docs/keyboard_firmware.md).


## Folder structure

| Folder / File | Description |
|---------------|-------------|
| `cheatsheet/` | Static HTML + Markdown cheatsheet builder — keyboard shortcuts and PICO-8 API reference. Node/EJS project; `npm start` builds `cheatsheet.html` and `cheatsheet.md`. |
| `display/` | Display driver config. `picomipi.bin` is the MIPI DBI firmware blob for the 320×320 SPI display; `picomipi.txt` is the human-readable source. Uses the kernel's `panel-mipi-dbi-spi` driver — no custom C code. |
| `docs/` | Reference documentation: keyboard layout and driver architecture, PICO-8 shortcuts, build log, forum notes, resource links. |
| `keyboard/picocalc_kbd/` | Linux kernel module — I2C keyboard driver polling at 128 Hz. RSHIFT repurposed as function layer; F5 toggles mouse mode. Build and install with `keyboard/setup_keyboard.sh`. |
| `keyboard/firmware/` | Submodule — fork of `clockworkpi/PicoCalc` on branch `fix/rshift-arrows-home-end`. Patched STM32 keyboard firmware that emits HOME/END on RSHIFT+left/right (stock firmware blackholes those combos). See [docs/keyboard_firmware.md](docs/keyboard_firmware.md) for build + flash. |
| `keyboard/debug` | Diagnostic script — captures dmesg trace during a guided RSHIFT+arrow test sequence. Requires `DEBUG_LEVEL_FE` enabled in `keyboard/picocalc_kbd/debug_levels.h`. |
| `poweroff/` | Systemd service (`picopoweroff`) that sends an I2C signal to cut power to the PicoCalc main board on shutdown. |
| `user_bin/` | Shell scripts deployed to `/usr/local/bin/`: battery status, wifi helpers, bluetooth toggle, reset, shutdown. |
| `user_config/` | Drop-in user config files — currently `.screenrc`. |
| `install` | Top-level install script: copies user scripts, installs poweroff service, runs keyboard setup. |


## Docs

- [Setup guide](how-to.md) — full walkthrough from fresh OS image to working device
- [Keyboard reference](docs/keyboard.md) — physical layout, macros, driver architecture
- [Keyboard firmware](docs/keyboard_firmware.md) — build + flash the patched STM32 firmware
- [PICO-8 reference](docs/pico8_reference.md) — PICO-8 keyboard shortcuts
- [Build log](docs/build_log.md) — hardware assembly and OS setup notes
- [Forum notes](docs/forum_wiki.md) — community bug fixes and config tips
- [Resources](docs/resources.md) — links
