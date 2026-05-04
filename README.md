# picocalc_trixie

Following these instructions, you will get a fully working 'zerocalc'.
NOTE: no graphical user interface.

This project uses partly the `https://github.com/wasdwasd0105/picocalc-pi-zero-2` project.
Thanks to `wasdwasd0105` for his initial design (keyboard driver and audio).


## Step 1: Install "Raspberry Pi OS lite (64 Bit)" (Debian Trixie) using the Raspberry Pi Imager

You will need to connect to the Raspbery Pi Zero 2W using `ssh` until the setup is complete, so:

1. Set up your username and wifi credentials
2. Enable ssh (and add you public key)
3. Write the image to your SD card

## Step 2: Log into you Raspberry Pi zero 2W

There are 2 ways to access your Raspberry Pi zero 2W:

1. Use `ssh`. You will get the IP address of your Pi by checking your router
2. Connect the Pi to a monitor and a keyboard


## Step 3: Clone this repository

When you logged in, install `git`, clone the repository and enter the directory:
```
sudo apt install git
git clone https://github.com/nibheis/picocalc_trixie.git
cd picocalc_trixie
```

## Step 4: Install display driver (panel_mipi_dbi)

1. Copy the firmware:
```
sudo cp display/picomipi.bin /lib/firmware/
```

1. Update the Pi's config.txt (`/boot/firmware/config.txt`)
Activate the SPI interface for the display:
```
dtparam=spi=on
```
Insert the driver's configuration:
```
dtoverlay=mipi-dbi-spi,spi0-0,speed=70000000,backlight-def-brightness=16
dtparam=compatible=picomipi\0panel-mipi-dbi-spi
dtparam=width=320,height=320,width-mm=43,height-mm=43
dtparam=reset-gpio=25,dc-gpio=24
dtparam=backlight-gpio=18
dtparam=clock-frequency=50
```

2. Set up the framebuffer configuration in the kernel command line `/boot/firmware/cmdline.txt`; add the following parameters at the end of the line:
```
fbcon=map:1 fbcon=font:MINI4x6
```
After the next reboot, the PicoCalc display should be working.


## Step 5: Install keyboard driver (picocal_kbd)

Enter the `keyboard` directory and execute the driver installation script:
```
cd keyboard
chmod +x setup_keyboard.sh
sudo ./setup_keyboard.sh
```
This script will compile and install the driver. This driver has been modified to suppress the 'mouse' mode (by pressing the right shift key).
If, for whatever reason you need to have this 'mouse' mode back, check the .c file in the source code and uncomment the section mentioning key 0xA3 (RIGHT_SHIFT).

Check the `/boot/firmware/config.txt` file, it should contain:
```
dtparam=i2c_arm=on
dtoverlay=picocalc_kbd
```
The first time changing the configuration, you have to reboot to get the keyboard driver working.
To change and test the driver in the future, you just have to run the `setup_keyboard.sh` again, it will automatically load the new driver.

## Step 6: Configure audio

Edit `/boot/firmware/config.txt` config file and add:

```
dtparam=audio=on
dtoverlay=audremap,pins_12_13
```

## Step 7: make the Pi turn off the main board when powering off
As `root`, create `/usr/local/bin/picopoweroff` with:
```
#!/bin/bash
i2cset -yf 1 0x1f 0x8e 0x00
```
And make it executable:
```
sudo chmod +x /usr/local/bin/picopoweroff
```

Create a systemd service `/usr/lib/systemd/system/picopoweroff.service` that will be triggered during poweroff:
```
[Unit]
Description=shutdown PicoCalc
Conflicts=reboot.target
DefaultDependencies=no
After=shutdown.target
Requires=shutdown.target

[Service]
Type=oneshot
RemainAfterExit=true
ExecStart=/usr/local/bin/picopoweroff

[Install]
WantedBy=shutdown.target
```

Complete the systemd service setup:
```
sudo systemctl daemon-reload
sudo systemctl enable picopoweroff.service
```

Check status:
```
sudo systemctl status picopoweroff.service
○ picopoweroff.service - Shutdown PicoCalc
     Loaded: loaded (/usr/lib/systemd/system/picopoweroff.service; enabled; preset: enabled)
     Active: inactive (dead)
```
The service should be enabled and inactive - it is only triggered during shutdown.

Now, when you execute:
```
sudo shutdown -h now
```
your PicoCalc should automatically turn off after a few seconds.

## Step 8: battery

To check the battery level, create the following script `~/bin/battery`:

```
#!/bin/bash
percent=$(cat /sys/firmware/picocalc/battery_percent)
[[ ${percent} -gt 100 ]] && percent=$((percent-128))
[[ -t 1 ]] && echo ${percent} || echo -n ${percent}
# EOF
```
Make it executeable:
```
chmod +x ~/bin/battery
```

To check the power supply status, create the following script `~/bin/supply`:
```
#!/bin/bash

percent=$(cat /sys/firmware/picocalc/battery_percent)
if [[ ${percent} -gt 100 ]]; then
	if [[ -t 1 ]]; then
	       echo "plugged"
	else
		if [[ ${percent} -ge 228 ]]; then
			echo -n 'F'
		else
			echo -n 'C'
		fi
	fi
else
	[[ -t 1 ]] && echo "unplugged"
fi

# EOF
```
Make it executeable:
```
chmod +x ~/bin/supply
```

## Some helper scripts
In the directory `user_bin`, you will find some helper scripts that you might find useful:

1. `battery` (see above)
1. `btoff`: turn off bluetooth (with `rfkill`)
1. `bton`: turn on bluetooth (with `rfkill`)
1. `reboot`: reboot now
1. `reset`: reset terminal and reload keyboard driver
1. `scan`: print a list of visible SSIDs
1. `shutdown`: shutdown not
1. `supply` (see above)

## Some useful packages

### tools
```
vim
screen
bash-completion
htop
i2c-tools
ncdu
rsync
```
### web
```
w3m
curl
```
### music
```
alsa-utils
bluez
bluez-alsa-utils
bluez-firmware
cmus
id3v2
yt-dlp
```
### python
```
python-is-python3
python3-venv
python3-dev
```
