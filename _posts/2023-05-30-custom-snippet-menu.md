---
title: "Custom snippet menu"
categories:
  - Workflow
  - i3
tags:
  - Rofi
  - Snippets

last_modified_at: 2023-05-30
---

## Intro
This guide provides a rough step-by-step explanation on effectively managing snippets in Linux. This is a multipurpose snippet tool that works just as good in the linux cli for commands as for writing a multiline faq answer to someone on Slack - "Have you tried turning it off and on again?". It was originally stolen from: <https://github.com/CalinLeafshade/dots/blob/master/bin/bin/snippy.sh> and then enhanced by me to fit my workflow and needs at my current workplace.
As of now im litteraly using it for anything and everything, why spend 15-20 seconds writing a hard and complex xargs command with all the symbols involved, when you can do it in a a few seconds instead?


## Preview
The end result will be a menu where you can search through a list of snippets and then automaticly paste it into the terminal, slack, email whatever you want and have selected - all this in very few clicks. It will look something like that is the end:
![image-center](/assets/images/snippet1.png){: .align-center}

Just to illustrate here is a snippet for running batch jobs with xargs that is fairly lenghty to type
![image-center](/assets/images/snippet2.png){: .align-center}

## Prerequisites
- i3 or similar tiling window managers that are compatible with rofi\dmenu
- xsel
- xdotool
- dmenu
- rofi (optional)
- Fingers (not optional)

## Setup

### Disclaimer
I intentionally made this guide independent of any specific distribution or window manager (WM), and I didn't aim to provide an exhaustive list of all possible setup methods. The purpose of this guide is to give you a general understanding of how to accomplish the task, and it's up to you to adapt it to your preferred distribution.
From this point on i assume you have i3 installed, it is possible to replicate this on other WM's but i will not deep dive into that in this post, so for those that are running Hannah Montana or TempleOS with Gnome - you are on your own.
If you are unsure on how to install and configure I3 there is a great documentation on the Arch Wiki to get you started: <https://wiki.archlinux.org/title/i3>

### Dmenu installation
First of we need to install dmenu, this is menu tool that allows you to create a menu from anything and everything.
Installation guide for dmenu is located here: <https://wiki.archlinux.org/title/dmenu>

### Rofi installation
If you want a better looking menu than dmenu i advice you to install and check out Rofi, it is basicly a better more visually pleasing version of dmenu:
Installation instructions can be found here: <https://github.com/davatorium/rofi#installation>

### Xdotool installation
Amazing tool that is as powerfull as your imagination, installation guide found here: <https://github.com/jordansissel/xdotool#installation>

### Xsel installation
Not much to say, you need this - install it and get ready to become a cli ninja!
Installation instructions found here: <https://github.com/kfish/xsel/blob/master/INSTALL.md>

### Add Snippets
Now it is time to create some snippets, we do that by simply adding a file with a name that makes sence and reflect the contents of the snippet. You could create these files manually but i have it scripted since i create quite a few everyday.
If you want to add them manually you need to put them in ~/.config/snippets/<yoursnippet> - if you wanna do this semiautomaticly you can create this super simple script in your PATH
```bash
# vim ~/.local/bin/mksnip

#!/usr/bin/env bash
read -p "Enter the name of the snippet you want create: " snipname
vim ~/.config/snippets/$snipname
# Then proceed to write you snippet content inside this file
```

### Snippet script
To be able to create a menu from the snippets we have stored in a folder we need to add this script into our PATH and make it executable:
```bash
# vim ~/.local/bin/snippets

#!/bin/sh

# Stolen from https://github.com/CalinLeafshade/dots/blob/master/bin/bin/snippy.sh
# https://www.youtube.com/watch?v=PRgIxRl67bk

SNIPS=${HOME}/.config/snippets

FILE=`ls ${SNIPS} | /usr/bin/rofi -show run -i -dmenu`

if [ -f ${SNIPS}/${FILE} ]; then
	DATA=$([ -x "${SNIPS}/${FILE}" ] && bash "${SNIPS}/${FILE}" || head --bytes=-1 ${SNIPS}/${FILE})
	printf "$DATA" | xsel -p -i
	printf "$DATA" | xsel -b -i
	xdotool key shift+Insert
fi
```

Make both scripts executable:
```bash
chmod +x ~/.local/bin/snippets
chmod +x ~/.local/bin/mksnip
```

### I3\Dmenu
Once you have a few snippets added we can then add shortcut in i3, or you could actually call the snippet dmenu\rofi script from dmenu itself as any other executable - i like to add it to a keybind that makes sense in i3
```bash
# vim ~/.config/i3/config

bindsym $mod+s exec snippets
```

That is it! You made it all this way and once you have made the snippets, "Have you tried turning it off and on again" or "I advice you to read the fantastic manual" you litteraly made it within IT industry, clap yourself on the shoulder - you earned it. Enjoy!
