# PicoCalc — Raspberry Pi Zero 2W Mod: Forum Wiki

**Source thread:** https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946  
**Thread opened:** 2025-06-11 | **Last post captured:** 2026-05-04 | **Total posts:** 411  
**Summary:** A comprehensive community reference extracted from the full forum thread about installing a Raspberry Pi Zero 2W (and variants) inside a ClockworkPi PicoCalc. Covers hardware wiring, adapter boards, OS setup, display drivers, keyboard drivers, software, and known bugs.

---

## Table of Contents

1. [Hardware — Wiring & Power](#hardware--wiring--power)
2. [Hardware — Adapter Boards (PCB)](#hardware--adapter-boards-pcb)
3. [Hardware — Cases & 3D Printing](#hardware--cases--3d-printing)
4. [Display](#display)
5. [Keyboard Driver](#keyboard-driver)
6. [Configuration](#configuration)
7. [Software & Applications](#software--applications)
8. [Bugs & Fixes](#bugs--fixes)
9. [Alternative SBCs](#alternative-sbcs)
10. [Ideas & Tips](#ideas--tips)
11. [Build Logs](#build-logs)

---

## Hardware — Wiring & Power

### Original Pin Connection Map (wasdwasd0105)

The original project post by the thread originator defines the wiring between the PicoCalc mainboard and the Pi Zero 2W.

![PicoCalc installed with Pi Zero 2W](https://forum.clockworkpi.com/uploads/short-url/iF1Xwixupyr4pL9Hv1MMDfRCRQ6.jpeg?dl=1)

![Pin connection diagram](https://forum.clockworkpi.com/uploads/short-url/yRJuykqVL9bFSSHLrm2RgnzN74X.jpeg?dl=1)

- Display, keyboard, and PWM audio all work.
- Full guide and drivers: https://github.com/wasdwasd0105/picocalc-pi-zero-2

> [Original post by @wasdwasd0105, post #1](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/1)

---

### Detailed Wiring Table (n602_na)

A user who wired the connection on a perfboard provided this detailed pin mapping:

```
PicoCalc                    Raspberry Pi Zero 2W
Vsys                        5V  pin2 or 4
GND                         GND pin6
LCD_DC  GP14 pin19          GP24 pin18
LCD_RST GP15 pin20          GP25 pin22
SPI1_CS GP13 pin17          GP8  pin24
SPI1_TX GP11 pin15          GP10 pin19
SPI1_SCK GP10 pin14         GP11 pin23
I2C1_SDA GP6 pin9           GP2  pin03
I2C1_SCL GP7 pin10          GP3  pin05
PWM_R (audio)               GP12
PWM_L (audio)               GP13
```

> [Original post by @n602_na, post #6](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/6)

---

### Corrected / Redrawn Schematic (sven)

A user noticed the GitHub pinout diagram was confusing due to mirrored connectors and produced a clearer redraw.

- Facing: looking straight at the back of the PicoCalc PCB (SD card slot on the left, volume control on the right).
- Pi Zero is soldered facing upward from the underside of the adapter board (connectors and processor facing away from the PicoCalc).

**Common wiring error:** Do **not** confuse `SPI1_TX` with `UART TX` — this was the most frequently reported reason for display failure on hand-wired adapters.

> [Original post by @sven, post #65](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/65)

---

### Side GPIO Connector Pinout (n602_na)

The 8-pin GPIO connector on the side of the PicoCalc maps as follows:

```
1. 3.3V
2. GP2(PicoCalc) — GP4(RasPi)  I2C SDA
3. GP3(PicoCalc) — GP5(RasPi)  I2C SCL
4. GP4(PicoCalc) — GP14(RasPi) UART Tx or NC
5. GP5(PicoCalc) — GP15(RasPi) UART Rx or NC
6. NC
7. NC
8. GND
```

> [Original post by @n602_na, post #210](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/210)

---

### PicoCalc SD Card Slot Connection (michael_mayer)

The PicoCalc's full-size SD card slot can be connected to the Pi Zero 2W via its second SPI bus (SPI0 — note SPI1 is used for the display):

```
PicoCalc pins:  SPI0_CS, SPI0_TX, SPI0_SCL, SPI0_RX, SD_DET
Pi Zero target: SPI0 (the display uses SPI1)
```

The SD slot is controlled via SPI and powered by the AXP2101. `SD_DET` is pulled up to 3V3\_OUT with a 10 kΩ resistor; as the standard wiring omits the PicoCalc's 3.3V–3V3\_OUT connection, SD card detection may require extra wiring.

> [Original post by @michael_mayer, post #215](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/215)

---

### Power: VSYS Voltage & Current

- The PicoCalc `VSYS` rail is passed directly from the batteries through a MOSFET switch (2 A limit). With fresh fully-charged cells it measures ~4.2 V; during typical use ~3.8–4.0 V.
- The Pi Zero 2W can run at this voltage (its internal DCDC runs the CPU from 3.3 V/1.8 V; the input only needs to be > ~3.4 V).
- The PMU low-battery indicator will not be accurate at these input voltages.
- **Do not** connect the Pico's USB socket for power while batteries are installed.
- For heavier loads (USB hub, WiFi dongles) a 5V boost module is recommended; several users used the **Pololu U3V40F5** (5 V, 4 A). The Adafruit PowerBoost 1000C is another option.

References:
- https://www.pololu.com/product/4012
- https://www.adafruit.com/product/2030

> Posts by @DigitalDreams (#11), @pelrun (#13), @wasdwasd0105 (#15), @n602_na (#47), @peterj (#29)

---

### I2C Repeater for Signal Integrity (n602_na)

The Pi Zero 2W's I2C lines (GP2/GP3) have an internal pull-up of ~1.8 kΩ, which is stronger than the PicoCalc's 4.7 kΩ pull-up. This can cause intermittent keyboard failures — particularly at power-on, when the battery is low, or when USB peripherals draw a peak current.

**Solution:** Use a **PCA9515** I2C repeater IC between the Pi Zero and the PicoCalc STM32.

- NXP datasheet: https://www.nxp.com/docs/en/data-sheet/PCA9515.pdf
- Akizuki PDF: https://akizukidenshi.com/goodsaffix/PCA9515.pdf
- Combined with a Pololu S9V11MA adjustable voltage regulator: https://www.pololu.com/product/2869

> [Original post by @n602_na, post #156 and #158](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/156)

---

## Hardware — Adapter Boards (PCB)

### wasdwasd0105 Original PCB

The project author iterated to a board that fits inside the original PicoCalc case with no modification to the case.

> [Original post by @wasdwasd0105, post #27](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/27)

---

### michael_mayer Adapter Board (most widely used)

A clean two-layer PCB that replaces the Pico with the Pi Zero 2W. Features:

- 40-pin header for PicoCalc, 40-pin socket for Pi Zero 2W
- Designed in KiCad 9 (Gerber files open-sourced)
- Minimum board size to fit in original case

**How to order:**
1. Download Gerber files from michael_mayer's GitHub: https://github.com/ironat/picocalc_trixie (also linked from the Printables case page)
2. Upload to JLCPCB or PCBWay; minimum order 5 boards
3. JLCPCB cost for US users: ~$5 shipped; EU users ~$7–10

**KiCad project:** Uploaded to GitHub; requires KiCad 9.

**PCBWay shared project** (no Gerber juggling needed): linked from michael_mayer's Printables page.

**Installation notes:**
- With 40 pins soldered on both boards the assembly is sturdy.
- Pi Zero sits on the **underside** of the adapter board.
- Leave ~16 mm of board-edge spacing to align the Pi Zero's USB port with the hole cut in the custom back panel.

![michael_mayer board PCB rendering](https://canada1.discourse-cdn.com/flex029/uploads/clockworkpi/original/0/00b5442c7739447752154f9ed2c9169a9cbeb3f0_2.png)

> Posts by @michael_mayer, #53, #57, #71, #91, #99, #128

---

### n602_na Relay Board (advanced, with options for I2C repeater and 5V boost)

A perfboard / custom PCB design that supports optional I2C repeater (PCA9515) and optional 5V boost module. The board can be ordered through PCBWay.

- STL/STEP files, Gerber files: on Thingiverse: https://www.thingiverse.com/thing:7064379
- Related Thingiverse back-panel case: https://www.thingiverse.com/thing:6998636
- Updated slim back-panel variant also on Thingiverse.

**Board specs (configurable):**
- Option A: direct VSYS → Pi Zero 5V (no boost; OK for light loads)
- Option B: VSYS → 5V boost (Pololu U3V40F5) → Pi Zero 5V
- Option C: as B, plus PCA9515 I2C repeater

> Posts by @n602_na, #23, #150, #192, #210, #277, #278

---

### peterj All-in-One Board

A more ambitious board including:
- Pi Zero 2W footprint (underside mount)
- 4-port USB hub (SL2.1A chipset: https://lcsc.com/product-detail/USB-ICs_CoreChips-SL2-1A_C192893.html)
- Pololu 5V boost (U3V40F5)
- SparkFun Thing Plus ESP32 connector
- Pi Camera support
- FLIR Lepton thermal camera support (via USB)

> Posts by @peterj, #29, #35, #39, #42

---

## Hardware — Cases & 3D Printing

### michael_mayer ZeroCalc Case

A replacement back panel / case for the PicoCalc that accommodates the Pi Zero adapter board sticking out from the rear.

- Printables: https://www.printables.com/model/1399739-picocalc-zero-mod-case
- Build video by michael_mayer: https://youtu.be/wgE0R1M0_ZE
- Exposes Pi GPIO pins on the rear for backpack expansions.
- Case allows access to the Pi Zero GPIO, enabling future expansion boards.

> Posts by @michael_mayer, #57, #62, #71, #83

---

### n602_na Slim Back Panel

- Full-height version: `RPZ_BK_xx.stp/.stl` — provides a side hole for accessing the Pi Zero USB port.
- Slim version (half the protrusion): `RPZ_SL_05.stp/.stl` — fits without the original case modification, but USB access is harder.
- Both files on Thingiverse: https://www.thingiverse.com/thing:7064379

> [Original post by @n602_na, post #278](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/278)

---

### Resin Printing Notes (J_2010)

Transparent resin (8001) from JLC3DP works for the case parts. The USB port hole in the case needs the connector clips widened slightly to fit. Resin is a fingerprint magnet.

> [Post by @J_2010, post #266 and #340](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/266)

---

### Cooling / Heatsink Notes

- The Pi Zero 2W runs warm in an enclosed case. Under moderate load temperatures stay manageable; under heavy load (e.g., `glxgears`) it can reach 70–80 °C.
- A 4–5 mm low-profile heatsink fits with some clearance.
- A 30 mm blower fan from an Argon THRML heatsink (Pi 5 accessory) fits between the Pi Zero and the battery holders.
- Radxa Zero 3W runs significantly hotter (see [Alternative SBCs](#alternative-sbcs)).

> Posts by @J_2010, #341, #350; @lolus, #347

---

## Display

### Display Driver Overview

The PicoCalc uses a **320×320 SPI LCD** driven by the ILI9341 (or compatible) controller. Two driver approaches have been used in this thread:

| Driver | OS compatibility | Notes |
|--------|----------------|-------|
| `fbcp-ili9341` | Bullseye (32-bit) only | Works well; no SDL2/DRM support |
| `panel-mipi-dbi-spi` (kernel driver) | Bookworm, Trixie | Recommended for modern OS; DRM-based |
| `fbtft` overlay (`ili9341`) | Bookworm (partial) | Used by some as fallback |

---

### fbcp-ili9341 Setup (Bullseye, original method)

Used by the original wasdwasd0105 guide for Raspberry Pi OS Bullseye (Legacy 32-bit).

```bash
cd ./picocalc-pi-zero-2
chmod +x ./setup_display.sh
sudo ./setup_display.sh
```

This compiles and installs `fbcp-ili9341` as a systemd service that mirrors the framebuffer to the SPI LCD at boot.

> [Post by @wasdwasd0105, GitHub: https://github.com/wasdwasd0105/picocalc-pi-zero-2]

---

### panel-mipi-dbi-spi Setup (Bookworm / Trixie, recommended)

Discovered and documented by @michael_mayer; this uses the upstream Linux kernel driver — no custom C code required.

**1. Generate the firmware init blob:**

```bash
git clone https://github.com/notro/panel-mipi-dbi/
cd panel-mipi-dbi/
./mipi-dbi-cmd picomipi.bin picomipi.txt
sudo cp picomipi.bin /lib/firmware/
```

The `picomipi.txt` init sequence is also in the `picocalc_trixie` GitHub repo.

**2. `/boot/firmware/config.txt` additions:**

```
dtoverlay=mipi-dbi-spi,spi0-0,speed=70000000
dtparam=compatible=picomipi\0panel-mipi-dbi-spi
dtparam=width=320,height=320,width-mm=43,height-mm=43
dtparam=reset-gpio=25,dc-gpio=24
dtparam=backlight-gpio=18
dtparam=clock-frequency=50
```

- `speed=70000000` — SPI speed 70 MHz (needed for adequate frame rate; 40 Hz is too slow)
- `clock-frequency=50` — display refresh rate; 50 Hz works; needed to resolve Pico-8 low-FPS warning

**3. `/boot/firmware/cmdline.txt` — append to existing line:**

```
fbcon=map:1 fbcon=font:MINI4x6
```

> **Important:** `fbcon=map:1` maps the console to `fb1`. If the panel is detected as `fb0` (see [Bugs & Fixes](#bugs--fixes)), use `fbcon=map:0` instead.

**Reference:** https://github.com/ironat/picocalc_trixie

> Posts by @michael_mayer, #92, #146, #166, #168, #184

---

### fbtft Fallback (Bookworm)

Some users fell back to the `fbtft` overlay when `panel-mipi-dbi-spi` had issues:

```
dtoverlay=spi0-1cs
dtoverlay=fbtft,spi0-0,ili9341
dtparam=reset_pin=25
dtparam=dc_pin=24
dtparam=width=320
dtparam=height=320
```

Note: color channel order may need `bgr=0` fix (see [Bugs & Fixes](#bugs--fixes)).

> [Post by @michael_mayer, post #92](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/92)

---

### Resolution / Scaling: HDMI and Virtual Resolution

The LCD is always 320×320. When running a desktop or Pico-8, the HDMI virtual resolution matters:

| Setting | Effect |
|---------|--------|
| `hdmi_cvt=320 320 60 1 0 0 0` | 1:1 mapping; Pico-8 runs at 2× scale (256×256) with black borders |
| `hdmi_cvt=640 640 60 1 0 0 0` | fbcp-ili9341 scales 640→320; Pico-8 runs at perfect 5× scale (640 fills screen); desktop elements are smaller |

For the `panel-mipi-dbi-spi` driver, add to `config.txt`:
```
video=SPI-1:320x320M@60
```
This helps some desktop environments correctly fit the 320×320 screen.

For fractional scaling (Wayland):
```bash
wlr-randr --output SPI-1 --scale 0.8
```

> Posts by @n602_na (#73, #79, #97), @maple (#123), @jutleys (#126), @regevt (#384, #387)

---

## Keyboard Driver

### Driver Overview

The keyboard driver is a Linux kernel module for the PicoCalc's STM32-based BBQ10-style keyboard communicating over I2C.

**Original driver:** part of https://github.com/wasdwasd0105/picocalc-pi-zero-2  
**Trixie-specific repo:** https://github.com/ironat/picocalc_trixie  
**64-bit fork (mouse mode removed):** https://github.com/nibheis/picocalc_trixie

---

### Installation — Trixie (32-bit)

```bash
# Reduce build bloat (recommended before running setup_keyboard.sh)
sudo nano /etc/apt/apt.conf.d/99local
```
Add:
```
APT::Install-Suggests "false";
APT::Install-Recommends "false";
```
Then:
```bash
cd picocalc_trixie
chmod +x setup_keyboard.sh
sudo ./setup_keyboard.sh
```
Compile time: ~40 minutes (with recommended packages disabled).

> [Post by @jblanked, post #176](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/176)

---

### Installation — Trixie / Bookworm (64-bit)

For 64-bit, the `kernel-package` apt package does not exist. Remove that line from `setup_keyboard.sh` before running:

```bash
# In setup_keyboard.sh, change the apt install block from:
sudo apt install -y build-essential raspberrypi-kernel-headers device-tree-compiler git
# To:
sudo apt install -y build-essential device-tree-compiler git
```

Or use the nibheis fork which already handles this: https://github.com/nibheis/picocalc_trixie

> Posts by @michael_mayer (#166, #170), @jblanked (#200), @Guidouil (#204), @J_2010 (#288)

---

### Installation — Bookworm (32-bit) Package Name Change

For Bookworm, `raspberrypi-kernel-headers` is replaced by `kernel-package`:

```bash
sudo apt update
sudo apt install -y \
  build-essential \
  kernel-package \
  device-tree-compiler \
  git
```

> [Post by @michael_mayer, post #166](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/166)

---

### After Kernel Updates

If `apt upgrade` installs a new kernel version, the keyboard driver `.ko` file must be either recompiled or manually copied to the new kernel module directory. Run `make clean` first to force a fresh build.

```bash
cd picocalc_trixie/keyboard/picocalc_kbd
make clean
make
sudo make install  # or re-run setup_keyboard.sh
```

> [Post by @michael_mayer, post #366](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/366)

---

### Right Shift Key / Mouse Mode

The right Shift key toggles **mouse mode**:
- Enter mouse mode: press Right Shift once (arrow keys stop working for text navigation)
- Exit mouse mode: press Right Shift again

In mouse mode:
- D-pad: move cursor
- `]`: left click / select
- `[`: right click

To disable mouse mode entirely, comment out the `0xA3` section in the keyboard driver `.c` file and recompile. The nibheis fork has this disabled by default.

> Posts by @michael_mayer (#181, #317), @jblanked (#182), @nibheis (#389)

---

### Battery Percentage (Keyboard Firmware v1.2+ Required)

Read battery level from sysfs:

```bash
cat /sys/firmware/picocalc/battery_percent
```

Value interpretation:
- `0–100`: battery percentage
- `>100` (e.g., `222`): subtract 128 → actual %; charging indicator (value > 200 means charging)
- `> 128 and ≤ 200`: subtract 128 for percentage; device is plugged in but may or may not be charging

**Python script to read and display:**

```python
import subprocess

result = subprocess.check_output(["cat", "/sys/firmware/picocalc/battery_percent"]).decode('utf-8')
percent = int(result)
if percent > 100:
    print('L' + str(percent - 128) + '%')  # 'L' = charging (from German "Laden")
else:
    print(str(percent) + '%')
```

**Requires:** PicoCalc keyboard firmware v1.2 or newer.

> [Posts by @michael_mayer, #114, #142](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/114)

---

### Battery in tmux Status Bar

```bash
tmux set-option status on
```

The `picocalc_trixie` GitHub repo includes a `~/bin/battery` script and tmux config to display battery percentage in the status bar.

To verify the script is executable:
```bash
chmod +x ~/bin/battery
```

> [Post by @michael_mayer, post #212](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/212)

---

### Battery as lxpanel Plugin (Bullseye desktop only)

A custom lxpanel plugin `picocalcbattery.so` was written by @michael_mayer:

```bash
# Copy compiled .so (32-bit Bullseye)
sudo cp picocalcbattery.so /usr/lib/arm-linux-gnueabihf/lxpanel/plugins/picocalcbattery.so
```

Available in the michael_mayer GitHub repository. **Note: only works on Bullseye.**

> [Post by @michael_mayer, post #145](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/145)

---

### Battery Percentage via conky

As an alternative to lxpanel, use `conky` to overlay the battery percentage on the desktop:

```
conky.text = [[
  ${color black} ${exec python3 /home/<user>/battery.py}
]]
```

> [Post by @n602_na, post #115](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/115)

---

## Configuration

### Recommended Full config.txt (Trixie)

```
dtparam=spi=on
dtoverlay=mipi-dbi-spi,spi0-0,speed=70000000
dtparam=compatible=picomipi\0panel-mipi-dbi-spi
dtparam=width=320,height=320,width-mm=43,height-mm=43
dtparam=reset-gpio=25,dc-gpio=24
dtparam=backlight-gpio=18
dtparam=clock-frequency=50
dtparam=i2c_arm=on
dtoverlay=picocalc_kbd
dtparam=audio=on
dtoverlay=audremap,pins_12_13
```

For Bullseye with `fbcp-ili9341`:
- Omit the `mipi-dbi-spi` and `panel-mipi-dbi-spi` lines
- Add `hdmi_cvt=320 320 60 1 0 0 0`

> Compiled from multiple posts; definitive version in https://github.com/ironat/picocalc_trixie

---

### cmdline.txt

Append to the existing single line in `/boot/firmware/cmdline.txt`:

```
fbcon=map:1 fbcon=font:MINI4x6
```

Use `fbcon=map:0` if the panel is assigned `fb0` (see [Bugs & Fixes](#bugs--fixes)).

---

### Virtual Resolution for Desktop / Pico-8

Set in `config.txt` (Bullseye / fbcp setup):
```
hdmi_cvt=640 640 60 1 0 0 0
```

Set in `config.txt` for Trixie/Bookworm desktop (helps with window sizing):
```
video=SPI-1:320x320M@60
```

---

### Keyboard Layout Fix

If the PicoCalc keyboard layout is wrong (e.g., UK layout flashed but US needed):

```bash
sudo nano /etc/default/keyboard
# Change XKBLAYOUT="gb" to XKBLAYOUT="us"
# Then reboot
```

> [Post by @jamescodesthings, post #406](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/406)

---

### Terminal Font: Terminus 6×12

The default console font is large for the 320×320 screen. Terminus 6×12 is recommended:

```bash
sudo apt install console-terminus
sudo dpkg-reconfigure console-setup
```

Select:
1. Encoding: **UTF-8**
2. Character set: **Guess optimal**
3. Font: **Terminus**
4. Size: **6×12**

> [Post by @Lachlan_Beveridge, post #235](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/235)

---

### fbterm for Nicer Fonts

`fbterm` provides better font rendering directly on the framebuffer (no X11 needed). Included in the `picocalc_trixie` GitHub repo setup.

```bash
sudo apt install fbterm
```

Note: `fbterm` must be launched from an interactive TTY, not via SSH. The error `stdin isn't an interactive tty!` means you're running it from an SSH session.

> Posts by @michael_mayer (#188), @ChrisJournoud (#313)

---

### Soft Power-Off via I2C (michael_mayer)

A script and systemd service that triggers the PicoCalc's power-off via I2C when `sudo poweroff` is called.

**Setup:**
```bash
sudo chmod +x /usr/local/bin/picopoweroff
sudo systemctl enable picopoweroff
```

**Manual test:**
```bash
picopoweroff
```

**How it works:** The service is enabled and runs at shutdown time, sending the I2C power-off command before the kernel halts. Run `sudo systemctl start picopoweroff` to trigger an immediate power-off (Linux shuts down then the PicoCalc cuts power).

**Troubleshooting:** If you get `could not open file '/dev/i2c-1'`, run `raspi-config` and re-enable I2C.

> Posts by @michael_mayer (#188, #212), @ChrisJournoud (#313, #315)

---

### Disable Swap (SD Card Longevity)

Several users asked about disabling swap to reduce SD card wear:

```bash
sudo systemctl disable dphys-swapfile
sudo swapoff -a
```

> [Post by @ChrisJournoud, post #309](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/309)

---

### Desktop Scaling for Small Screen

In LXDE/LXQt/XFCE desktop environments:
- Go to **Preferences → Display** → click **"For Smaller Screens"** preset
- Or: **Preferences → Appearance Settings → Defaults** for font/icon scaling

For Wayland (fractional scaling):
```bash
wlr-randr --output SPI-1 --scale 0.8
```

> Posts by @jblanked (#194), @wasdwasd0105 (#20), @regevt (#387)

---

### Audio

Audio works via PWM on GPIO12 (right) and GPIO13 (left). Requires:

```
dtparam=audio=on
dtoverlay=audremap,pins_12_13
```

Sound output is **stereo**. No PicoCalc-specific configuration beyond the above.

> [Post by @michael_mayer, post #105](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/105)

---

### Bluetooth Headphone Audio Stuttering Fix (nibheis)

Edit `/lib/firmware/brcm/brcmfmac43436s-sdio.raspberrypi,model-zero-2-w.txt` (filename may differ for your Pi revision):

```
# Improved Bluetooth coexistence parameters
# see https://github.com/RPi-Distro/firmware-nonfree/issues/33
btc_mode=5
btc_params8=5000
btc_params9=40000
btc_params50=0x2000
```

Eliminates BT audio stuttering while keeping WiFi functional.

> [Post by @nibheis, post #397](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/397)

---

## Software & Applications

### Recommended Base Setup (Trixie Lite, CLI-focused)

From @michael_mayer's `picocalc_trixie` repo:
- **fbterm** — better font rendering on the framebuffer
- **tmux** — terminal multiplexer; integrates battery status in the status bar
- **libegl-dev** — required for SDL2 / pygame / Pico-8 to work

```bash
sudo apt install fbterm tmux libegl-dev
```

> [Post by @michael_mayer, post #188](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/188)

---

### Pico-8

Pico-8 runs, but requires the display to be at 640×640 virtual resolution for fullscreen (5× integer scale = 640 pixels, no black border):

```
hdmi_cvt=640 640 60 1 0 0 0
```

At 320×320, Pico-8 runs at 2× scale with borders.

**SDL2 fix:** Install `libegl-dev` or Pico-8 will fail to start even with correct drivers:
```bash
sudo apt install libegl-dev
```

Running from CLI (without desktop): Use `./pico8_dyn` with the `fbcp-ili9341` driver or `panel-mipi-dbi-spi` + framebuffer SDL target.

Display performance: Set `speed=70000000` and `clock-frequency=50` in config.txt to achieve ≥30 FPS.

> Posts by @reynolds_live (#118, #121, #125, #133), @maple (#123), @michael_mayer (#184), @jblanked (#213)

---

### RetroArch

RetroArch works; Game Boy games confirmed working.

> [Post by @reynolds_live, post #216](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/216)

---

### ScummVM

ScummVM works on the setup.

> [Post by @reynolds_live, post #218](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/218)

---

### Decker (HyperCard-like)

Decker (https://github.com/JohnEarnest/Decker) compiles and runs on the Pi Zero 2W in X11. Users created a `.deck` file calibrated for the 320×320 screen. Works with a Bluetooth mouse for drawing/scripting.

> [Post by @olav, post #357](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/357)

---

### LXDE Desktop

LXDE runs. Keyboard-only navigation is limited (no mouse pointer without a physical mouse or mouse mode enabled). Bluetooth mouse connects and works well.

```bash
sudo apt install lxde
startx
```

> Posts by @9a4db (#267, #296, #394)

---

### XFCE4 Desktop

```bash
sudo apt install xfce4
sudo apt install xfce4-goodies
startx
```

Works on Trixie 32-bit. Wayland support is experimental; most users use X11 (`startx`). Dual-screen with HDMI is not easily achievable via X11 (possible with Wayland + RPD on desktop Trixie).

> Posts by @9a4db (#320), @ChrisJournoud (#375)

---

### Multi-Screen / HDMI Output

- HDMI output mirrors the SPI LCD (same content, same resolution).
- Changing `hdmi_cvt` changes the virtual framebuffer resolution, which `fbcp-ili9341` then scales down to 320×320.
- True dual-screen (different content on HDMI and LCD) is **not supported** with `fbcp-ili9341`.
- With Wayland + RPD (Raspberry Pi Desktop), the Trixie desktop version supports dual-screen out of the box.
- X11 dual-screen is technically possible but very complex; no forum member successfully configured it.

> Posts by @n602_na (#73), @michael_mayer (#72, #322)

---

## Bugs & Fixes

### Display Shows Black Screen or Flickers Then Goes Black

**Cause 1:** Wrong OS version. The original `picocalc-pi-zero-2` scripts require **Legacy 32-bit Bullseye**. Bookworm/Trixie need the `panel-mipi-dbi-spi` approach from `picocalc_trixie`.

**Cause 2:** `fbcon=map:1` in `cmdline.txt` when the panel is on `fb0` instead of `fb1`.

**Diagnosis:**
```bash
cat /proc/fb
ls /dev/fb*
ls /dev/dri/
```

**Fix:**
```bash
dmesg | grep panel-mipi
# If it shows "fb0: panel-mipi-dbid frame buffer device", change cmdline.txt to fbcon=map:0
```

> Posts by @jblanked (#160, #161, #172), @Medved (#242)

---

### fb0 / fb1 Race Condition (nibheis)

On 64-bit Trixie, there are two DRM drivers competing (`vc4` and `panel_mipi_dbi`). Whichever wins the race gets `/dev/fb1`; if `vc4` wins, the panel ends up on `fb0` and `fbcon=map:1` points to the wrong device.

**Symptom:** Display only works ~1 in 3–4 boots.

**Working dmesg line (display OK):**
```
panel-mipi-dbi-spi spi0.0: [drm] fb1: panel-mipi-dbid frame buffer device
```

**Non-working dmesg line:**
```
panel-mipi-dbi-spi spi0.0: [drm] fb0: panel-mipi-dbid frame buffer device
```

No definitive fix documented in thread; workaround is to use `fbcon=map:0` if display is reliably on `fb0`.

> [Post by @nibheis, post #396](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/396)

---

### Wrong Colors (BGR/RGB Swap) with fbtft

**Symptom:** Colors are wrong (blue and red channels swapped).

**Fix (cmdline.txt approach):**
```
bgr=0
```

**Fix (DTS overlay approach):** Set `0x1000036` parameter to `0x00` in the init sequence (disable BGR flag).

> Posts by @markbirss (#93), @michael_mayer (#94)

---

### Keyboard Stops Working After `apt upgrade`

**Cause:** The kernel was updated; the compiled `.ko` module targets the old kernel version.

**Fix:** Recompile the keyboard driver:
```bash
cd picocalc_trixie/keyboard/picocalc_kbd
make clean
make
sudo make install
```

Or re-run `setup_keyboard.sh` from the repository.

> [Post by @michael_mayer, post #366](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/366)

---

### Keyboard Fails at Power-On / Arrow Keys Stop Working

**Cause:** I2C signal contention between the Pi Zero's strong internal pull-ups (~1.8 kΩ) and the PicoCalc's 4.7 kΩ pull-ups. Also triggered by battery running low or USB peak current spikes.

**Fix options:**
1. Add a PCA9515 I2C repeater between the Pi Zero and the PicoCalc (see [Hardware](#hardware--wiring--power))
2. Quick workaround: `rmmod picocalc_kbd && modprobe picocalc_kbd`

> Posts by @n602_na (#156), @michael_mayer (#153), @nibheis (#388)

---

### Right Shift Key Blocks Arrow Keys

This is **intentional behavior** — right Shift toggles mouse mode, during which arrow keys become mouse movement keys. Press right Shift again to return to normal keyboard mode.

To permanently disable mouse mode: see [Keyboard Driver — Right Shift Key / Mouse Mode](#right-shift-key--mouse-mode).

> Posts by @ChrisJournoud (#315), @michael_mayer (#317), @nibheis (#389)

---

### SDL2 / Pico-8 Fails to Start (no video output)

**Cause:** Missing `libegl-dev`.

```bash
sudo apt install libegl-dev
```

> [Post by @michael_mayer, post #188](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/188)

---

### picopoweroff: "could not open file '/dev/i2c-1'"

**Fix:** Re-enable I2C via `raspi-config`:
```bash
sudo raspi-config
# Interfaces → I2C → Enable
```

> [Post by @techneo, post #314](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/314)

---

### Pico-8 Low FPS Warning (< 30 fps)

**Fix:** Ensure both `speed=70000000` and `clock-frequency=50` are in `config.txt`:

```
dtoverlay=mipi-dbi-spi,spi0-0,speed=70000000
dtparam=clock-frequency=50
```

40 Hz is too slow; 50 Hz resolves the warning.

> [Post by @michael_mayer, post #184](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/184)

---

### ALT Key Auto-Applied for Yellow-Function Keys (X11 only)

**Symptom:** Under X11, keys with yellow second functions (Space, B, `<`, `>`) behave as if ALT is held. On the console, no problem.

**Status:** No fix documented in thread as of the last post.

> [Post by @olav, post #355](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/355)

---

### desktop windows open outside visible screen area

**Symptom:** Windows open with their title bar above the top edge of the 320×320 display.

**Workaround 1:** Use the "For Smaller Screens" preset in Display settings.

**Workaround 2 (Wayland):** Fractional scaling:
```bash
wlr-randr --output SPI-1 --scale 0.8
```

**Workaround 3:** Add `video=SPI-1:320x320M@60` to `config.txt`.

> Posts by @J_2010 (#383), @regevt (#384, #387)

---

### `raspberrypi-ui-mods` Breaks Keyboard Driver

Installing `raspberrypi-ui-mods` (pulls in the full Pi desktop including kernel headers) can cause the keyboard driver to stop loading. Fresh reinstall of the OS or manual driver reinstall required.

> [Post by @9a4db, post #365](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/365)

---

### mipi-dbi-spi Not Working on Radxa Zero 3W

The `panel-mipi-dbi-spi` kernel driver does not work under X11/console on the Radxa Zero 3W but does work under GNOME Wayland. Recommend using `fbtft` as the display driver on Radxa (see [Alternative SBCs](#alternative-sbcs)).

> [Post by @lolus, post #359](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/359)

---

## Alternative SBCs

### Radxa Zero 3W (lolus)

The Radxa Zero 3W (RK3566 SoC, quad-core Cortex-A55 @ 1.8 GHz, up to 8 GB RAM, eMMC) fits the same form factor as the Pi Zero 2W and offers significantly more performance.

**Display:** `fbtft` works; `panel-mipi-dbi-spi` works only under GNOME Wayland.

**DTS for fbtft (SPI3-M1):**

```dts
/dts-v1/;
/plugin/;

&spi3 {
  status = "okay";
  #address-cells = <1>;
  #size-cells = <0>;
  pinctrl-names = "default";
  pinctrl-0 = <&spi3m1_cs0 &spi3m1_pins>;
  max-freq = <50000000>;
  /* fbtft ili9341 node goes here */
};
```

**Pins used:**
```
SPI3_MOSI_M1  GPIO4_C3
SPI3_MISO_M1  GPIO4_C5
SPI3_CLK_M1   GPIO4_C2
SPI3_CS0_M1   GPIO4_C6
RESET         GPIO3_C1
DC            GPIO3_B2
```

**Heat:** Reaches ~80 °C under `glxgears`; ~40–50 °C at idle. Plan for a heatsink.

**Games confirmed:** The Binding of Isaac: Rebirth (at acceptable FPS under GNOME Wayland); Rocket League (5–7 FPS — too slow).

**Setup repo:** https://github.com/L0lus/PicoCalc-Radxa-zero-3

> Posts by @lolus, #328–#362

---

### Raspberry Pi Zero (original, no "2")

The original Pi Zero W (32-bit, single-core ARM11 @ 1 GHz) also works with the same setup using Trixie 32-bit.

- Boot time: ~50 seconds before BIOS POST, then another ~50 seconds to login prompt.
- Architecture is ARMv6; fewer packages available compared to Zero 2W's ARMv8.
- The `panel-mipi-dbi-spi` driver and keyboard driver both function correctly.
- Not recommended for desktop use; acceptable for terminal-only use cases.

> Posts by @olav (#353, #354), @Medved (#242, #243), @jasperus (#399)

---

### CM0 (RP2350-based Compute Module — markbirss)

An RP2350-based compute module (512 MB RAM, 8 GB eMMC, WiFi) was shown running:

![CM0 running 80×25 terminal on 7" display](https://canada1.discourse-cdn.com/flex029/uploads/clockworkpi/original/7/717fa70d69f2098c354471d4b1b7b9bd9e91c3e7_2.jpeg)

Would require a completely custom adapter board for the PicoCalc. KiCad files available from edatec: http://edatec.cn/storage/zip/20250920/d4be7476d8ce5a5a77f645ab08e852c5.zip

> Posts by @markbirss, #219, #221, #318

---

## Ideas & Tips

### Using SSH for Initial Setup

Configure SSH and WiFi in the Raspberry Pi Imager before flashing the SD card. Connect via SSH (`hostname.local` or IP from router DHCP list) to complete the initial setup without needing a keyboard or display attached.

> [Post by @michael_mayer, post #66](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/66)

---

### Headless Bullseye Setup

Bullseye support in Raspberry Pi Imager was removed in a late 2025 update. To use Bullseye:

- Download directly: `2023-05-03-raspios-bullseye-armhf.img.xz` from the Raspberry Pi archives
- Flash manually with Balena Etcher or `dd`
- Add `ssh` file and `wpa_supplicant.conf` to the boot partition manually for headless setup

> [Post by @n602_na, post #162](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/162)

---

### Using tmux for Multi-Window Terminal Workflow

`tmux` is recommended for CLI-only setups:
- Split-screen terminal windows
- Battery percentage in the status bar
- Survives SSH disconnections

> [Post by @michael_mayer, post #188](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/188)

---

### Kali Linux (Theoretical)

Since Kali Linux is Debian-based, the same driver installation steps should work. No confirmed reports in the thread.

> [Post by @J_2010, post #390](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/390)

---

### Extending the USB Port Outside the Case

Several builds route the Pi Zero 2W's micro-USB port to the case exterior via a short flex cable, enabling USB peripheral connections without opening the case. Using a 4-pin PH2.0 connector simplifies this.

Parts (AliExpress):
- USB port: 4P USB2.0 PH2.0 — https://nl.aliexpress.com/item/1005006362701313.html
- Wire-to-wire converter: PH 2.0mm 4 pin — https://nl.aliexpress.com/item/1005004015984711.html

> Posts by @peterj (#19), @n602_na (#187), @J_2010 (#248)

---

### Battery Life Estimates

Based on community reports:
- Idle / light use: battery lasts well (no specific hours given)
- Gaming (RetroArch): ~4 hours with dual 3500 mAh 18650 cells
- Heavy Radxa Zero 3W workloads: expected to be significantly shorter

> Posts by @J_2010 (#346), @lolus (#344)

---

### Edge-Connector Cartridge Concept

@michael_mayer proposed a modular "cartridge" design (inspired by the Handspring Visor Springboard) that would slot into the back of the PicoCalc, allowing different SBCs to be swapped without soldering.

> [Post by @michael_mayer, post #190](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/190)

---

### Virtual Desktop / Panning (X11)

`xrandr` panning was attempted but did not work:

```bash
xrandr --fb 640x480 --output Unknown19-1 --mode 320x320 --panning 640x480
# Reports error; maximum resolution is fixed at 320x320
```

Multi-screen with X11 is not achievable with this setup. Wayland (RPD or GNOME) is the path forward for dual-screen.

> [Post by @9a4db, post #356](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/356)

---

## Build Logs

### n602_na — Perfboard Relay Board Build

A detailed early build wiring the PicoCalc to a Pi Zero 2W on a hand-cut perfboard. Includes 3D-printed back cover.

Photos and instructions: https://www.thingiverse.com/thing:7064379

> [Posts by @n602_na, #6, #23, #47](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/6)

---

### jmatonis — First PCB Build

One of the first community builds using a custom board (June 2025). Initial issue: wiring reversed (VSYS to GND). After correction, measured 4.2 V on VSYS. Used michael_mayer's case.

> [Posts by @jmatonis, #10, #16, #17](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/10)

---

### peterj — USB Hub + Boost + Camera Board

Multi-month build iterating on an ambitious all-in-one board. Powered up successfully; USB hub tested working; Pi Camera and FLIR Lepton thermal camera confirmed working over USB.

![peterj board populated](https://canada1.discourse-cdn.com/flex029/uploads/clockworkpi/original/9/98af2cf398a6d690b74639f95b3c6e5427b8ec47_2.jpeg)

> [Posts by @peterj, #19, #29, #35, #39, #42](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/35)

---

### michael_mayer — PCB Design, Trixie Port, Video Tutorials

Key contributions:
- **Adapter PCB** (Gerber + KiCad 9, open-sourced)
- **`picocalc_trixie` GitHub repo** with full installation guide for Trixie
- **Two build/tutorial videos:**
  - https://youtu.be/wgE0R1M0_ZE (build video)
  - https://www.youtube.com/watch?v=A5BDa9PmUcA (Trixie tutorial)
- Power-off via I2C
- Battery lxpanel plugin (Bullseye)
- HDMI investigation

![michael_mayer PCB assembled](https://canada1.discourse-cdn.com/flex029/uploads/clockworkpi/original/2X/0/00e63cd88540d2e66d238ddb2f0845dfb12f2c23.jpeg)

> Posts by @michael_mayer throughout thread; GitHub: https://github.com/ironat/picocalc_trixie

---

### jblanked — Tutorial Video + 64-bit Confirmation

Produced a start-to-finish tutorial video covering the Trixie installation:
- https://www.youtube.com/watch?v=LvNtWaM17Pg (Trixie 32-bit)
- https://www.youtube.com/watch?v=QnYDRsfdl5k (Pico-8 on 64-bit)

Confirmed 64-bit Trixie works if the `kernel-package` line is removed from `setup_keyboard.sh`.

> [Posts by @jblanked, #177, #183, #213](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/183)

---

### nibheis — 64-bit Trixie Fork + BT Audio Fix

Forked `picocalc_trixie` with:
- `kernel-package` dependency removed (64-bit compatible)
- Mouse mode disabled in keyboard driver
- Bluetooth coexistence parameters for stutter-free BT audio

Repo: https://github.com/nibheis/picocalc_trixie

> [Posts by @nibheis, #392, #395, #397](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/392)

---

### lolus — Radxa Zero 3W on PicoCalc

Got the Radxa Zero 3W (quad-core Cortex-A55, up to 8 GB RAM) working in the PicoCalc. Used `fbtft` driver for display. Steam games (The Binding of Isaac) run at acceptable FPS under GNOME Wayland.

Repo: https://github.com/L0lus/PicoCalc-Radxa-zero-3

> [Posts by @lolus, #328–#362](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/335)

---

### jamescodesthings — May 2026 Build Summary

Most recent detailed build log (May 2026). Used nibheis 64-bit fork, ordered PCBWay boards (5 delivered to UK in 3–4 days), printed michael_mayer's case.

Blog post: https://codesthings.com/blog/2026-05-01-zerocalc.html  
Grip/stand: https://makerworld.com/en/models/2748402-picocalc-grip-stand-handle#profileId-3048876

![jamescodesthings build](https://canada1.discourse-cdn.com/flex029/uploads/clockworkpi/original/2/2/221f790de1620441ccbdc5bb06457d5c93ec0709_2.jpeg)

> [Post by @jamescodesthings, post #408](https://forum.clockworkpi.com/t/raspberry-pi-zero-2-on-picocalc/17946/408)

---

## Key GitHub Repositories

| Repository | Description |
|-----------|-------------|
| https://github.com/wasdwasd0105/picocalc-pi-zero-2 | Original project; Bullseye 32-bit drivers |
| https://github.com/ironat/picocalc_trixie | michael_mayer's Trixie port (32-bit recommended) |
| https://github.com/nibheis/picocalc_trixie | nibheis fork: 64-bit compatible, mouse mode off, BT fix |
| https://github.com/L0lus/PicoCalc-Radxa-zero-3 | Radxa Zero 3W port |
| https://github.com/notro/panel-mipi-dbi | Tool to generate MIPI DBI firmware blobs |
| https://github.com/juj/fbcp-ili9341 | fbcp-ili9341 display driver (used by Bullseye setup) |
| https://www.thingiverse.com/thing:7064379 | n602_na relay board + back panel STLs |
| https://www.printables.com/model/1399739-picocalc-zero-mod-case | michael_mayer ZeroCalc case on Printables |

---

*Document compiled from 400 forum posts, 2025-06-11 through 2026-05-04.*
