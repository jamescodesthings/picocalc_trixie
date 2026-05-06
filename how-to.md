# Setup Guide

Following these instructions you will get a fully working zerocalc.
No graphical user interface — terminal only.

Based on the [`nibheis/picocalc_trixie`](https://github.com/nibheis/picocalc_trixie) project.
Thanks to `wasdwasd0105` for the original keyboard driver and audio config.


## Step 1: Install "Raspberry Pi OS Lite (64-bit)" (Debian Trixie)

Use the Raspberry Pi Imager. You will need SSH access until setup is complete:

1. Set hostname, username, and wifi credentials
2. Enable SSH and add your public key
3. Write the image to your SD card


## Step 2: Log into your Raspberry Pi Zero 2W

Two options:

1. SSH in — find the IP address from your router
2. Connect a monitor and keyboard directly


## Step 3: Clone this repository

```bash
sudo apt install git
git clone https://github.com/jamescodesthings/picocalc_trixie.git
cd picocalc_trixie
```


## Step 4: Install display driver (panel-mipi-dbi)

Copy the firmware blob:

```bash
sudo cp display/picomipi.bin /lib/firmware/
```

Edit `/boot/firmware/config.txt` and add:

```
dtparam=spi=on
dtoverlay=mipi-dbi-spi,spi0-0,speed=70000000
dtparam=compatible=picomipi\0panel-mipi-dbi-spi
dtparam=width=320,height=320,width-mm=43,height-mm=43
dtparam=reset-gpio=25,dc-gpio=24
dtparam=backlight-gpio=18
dtparam=backlight-def-brightness=16
dtparam=clock-frequency=50
```

Edit `/boot/firmware/cmdline.txt` and append to the single line:

```
fbcon=map:1 fbcon=font:MINI4x6
```

Reboot — the display should now work.


## Step 5: Install keyboard driver

```bash
cd keyboard
chmod +x setup_keyboard.sh
sudo ./setup_keyboard.sh
```

This compiles the driver and installs it. Verify `/boot/firmware/config.txt` contains:

```
dtparam=i2c_arm=on
dtoverlay=picocalc_kbd
```

First install requires a reboot. After that, re-running `setup_keyboard.sh` hot-reloads the driver
without a reboot.

The driver repurposes the right shift key (RSHIFT) as a function layer — it never emits
`KEY_RIGHTSHIFT` to the OS. F5 toggles mouse mode (arrows = cursor movement, `[` = LMB, `]` = RMB).
See [docs/keyboard.md](docs/keyboard.md) for the full layout and macro table.

**Optional — patched keyboard firmware:** stock PicoCalc firmware silently drops
`RSHIFT + LEFT` and `RSHIFT + RIGHT`. The Linux driver above already maps the
correct scancodes (`0xD2` / `0xD5`), but they only arrive once the on-keyboard STM32
firmware is reflashed. See [docs/keyboard_firmware.md](docs/keyboard_firmware.md)
for the build + flash procedure (USB-C, DIP 1 ON, Arduino IDE upload, DIP 1 OFF).


## Step 6: Configure audio

Edit `/boot/firmware/config.txt` and add:

```
dtparam=audio=on
dtoverlay=audremap,pins_12_13
```


## Step 7: Run the install script

From the repo root:

```bash
chmod +x install
sudo ./install
```

This installs:
- User scripts to `/usr/local/bin/` (battery, wifi helpers, bluetooth, reset, shutdown, etc.)
- The `picopoweroff` systemd service (sends I2C shutdown signal to the PicoCalc board on poweroff)
- `.screenrc` to your home directory

After this, `sudo shutdown -h now` will automatically cut power to the main board after a few seconds.


## Helper scripts

Installed to `/usr/local/bin/` by the `install` script:

| Script | Description |
|--------|-------------|
| `battery` | Print battery percentage |
| `battery-supply` | Print charging status (plugged / charging / unplugged) |
| `bt-off` | Disable bluetooth via rfkill |
| `bt-on` | Enable bluetooth via rfkill |
| `picopoweroff` | Send I2C poweroff signal (called by systemd service) |
| `reboot` | Reboot now |
| `reset` | Reset terminal and reload keyboard driver |
| `scan` | List visible SSIDs |
| `shutdown` | Shutdown now |
| `wifi-connect` | Connect to a wifi network |
| `wifi-scan` | Scan for wifi networks |
| `wifi-status` | Show current wifi connection status |


## Useful packages

### Tools
```
vim
screen
bash-completion
htop
i2c-tools
ncdu
rsync
```

### Web
```
w3m
curl
httpie
```

### Music
```
alsa-utils
bluez
bluez-alsa-utils
bluez-firmware
cmus
id3v2
yt-dlp
```

### Python
```
python-is-python3
python3-venv
python3-dev
```
