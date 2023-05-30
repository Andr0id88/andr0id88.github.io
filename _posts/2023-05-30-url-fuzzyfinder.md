---
title: "Fuzzyfinder for bookmarks"
categories:
  - Web
  - Linux
  - i3
tags:
  - i3
  - Workflow
last_modified_at: 2023-05-30
---

## Intro
This guide provides a step-by-step explanation on effectively managing bookmarks in Linux. If your bookmarks toolbar resembles someone that have been web scraping the entire internet, finding the bookmark you need can be a tedious task. However, in this straightforward guide, I will demonstrate a much simpler method of managing bookmarks. Unfortunately, achieving this requires installing multiple packages. On the positive side, you will be able to store all your bookmarks in a text file that can be easily shared across devices using Git, you will be able to find your bookmarks with a minimal amount of keypresses even if you have hundreds of them.


## Preview
The end result will be a menu where you can perform a fuzzy search through a list of bookmarks and open multiple tabs at once even. This menu can be opened on any screen above your current program with 2 keys, also removed by the same keybinding or automaticly when you use it, it will look something similar to this in the end:
![image-center](/assets/images/surf.png){: .align-center}

## Prerequisites
- i3 or similar tiling window managers that supports dropdown menu's
- Surfraw
- Fzf
- Tmux (optional)
- Git (optional)
- Fingers (not optional)

## Setup

### Disclaimer
I intentionally made this guide independent of any specific distribution or window manager (WM), and I didn't aim to provide an exhaustive list of all possible setup methods. The purpose of this guide is to give you a general understanding of how to accomplish the task, and it's up to you to adapt it to your preferred distribution.
From this point on i assume you have i3 installed, it is possible to replicate this on other WM's but i will not deep dive into that in this post, so for those that are running Hannah Montana or TempleOS with Gnome - you are on your own.
If you are unsure on how to install and configure I3 there is a great documentation on the Arch Wiki to get you started: <https://wiki.archlinux.org/title/i3>

### Surfraw installation
First of we need to install surfraw, this is a CLI tool written by Julian Assange back in the day when he was nothing more than a software developer.
Installation guide for surfraw is located here: <https://gitlab.com/surfraw/Surfraw/-/wikis/Installation>

Add your browser of choice into the config file:
vim .config/surfraw/conf
```bash
SURFRAW_text_browser=w3m
SURFRAW_graphical_browser=firefox
SURFRAW_graphical=yes
```

### Fzf installation
After that we will need FZF to be able to fuzzy find our bookmarks.
The installation guide for FZF is located here: <https://github.com/junegunn/fzf#installation>

### Add bookmarks
Now it is time to create some bookmarks, we do that by simply adding a name for our bookmarks and 1 or more spaces and the URL itself
```bash
# If you find it easier you could of course just open this file with your favorite text editor and add the bookmarks that way.
echo "suckless https://suckless.org/" >> ~/.config/surfraw/bookmarks
echo "archwiki https://wiki.archlinux.org/ " >> ~/.config/surfraw/bookmarks
```

### Vim tricks
If you have alittle OCD like myself and little time to fiddle around with sorting the content, and the spacing between the text in this file to make it look nice - you could make vim do it automaticly for you by adding this in your vimrc config.
```bash
# Example Nvim lua config
-- Sort and format bookmarks file before writing to disk
vim.cmd([[
  augroup format_bookmarks
    autocmd!
    autocmd BufWritePre ~/.config/surfraw/bookmarks :silent! sort | %!column -t
  augroup END
]])

# For vanilla vim users add this:
autocmd BufWritePre ~/.config/surfraw/bookmarks :silent! sort | %!column -t
```

### Scripts
Once you have a few bookmarks added we can then add the dropdown menu for i3, to begin with we will add a script that will in time create our dropdown menu for us.
Open up you favorite text editor and change out the terminal variable for what you are using on your machine:
vim ~/.local/bin/ddspawn
```bash
#!/bin/sh

# Toggle floating dropdown terminal in i3, or start if non-existing.
# $1 is    the script run in the terminal.
# All other args are terminal settings.
# Terminal names are in dropdown_* to allow easily setting i3 settings.
TERMINAL=st

[ -z "$1" ] && exit

script=$1
shift
if xwininfo -tree -root | grep "(\"dropdown_$script\" ";
then
    echo "Window detected."
    i3 "[instance=\"dropdown_$script\"] scratchpad show; [instance=\"dropdown_$script\"] move position center"
else
    echo "Window not detected... spawning."
    i3 "exec --no-startup-id $TERMINAL -n dropdown_$script $@ -e $script"
fi
```

We then need to create the actuall dropdown menu we will use later, this is also a script and i am personally using TMUX for this but that part is optional:
If you havent installed Tmux you can do this by going here: <https://github.com/tmux/tmux/wiki/Installing>
```bash
#!/bin/bash
tmux new-session -d -s bookmarks 'bookmarks=$(cat ~/.config/surfraw/bookmarks | sed '\''/^$/d'\'' | sort -n | fzf -m -i); if [ -n "$bookmarks" ]; then echo "$bookmarks" | xargs -I {} surfraw {} &>/dev/null; fi'
tmux attach -t bookmarks
```

If you dont wanna use tmux, simply remove the tmux part of the script like this:
```bash
#!/bin/bash
bookmarks=$(cat ~/.config/surfraw/bookmarks | sed '\''/^$/d'\'' | sort -n | fzf -m -i); if [ -n "$bookmarks" ]; then echo "$bookmarks" | xargs -I {} surfraw {} &>/dev/null; fi
```

Once you made this script - make it executable:
```bash
chmod +x ~/.local/bin/ddspawn
chmod +x ~/.local/bin/surfdd
```

### I3 config
Now we can point to this scripts and create our dropdown menu inside the i3 config file:
vim ~/.config/i3/config
```bash
# #---Basic Definitions---# #
for_window [class="^.*"] border pixel 2
set $term --no-startup-id $TERMINAL
set $mod Mod4

# #---Dropdown Windows---# #
for_window [instance="dropdown_surfdd"] resize set 1400 700
for_window [instance="dropdown_surfdd"] border pixel 2
bindsym $mod+w exec ddspawn surfdd
```

If you want you can now add this bookmark file to a git bare repo and store\share it using GIT to other machines.
In following posts i will write about how to store configfiles also refered to as dotfiles using this method, so stay tuned!.
And even create a systemd job that will automaticly sync them between machines so that you can have a identical workflow on any given machine with minimum hazzle of setting it up.
