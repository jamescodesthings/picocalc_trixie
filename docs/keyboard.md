# PicoCalc Keyboard

## Overview

Custom BBQ10-style 40% keyboard connected over I2C (address `0x1F`, bus I2C-1, GPIO2/3). The keyboard
microcontroller maintains a FIFO of key events; the Linux driver polls it at ~128 Hz via a kernel timer.

## Physical Layout

The physical keyboard has multiple sections:

Each key has a main key, a secondary function/key which is produced by right or left shift and the key. and some keys have an Alt+key function, to control stuff like brightness.

**D-pad** (top left) — 4-way directional cross
**Top function row** (to the right of the dpad above the rest of the keyboard keys) — 1st row, 5keys (F1–F5, and F6-F10, two functions per key)
**Esc/Backspace row** - 2nd row, contains esc/brk, tab/home, capslock, del/end, and backspace.
**Backtick and tilde row** - 3rd row, contains `/~, forward-slash/?, back-slash/|, -/_, =/+, [/{, ]/}.
The last two keys are used for mouse buttons in mouse mode, ] is lmb, [ is rmb (confusing but okay).
**Numbers row** - 4th row, 1-0 with secondary symbols: !,@,#,$,%,^,&,*,(,).
**QWERTY row** - 5th row, Q-P, I has an Alt+combo that produces Ins, all other keys shift+combo produces the upper-case letter.
**ASDF row** - 6th row, A-L, the rightmost key is a tall enter key which is shared with the zxcv row. No modifiers exist.
**ZXCV row** - 7th row, Z-M, with comma and period keys. The rightmost key is shared with the ASDF row as enter. Alt+comma causes the screeen to dim, Alt+period causes the screen to brighten.
**Modifiers Row** - 8th row, Left Shift(wide) is first, then Ctrl(wide), then Alt(wide). Then there's a Space key(extra wide) which has a modifier function (Alt+Space) to increase keyboard brightness. that's followed by semicolon with colon when shift is pressed, and quote with double-quote when shift is pressed. Finally, there's a wide right shift key.

### Photo reference

![Keyboard photo](./keyboard.png)

## ASCII Layout

> Layout based on the physical keyboard image. Secondary labels (small text on key faces) are
> printed on the keys but **the mechanism to produce them is currently unconfirmed** — Alt+key
> combos from older BBQ10 documentation do NOT work on this keyboard. See
> [Confirmed combos](#confirmed-key-combos) for what is known to work.

```
[todo] fucking fix this.
```
