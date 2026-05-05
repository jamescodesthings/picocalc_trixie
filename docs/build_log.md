# ZeroCalc Build Log

**Source:** https://codesthings.com/blog/2026-05-01-zerocalc.html  
**Published:** 01 May 2026  
**Author's goal:** Standalone Pico8 dev machine using a PicoCalc with a Raspberry Pi Zero 2W running Debian Trixie (64-bit). Requirements: `pico8`, display, keyboard, audio, and internet access.

---

## Hardware Components

- **PicoCalc kit** (purchased from AliExpress)
- **Raspberry Pi Zero 2WH** (Zero 2W with pre-soldered headers; the H suffix = Wifi + Headers)
- **SD card** — 32 GB or larger; author used a 128 GB Sandisk Ultra
- **Adapter board** — purchased from PCBWay (~$1 USD each, sold in packs of 5)
- **2x20 pin headers** — 2.54 mm pitch, to mount the Pi onto the adapter board
- **2x 18650 flat-top batteries** — author sourced from NuBattery (UK)
- Soldering iron and solder

### Optional soldering helpers
Two female 8-pin headers (2.54 mm pitch) used as a jig: insert the male headers into the female headers, rest the adapter board on top, solder straight.

---

## Phase 1: Flashing the SD Card

**Source:** github.com/nibheis/picocalc_trixie — Step 1

1. Download and install **Raspberry Pi Imager**.
2. Plug in the SD card and open Imager.
3. **Device:** Raspberry Pi Zero 2 W
4. **OS:** Raspberry Pi OS (other) → **Raspberry Pi OS Lite (64-bit)** (Debian Trixie port)
5. **Storage:** select your SD card
6. **Customisation:**
   - Set hostname (e.g. `zerocalc`)
   - Set locale — **keyboard layout must be `us`**
   - Set username and password
   - Configure Wi-Fi credentials (needed for SSH during setup)
   - Enable SSH, set authentication method
7. Hit **Write** and wait for it to finish.
8. Eject the SD card and insert it into the Pi Zero 2W.

---

## Phase 2: Hardware Assembly

1. Solder the 2x20 pin headers to the adapter board.
2. Solder the Pi to the adapter board.
3. Insert the flashed micro SD card into the Pi Zero 2W.
4. Plug the adapter board into the PicoCalc mainboard.
5. Insert the two 18650 batteries.
6. Screw everything together.

---

## Phase 3: Initial OS Setup

### First boot

Power on. The device may reboot a couple of times on first boot (SD expansion and initial setup) — this is normal.

### Find the device on the network

```bash
ping zerocalc.local
# or
ping zerocalc
```

### SSH in

```bash
ssh zerocalc
# with explicit username:
ssh james@zerocalc
```

### Update installed packages

```bash
sudo apt update && sudo apt upgrade -y
```

### Install git

```bash
sudo apt install git -y
```

### Clone the picocalc_trixie repo

```bash
git clone https://github.com/nibheis/picocalc_trixie.git
```

Cloned to `~/picocalc_trixie` (`/home/<username>/picocalc_trixie`).

---

## Phase 4: Display Setup

### Copy display firmware

```bash
cd picocalc_trixie
sudo cp display/picomipi.bin /lib/firmware/
```

### Enable SPI and configure the display overlay

```bash
sudo nano /boot/firmware/config.txt
```

Append to the end of the file:

```
# Enable SPI for the display
dtparam=spi=on

# Driver configuration for the display
dtoverlay=mipi-dbi-spi,spi0-0,speed=70000000
dtparam=compatible=picomipi\0panel-mipi-dbi-spi
dtparam=width=320,height=320,width-mm=43,height-mm=43
dtparam=reset-gpio=25,dc-gpio=24
dtparam=backlight-gpio=18
dtparam=clock-frequency=50
```

Driver used: kernel's built-in `panel-mipi-dbi-spi` (no custom C code).  
Display specs: 320×320, SPI0, 70 MHz, DC=GPIO24, reset=GPIO25, backlight=GPIO18.

### Configure framebuffer font in the kernel command line

```bash
sudo nano /boot/firmware/cmdline.txt
```

Append to the end of the single line (do not add a new line):

```
fbcon=map:1 fbcon=font:MINI4x6
```

### Reboot

```bash
sudo reboot
```

After reboot the display should be working. The keyboard is not yet set up.

---

## Phase 5: Keyboard Setup

**Driver:** I2C Linux kernel module (`picocalc_kbd`) based on the BBQ10 keyboard driver.

### SSH back in and navigate to the keyboard directory

```bash
cd ~/picocalc_trixie/keyboard
```

### Optional: enable mouse emulation

If mouse emulation is needed (right-shift turns arrow keys into mouse, `[`/`]` into LMB/RMB), edit the driver source before building:

```bash
sudo nano picocalc_kbd/picocalc_kbd.c
```

- Find the block at approximately lines 223–311.
- Remove the `//|` prefix from each commented-out line in that block and save.

### Build and install the keyboard driver

```bash
chmod +x setup_keyboard.sh
sudo ./setup_keyboard.sh
```

The script: compiles the module, installs the `.ko` to `/lib/modules/<uname>/extra/`, installs the device tree overlay (`.dtbo`) to `/boot/firmware/overlays/`, updates `/boot/firmware/config.txt`, and hot-reloads the module (no reboot required if config was already correct).

### Verify the keyboard config was applied

```bash
sudo cat /boot/firmware/config.txt
```

The file should now contain near the top:

```
dtparam=i2c_arm=on
dtoverlay=picocalc_kbd
```

---

## Phase 6: Audio Setup

```bash
sudo nano /boot/firmware/config.txt
```

Append to the end of the file:

```
dtparam=audio=on
dtoverlay=audremap,pins_12_13
```

Note: `dtparam=audio=on` may already be present; if so only add the `audremap` line.

### Reboot

```bash
sudo reboot
```

After this reboot, display, keyboard, and audio should all be functional.

---

## Phase 7: Optional — Terminal Font

*Source: forum comment by Lachlan_Beveridge*

For a better display experience on the 320×320 screen:

```bash
sudo dpkg-reconfigure console-setup
```

Answer the prompts as follows:

```
Encoding:       UTF-8
Character set:  Guess optimal
Font:           Terminus
Size:           6×12
```

---

## Phase 8: Optional — Fix Keyboard Layout

If the wrong keyboard layout was selected during imaging:

```bash
sudo nano /etc/default/keyboard
```

1. Find `XKBLAYOUT=`
2. Change the value to `us` (or your desired layout)
3. Save and exit
4. Reboot

---

## Phase 9: Optional — Copy Utility Scripts to PATH

```bash
cd ~/picocalc_trixie
sudo cp -r user_bin/* /usr/local/bin/
```

**Important:** one script is named `shutdown`, which conflicts with the system binary and causes an infinite loop. Rename it:

```bash
mv /usr/local/bin/shutdown /usr/local/bin/shutdown-pi
```

Alternatively, edit the script to call `/usr/sbin/shutdown` explicitly:

```bash
sudo nano /usr/local/bin/shutdown
# Change 'shutdown' to '/usr/sbin/shutdown' and save.
```

---

## Phase 10: Optional — Poweroff Service

A systemd service (`poweroff/picopoweroff.service`) is intended to signal the PicoCalc mainboard to cut power when the Pi shuts down. Installation is handled by `poweroff/install`.

Reference: https://github.com/nibheis/picocalc_trixie#step-7-make-the-pi-turn-off-the-main-board-when-powering-off

The author noted this did not work consistently for them. As a workaround: after the Pi has shut down, hold the power button for a few seconds until the green LED on the ZeroCalc turns off.

---

## Known Issues

- **The poweroff service does not currently work on this build — to be investigated separately.** The `poweroff/picopoweroff.service` systemd unit is intended to send a power-off signal to the PicoCalc mainboard when the Pi shuts down, but it has not been functioning reliably. Workaround: after OS shutdown, hold the physical power button until the green LED extinguishes.
