#!/bin/bash

if [[ ${EUID} -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

set -e

MODULE_NAME=picocalc_kbd
SRC_DIR=./picocalc_kbd
DTBO_DIR=./picocalc_kbd/dts
KO_FILE=${MODULE_NAME}.ko
DTBO_FILE=${MODULE_NAME}.dtbo
UNAME=$(uname -r)
CONFIG=/boot/firmware/config.txt
OVERLAY=/boot/firmware/overlays

need_to_reboot=0

echo "* Installing dependencies"
apt-get install -y build-essential device-tree-compiler

echo "* Building kernel module (${SRC_DIR})"
make -C /lib/modules/$(uname -r)/build M=$(realpath ${SRC_DIR}) modules

echo "* Installing kernel module to system (/lib/modules/${UNAME}/extra)"
mkdir -p /lib/modules/${UNAME}/extra
cp ${SRC_DIR}/${KO_FILE} /lib/modules/${UNAME}/extra/
depmod

echo "* Installing DTBO to ${OVERLAY}/"
cp ${DTBO_DIR}/${DTBO_FILE} ${OVERLAY}/

echo "* Updating ${CONFIG}"
grep -q "^dtoverlay=${MODULE_NAME}" ${CONFIG} || {
	sed -i "1i dtoverlay=${MODULE_NAME}" ${CONFIG}
	need_to_reboot=1
}
grep -q "^dtparam=i2c_arm=on" ${CONFIG} || {
	sed -i "1i dtparam=i2c_arm=on" ${CONFIG}
	need_to_reboot=1
}

if [[ ${need_to_reboot} -eq 0 ]]; then
	echo "* Unloading and loading module: you don't have to reboot"
	[[ $(lsmod | grep -c ^${MODULE_NAME}) -ne 0 ]] && sudo rmmod ${MODULE_NAME}
	sudo modprobe ${MODULE_NAME}
else
	echo "Your ${CONFIG} file has been updated, you need to reboot!"
fi

echo "Done"

# EOF
