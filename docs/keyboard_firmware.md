# Keyboard Firmware (STM32) — Build & Flash

The PicoCalc keyboard is driven by an **STM32F103R8T6** MCU on the
keyboard PCB inside the case, communicating with the Pi over I2C. This
chip runs the firmware that scans the key matrix, manages the LCD and
keyboard backlights, reads battery state, and handles the RSHIFT
function layer.

The source lives in this repo as a git submodule at
[`keyboard/firmware/`](../keyboard/firmware/), pointing at a fork of
[`clockworkpi/PicoCalc`](https://github.com/clockworkpi/PicoCalc) on
the `fix/rshift-arrows-home-end` branch. The sketch project is at
`keyboard/firmware/Code/picocalc_keyboard/`.


## Why we ship a patched fork

Stock firmware silently drops `RSHIFT + LEFT` and `RSHIFT + RIGHT`. UP
and DOWN work (they emit `KEY_PAGE_UP` / `KEY_PAGE_DOWN`), but LEFT and
RIGHT have no shifted variant defined in `btn_entries`, so the firmware
emits nothing on the I2C bus when those combos are pressed.

The patch adds `KEY_HOME` and `KEY_END` as the shifted variants for
LEFT and RIGHT, mirroring how UP/DOWN are wired. Full rationale and
diff: [`keyboard/firmware/Code/picocalc_keyboard/PATCH_RSHIFT_ARROWS.md`](../keyboard/firmware/Code/picocalc_keyboard/PATCH_RSHIFT_ARROWS.md).

The Linux kernel driver in [`keyboard/picocalc_kbd/`](../keyboard/picocalc_kbd/)
already maps scancodes `0xD2` → `KEY_HOME` and `0xD5` → `KEY_END`, so
once the patched firmware is flashed, RSHIFT+left/right "just work"
without any driver-side change.


## Pulling the submodule

If you cloned without `--recurse-submodules`:

```bash
git submodule update --init keyboard/firmware
```

Note: the upstream repo embeds its own submodules (LVGL, rp2040-psram,
PicoMite, etc) for unrelated tools. We do **not** init those —
`git submodule update --init` without `--recursive` only fetches the
top-level firmware fork.


## Build (Linux / macOS)

You need the Arduino IDE and one third-party library. The Arduino IDE
is the path of least resistance; CLI builds via `arduino-cli` work too
but are not documented here.

### 1. Install Arduino IDE 2.x

Either from your distro package manager (`apt install arduino`,
`brew install --cask arduino-ide`) or from
<https://www.arduino.cc/en/software>.

### 2. Add the STM32 board package

In Arduino IDE → **Preferences → Additional boards manager URLs**,
add:

```
https://github.com/stm32duino/BoardManagerFiles/raw/main/package_stmicroelectronics_index.json
```

Then **Tools → Board → Boards Manager**, search "STM32" and install
**STM32 MCU based boards** (tested with `2.10.0`).

### 3. Install the XPowersLib fork

Stock Arduino library manager will not serve the right version. Clone
manually:

```bash
git clone -b stm32f103r8t6 https://github.com/cuu/XPowersLib.git \
  ~/Arduino/libraries/XPowersLib
```

### 4. Configure the board

In Arduino IDE:

| Setting              | Value                          |
|----------------------|--------------------------------|
| Board                | Generic STM32F1 series         |
| Board part number    | `Generic F103R8Tx`             |
| Upload method        | `STM32CubeProgrammer (Serial)` |

### 5. Open the sketch

```
keyboard/firmware/Code/picocalc_keyboard/picocalc_keyboard.ino
```

Verify it compiles — **Sketch → Verify/Compile** (Cmd/Ctrl+R). The
output should be a `.bin` artifact in the build cache.


## Flash to the PicoCalc

The DIP switches that select firmware-flash mode are on the **back of
the ClockworkPi mainboard** (the AIO mainboard inside the PicoCalc
case — accessible by removing the back panel or via the case cutout
depending on revision). DIP 1 routes USB-C through the STM32's
built-in serial bootloader.

> ⚠ Power off the PicoCalc before toggling DIP switches.

### Procedure (Arduino IDE)

1. **Power off** the PicoCalc completely (long-press power until the
   green LED extinguishes).
2. **Set DIP 1 to ON.**
3. Connect a USB Type-C cable from the PicoCalc to your computer.
4. **Long-press the PicoCalc Power button** to power on. The screen
   stays blank in this mode — that's normal; the STM32 is now in serial
   bootloader mode.
5. In Arduino IDE, click **Upload** (Cmd/Ctrl+U).
6. Wait for "File downloaded successfully" in the Arduino console.
7. **Power off** the PicoCalc.
8. **Set DIP 1 back to OFF.**
9. Power on normally — patched firmware is now live.

### Alternative — Linux command line

If you have a pre-built `.bin` file (e.g. exported from Arduino's
build cache, or downloaded from
[`Bin/`](../keyboard/firmware/Bin/) in the upstream fork):

```bash
# DIP 1 ON, USB-C connected, device powered on into bootloader
sudo stm32flash -w path/to/picocalc_keyboard.ino.bin \
  -v -S 0x08000000 /dev/ttyUSB0
# DIP 1 OFF, power-cycle
```

Replace `/dev/ttyUSB0` with whatever USB-serial device appeared
(`dmesg | tail` after plug-in to confirm).

### Alternative — STM32CubeProgrammer (any OS)

Useful on Windows or when you want a GUI:

1. DIP 1 ON, USB-C connected, power-on
2. Open STM32CubeProgrammer, set port to the USB-serial device
3. **Connect**
4. Load the `.bin` at base address `0x08000000`
5. **Download**
6. **Disconnect**
7. DIP 1 OFF, power-cycle


## Verify

After flashing, rebuild + reload the Linux kernel module:

```bash
cd keyboard && sudo ./setup_keyboard.sh
```

Then test with the [`keyboard/debug`](../keyboard/debug) capture
script — RSHIFT+left should now log `Scancode 210` (`0xD2`) and
RSHIFT+right should log `Scancode 213` (`0xD5`). In `evtest`,
both combos should now produce clean `KEY_HOME` / `KEY_END` events
respectively.


## Reverting to stock

If anything goes wrong, the upstream factory `.hex` and `.bin` files
are bundled in the submodule under `keyboard/firmware/Bin/`:

- `PicoCalc_kbd_firmware_factory_v1.1.hex`
- `PicoCalc_kbd_firmware_v1.1.bin`

Flash either the same way (DIP 1 ON, write, DIP 1 OFF) to restore
factory behaviour.


## Pulling upstream changes into the patched branch

Periodically rebase the patch on top of upstream master:

```bash
cd keyboard/firmware
git fetch origin
git fetch upstream master 2>/dev/null || \
  git remote add upstream https://github.com/clockworkpi/PicoCalc.git && \
  git fetch upstream master
git rebase upstream/master
git push --force-with-lease origin fix/rshift-arrows-home-end
cd ../..
git add keyboard/firmware && git commit -m "chore: bump firmware submodule"
```
