---
title: "Virtual box cli manager"
categories:
  - Workflow
tags:
  - virtualbox
  - fzf
last_modified_at: 2024-02-25

intro:
  - excerpt: "Here are some pictures that illustrate how some of the features looks like in action, the script itself is quite self explanatory."

feature_row:
  - image_path: /assets/images/vmctl1.png
    title: "Simple menu"
    excerpt: "Simple and easy to use"
  - image_path: /assets/images/vmctl2.png
    title: "Control multiple vm's"
    excerpt: "Start stop multiple vm's with a few keystrokes"
  - image_path: /assets/images/vmctl3.png
    title: "Snapshot mgmt"
    excerpt: "Take snapshots, revert to snapshot quick and easy"
---

## Intro

**Why should you care, and why should you use it?**
This script as many of my other wrapper scripts is simply to save time, be more efficent!
It lets you control VM's directly from the CLI and it is really easy to use.

Im a big fan of using vagrant for spinning up vm's on the fly and then destroying them easily.
With that said i have a home lab in which i want things to be running permanently in VM's, for this usecase i want the extra features of virtualbox such as snapshots and so on.

Same as my other scripts i still have some improvment ideas i will implement in the future, those will be documented in the top of the script as like this```# changelog: <changes made> ```
And if you have any ideas on how to improve this, feel free to contact me.

## Prerequisites
(All these can be installed on RHEL and Fedora by running the script with the --prereq flag)
- Fzf
- Virtualbox
- VM's in virtual box
- Fingers (not optional)

## Preview

{% include feature_row id="intro" type="center" %}
{% include feature_row %}

## Setup
Simply create a file and call it whatever you want, i called mine vmctl for easy access and put it in my PATH (~/.local/bin/vmctl)
Or download the script directly from [this link](/downloads/vmctl)
Then make it executable by running this command ```chmod +x ~/Downloads/vmctl && mv ~/Download/vmctl ~/.local/bin/vmctl```

You are then able to run the script from anywere by using the ```vmctl``` command.
From here you can start\stop multiple vm's by tab selecting them with fzf.
You can also take and delete snapshots and revert to snapshots - it will automaticly filter out hosts that does not have snapshots from the list.

```bash
#!/bin/bash
# Description: Tool to easily control VM's from the CLI
# License: MIT License
# Written by: André Hansen
# Github: https://github.com/Andr0id88
# Linkedin: www.linkedin.com/in/andré-hansen-77914a1a1

# Color variables
reset=$'\e[0m'
green=$'\e[1;32m'
yellow=$'\e[1;33m'
red=$'\e[1;31m'

# Check for fzf and offer to install if not found
if ! command -v fzf &> /dev/null; then
    echo "fzf could not be found."

    read -r -p "Would you like to install fzf? [Y/n] " response
    response=${response:-Y}  # Default value is Y
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
    then
        echo "${yellow}Attempting to install fzf...${reset}"

        # git clone and install fzf
        git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
        ~/.fzf/install

        # After installation, you may want to check if fzf is available
        if ! command -v fzf &> /dev/null; then
            echo "${red}Installation failed. Please install fzf manually.${reset}"
            exit 1
        fi
    else
        echo "${red}Installation cancelled. fzf is required to run this script.${reset}"
        exit 1
    fi
fi

# Catch SIGINT (Ctrl+C) and exit gracefully
trap 'echo -e "\nProgram terminated by user."; exit' SIGINT

main_menu() {
  choice=$(printf "Start VM\nStop VM\nTake Snapshot\nRevert to Snapshot\nDelete Snapshot\nList Snapshots\nExit\n" | fzf --prompt="Select an action> " --height=40% --layout=reverse) || exit

  case $choice in
    "Start VM") start_vm ;;
    "Stop VM") stop_vm ;;
    "Take Snapshot") take_snapshot ;;
    "Revert to Snapshot") revert_snapshot ;;
    "Delete Snapshot") delete_snapshot ;;
    "List Snapshots") list_snapshots ;;
    "Exit") clean_exit ;;
    *) echo "Invalid option or action cancelled."; main_menu ;;
  esac
}

start_vm() {
  # Get all VMs
  mapfile -t all_vms < <(VBoxManage list vms | cut -d '"' -f2)

  # Get running VMs
  mapfile -t running_vms < <(VBoxManage list runningvms | cut -d '"' -f2)

  # Filter out running VMs to get only the powered off VMs
  powered_off_vms=()
  for vm in "${all_vms[@]}"; do
    if [[ ! " ${running_vms[*]} " =~ $vm ]]; then
      powered_off_vms+=("$vm")
    fi
  done

  if [ ${#powered_off_vms[@]} -eq 0 ]; then
    echo -e "${yellow}All VMs are currently running.${reset}"
    main_menu
    return
  fi

  selected_vms=$(printf "%s\n" "${powered_off_vms[@]}" | fzf --prompt="Start VM(s)> " --height=40% --layout=reverse -m)

  if [ -z "$selected_vms" ]; then
    echo -e "${yellow}Action cancelled.${reset}"
    main_menu
    return
  fi

  clear # Clear the screen before showing the VM start output
  for vm in $selected_vms; do
    echo -e "${yellow}Waiting for VM \"$vm\" to power on...${reset}"
    if VBoxManage startvm "$vm" --type headless >/dev/null; then
      echo -e "${green}VM \"$vm\" has been successfully started.${reset}"
    else
      echo -e "${red}Failed to start VM \"$vm\".${reset}"
    fi
  done
  echo
  main_menu
}

stop_vm() {
  # Fetch only running VMs
  mapfile -t running_vms < <(VBoxManage list runningvms | cut -d '"' -f2)
  if [ ${#running_vms[@]} -eq 0 ]; then
    echo -e "${red}No running VMs found.${reset}"
    main_menu
    return
  fi

  selected_vms=$(printf "%s\n" "${running_vms[@]}" | fzf --prompt="Stop VM(s)> " --height=40% --layout=reverse -m)

  if [ -z "$selected_vms" ]; then
    echo -e "${yellow}Action cancelled.${reset}"
    main_menu
    return
  fi

  while IFS= read -r vm; do
    VBoxManage controlvm "$vm" poweroff >/dev/null 2>&1  # Suppress command output
    echo -e "${green}$vm stopped.${reset}"
  done <<< "$selected_vms"
  main_menu
}

take_snapshot() {
  mapfile -t my_vms < <(VBoxManage list vms | cut -d '"' -f2)
  vm=$(printf "%s\n" "${my_vms[@]}" | fzf --prompt="Snapshot> " --height=40% --layout=reverse)

  if [ -z "$vm" ]; then
    echo -e "${red}Action cancelled.${reset}"
    main_menu
    return
  fi

  read -rp "Enter snapshot name: " snap_name
  VBoxManage snapshot "$vm" take "$snap_name" >/dev/null 2>&1
  echo -e "${green}Snapshot '$snap_name' taken for $vm.${reset}"
  main_menu
}

delete_snapshot() {
  # Filter VMs to only those with snapshots
  vms_with_snapshots=()
  while IFS= read -r line; do
    vm=$(echo "$line" | cut -d '"' -f2)
    if VBoxManage snapshot "$vm" list &>/dev/null; then
      vms_with_snapshots+=("$vm")
    fi
  done < <(VBoxManage list vms)

  if [ ${#vms_with_snapshots[@]} -eq 0 ]; then
    echo -e "${red}No VMs with snapshots found.${reset}"
    main_menu
    return
  fi

  vm=$(printf "%s\n" "${vms_with_snapshots[@]}" | fzf --prompt="Select VM to delete snapshot from> " --height=40% --layout=reverse)
  if [ -z "$vm" ]; then
    echo -e "${red}Action cancelled.${reset}"
    main_menu
    return
  fi

  # Proceed to select and delete snapshot
  snapshots=($(VBoxManage snapshot "$vm" list --machinereadable | grep '^SnapshotName=' | cut -d'=' -f2 | tr -d '"'))
  if [ ${#snapshots[@]} -eq 0 ]; then
    echo -e "${yellow}No snapshots found for $vm.${reset}"
    main_menu
    return
  fi

  snapshot_name=$(printf "%s\n" "${snapshots[@]}" | fzf --prompt="Select Snapshot to delete> " --height=40% --layout=reverse)
  if [ -z "$snapshot_name" ]; then
    echo -e "${red}Action cancelled.${reset}"
    main_menu
    return
  fi

  VBoxManage snapshot "$vm" delete "$snapshot_name" >/dev/null 2>&1
  echo -e "${green}Snapshot '$snapshot_name' deleted from $vm.${reset}"
  main_menu
}

revert_snapshot() {
  # Filter VMs to only those with snapshots
  vms_with_snapshots=()
  while IFS= read -r line; do
    vm=$(echo "$line" | cut -d '"' -f2)
    if VBoxManage snapshot "$vm" list &>/dev/null; then
      vms_with_snapshots+=("$vm")
    fi
  done < <(VBoxManage list vms)

  if [ ${#vms_with_snapshots[@]} -eq 0 ]; then
    echo "No VMs with snapshots found."
    main_menu
    return
  fi

  vm=$(printf "%s\n" "${vms_with_snapshots[@]}" | fzf --prompt="Select VM to revert> " --height=40% --layout=reverse)
  if [ -z "$vm" ]; then
    echo "Action cancelled."
    main_menu
    return
  fi

  # Fetch snapshots for the selected VM
  mapfile -t snapshots < <(VBoxManage snapshot "$vm" list --machinereadable | grep '^SnapshotName=' | cut -d'=' -f2 | tr -d '"')

  if [ ${#snapshots[@]} -eq 0 ]; then
    echo "No snapshots found for $vm."
    main_menu
    return
  fi

  snapshot_name=$(printf "%s\n" "${snapshots[@]}" | fzf --prompt="Select Snapshot> " --height=40% --layout=reverse)

  if [ -n "$snapshot_name" ]; then
    VBoxManage snapshot "$vm" restore "$snapshot_name"
    echo "Snapshot '$snapshot_name' reverted for $vm."
  else
    echo "Action cancelled."
  fi
  main_menu
}

list_snapshots() {
  # Fetch all VMs
  mapfile -t all_vms < <(VBoxManage list vms | cut -d '"' -f2)

  if [ ${#all_vms[@]} -eq 0 ]; then
    echo -e "${yellow}No VMs found.${reset}"
    return
  fi

  echo -e "${green}Listing all snapshots for each VM:${reset}"

  for vm in "${all_vms[@]}"; do
    echo -e "\n${yellow}VM: $vm${reset}"

    # Fetch snapshots for the VM
    snapshots=$(VBoxManage snapshot "$vm" list)

    if [ -z "$snapshots" ]; then
      echo -e "${red}No snapshots found for $vm.${reset}"
    else
      echo "$snapshots"
    fi
  done
  main_menu
}

# Stores all currently installed VMs into an array
my_vms=()
while IFS= read -r line; do
  my_vms+=( "$line" )
done < <(VBoxManage list vms | cut -d '"' -f2)

clean_exit() {
  echo -e "${GREEN}Exiting program. Goodbye!${reset}"
  exit 0
}

main_menu
```
