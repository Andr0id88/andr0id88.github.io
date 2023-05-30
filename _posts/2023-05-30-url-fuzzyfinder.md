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

# Intro
This will describe a step by step guide on how to manage bookmarks effectively in linux. If you are like me your bookmarks toolbar probably looks like someone url-scraped the entire internett and finding the bookmark you need has become a chore.
In this simple guide i will show you a much easier way to manage bookmarks, it is unfortunatly not achived by installing a single package but on the flip side you will be able to have all your bookmarks in a textfile that is easily shared between devices using GIT.
The end result will be a menu in which you can fuzzy search through a list of bookmarks, and it will look something like this:
![image-center](/assets/images/surf.png){: .align-center}

You can even open multiple tabs at the same time by marking them ones you want to open with tab.

# Prerequisites
- i3 or similar tiling window managers that supports dropdown menu's
- Surfraw
- Tmux (optional)
- Git (optional)

# Setup

### Disclaimer
I did not want to make this distro dependent nor do i want to document every possible way there is to install this, the meaning behind this guide is to give you an idea on how to do it - and it will be up to you to make it fit you're distro of choice.
From this point on i assume you have i3 installed otherwise you should consider giving it a go since this will not work on other GUI DE's in Linux.
If you are unsure on how to install I3 there is a great documentation to be found on the Arch Wiki: <https://wiki.archlinux.org/title/i3>

### Surfraw installation
To get started we need to install surfraw, this is a CLI tool written by Julian Assange back in the day when he was nothing more than a software developer.
Depending on your distro there are diffrent ways to get this installed, since im running RHEL9 i compiled it from source. The complete installation guide for surfraw is located here:
<https://gitlab.com/surfraw/Surfraw/-/wikis/Installation>

### Fzf installation
After that we will need FZF to be able to fuzzy find our bookmarks.
This is also distro dependant so i will refer you to the installation guide for FZF which is located here:
<https://github.com/junegunn/fzf#installation>

### Add bookmarks
Now it is time to create some bookmarks, we do that by simply adding a name for our bookmarks and 1 or more spaces and the URL itself
```bash
echo "vg https://www.vg.no" >> ~/.config/surfraw/bookmarks
echo "dagbladet https://www.dagbladet.no" >> ~/.config/surfraw/bookmarks
# If you find it easier you could of course just open this file with your favorite text editor and add the bookmarks that way.
```

### Vim tricks
If you have alittle OCD like myself and little time to fiddle around with sorting the content, and the spacing between the text in this file to make it look nice - you could make vim do it automaticly for you by adding this in your vimrc config.
Note that im using nvim lua so if you are using vanilla vim\nvim use the bottom example.
```bash
# Nvim lua config
-- Sort and format bookmarks file before writing to disk
vim.cmd([[
  augroup format_bookmarks
    autocmd!
    autocmd BufWritePre ~/.config/surfraw/bookmarks :silent! sort | %!column -t
  augroup END
]])

# For vanilla vim you just need to add this:
autocmd BufWritePre ~/.config/surfraw/bookmarks :silent! sort | %!column -t
```

### Scripts
Once you have a few bookmarks added we can then add the dropdown menu for i3, to begin with we will add alittle script that will in time create our dropdown menu for us.
So open up you favorite text editor and change out the terminal variable for what you are using on your machine:
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
Then we can point to this script and create our dropdown menu inside the i3 config file:
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

If you want you can not add this file to a git bare repo and store it\share it using GIT.
In following posts i will write about how to store configfiles also refered to as dotfiles using this method.
And even create a systemd job that will automaticly sync them between machines so that you can have a identical worksurface on any given machine.
