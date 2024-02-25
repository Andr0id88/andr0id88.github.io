---
title: "Virtual box cli manager"
categories:
  - Workflow
tags:
  - virtualbox
  - fzf
last_modified_at: 2024-02-25
---

## Testing
This is a test to download the script:
[Download Script](/downloads/vmctl)

**Why should you care, and why should you use it?**

Without this script, the typical workflow for those familiar with Foreman and Git is as follows:
* Make changes and push them to Git.
* Log onto the hosts with SSH and stop the Puppet service.
* Open a GUI and search for the hosts you want to test the changes on.
* Change the environment using the dropdown menu.
* Return to the terminal, open an SSH session, and run puppet agent -t --noop to check if the code you just pushed to Git works as intended.
* Merge the Git branch, return to the Foreman GUI, and change the hosts back to, for example, the production environment.
* Log onto the servers with SSH and start the Puppet service again.
This workflow is cumbersome, especially when managing multiple hosts with different hostnames, as it involves frequent back-and-forth navigation in a GUI, which can be time-consuming.

This wrapper script completely transforms this process, allowing you to make these changes on as many hosts as you want quickly using FZF tab selection.
It simplifies the above workflow to the following steps:
* Make changes and push them to Git.
* Run the wrapper script and tab select the hosts for which you want to change the environment, or optionally the host group, (which by default is set not to change).
* It automatically stops the Puppet service before changing the environment.
* It also automatically opens new panes with the selected hosts and starts a puppet agent -t --noop run after the environment or host group has been changed.

A feature that will be added really soon is to automaticly start the puppet service again after the user has checked the --noop panes. Also the possibilty to change multiple diffrent environments and host groups for diffrent hosts.
Eventually it will be integrated to my "git add, commit, push" script for an even more efficent workflow - this will be explained in a future post.

## Disclaimer
This script is provided as-is without any support, and I strongly encourage you to thoroughly test it in a test environment before implementing it in a production setting.
It is designed solely with my own workflow in mind, which primarily revolves around using the CLI.
Therefore, I will not modify it to suit anyone else's workflow. However, if you have any suggestions for improvement, feel free to contact me. I will consider implementing changes if I find the ideas beneficial.

It is strongly encouraged that you use this script with the password manager pass to enable you to have the foreman password encrypted with a GPG key.
This setup is out of scope for this post but i will create another post soon about how you can set that up.
In the script included the password in clear text, i strongly encourage you not to do this in a production environment for obvious reason.

## Prerequisites
(All these can be installed on RHEL and Fedora by running the script with the --prereq flag)
- Fzf
- Jq
- Xpanes
- Tmux
- Fingers (not optional)

## Setup
Simply create a file and call it whatever you want, i called mine pwr for easy access and put it in my PATH (~/.local/bin/pwr)
Then make it executable with ```chmod +x ~/.local/bin/pwr```

```bash
#!/bin/bash

# Foreman API credentials and URL
FOREMAN_URL="https://<foremanURL>"
USERNAME="admin"
PASSWORD="<Foreman_password>"

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to display the help menu
display_help() {
    cat << EOF
Usage: $0 [OPTION]
This is a puppet wrapper script to perform tasks in foreman easily, if you are missing some packages run the script with --prereq.

Available options:

  --prereq  Check for and install missing prerequisites. Ensures jq, curl, fzf,
            and tmux-xpanes are installed on your machine.

  --help    Display this help menu and exit.

EOF
}

# Function to check and install prerequisites
check_and_install_prereqs() {
    local missing_packages=()

    # List of required packages
    local required_packages=("jq" "curl" "fzf" "xpanes")

    echo "Checking for required packages..."

    # Check each required package and add to missing list if not installed
    for pkg in "${required_packages[@]}"; do
        if ! command -v $pkg &> /dev/null; then
            echo "$pkg is not installed."
            missing_packages+=($pkg)
        fi
    done

    # If missing packages were found, attempt to install them
    if [ ${#missing_packages[@]} -ne 0 ]; then
        echo "Attempting to install missing packages..."

        # Fedora and RHEL 8+ use dnf
        sudo dnf install -y "${missing_packages[@]}"

        # Fedora and RHEL 8+ use dnf
        local pkg_manager="dnf"
    else
      echo  "All required packages are installed."
    fi
}

# Check for the --prereq argument
if [[ "$1" == "--prereq" ]]; then
    check_and_install_prereqs
    exit 0
fi

# Temporary file for host groups snapshot
HOST_GROUPS_FILE="/tmp/host_groups.json"

# Ensure jq, curl, fzf, and xpanes are installed
if ! command -v jq &> /dev/null || ! command -v curl &> /dev/null || ! command -v fzf &> /dev/null || ! command -v xpanes &> /dev/null; then
    echo -e "${RED}jq, curl, fzf, and xpanes must be installed to run this script.${NC}"
    echo "Run the script with --prereq flag to auto install prerequisites"
    exit 1
fi

# Update the host groups snapshot
update_host_groups_snapshot() {
    echo "Updating host groups snapshot..."
    curl -s -k -u $USERNAME:$PASSWORD "$FOREMAN_URL/api/hostgroups?per_page=1000" | jq '.' > "$HOST_GROUPS_FILE"
}

# Function to select multiple hosts
select_hosts() {
    echo "Fetching hosts..."
    HOSTS=$(curl -s -k -u $USERNAME:$PASSWORD "$FOREMAN_URL/api/hosts" | jq -r '.results[].name' | grep -v '^$')
    SELECTED_HOSTS=($(echo "$HOSTS" | fzf --prompt="Select hosts (use TAB to multi-select): " -m))

    if [ ${#SELECTED_HOSTS[@]} -eq 0 ]; then
        echo -e "${RED}No hosts selected. Exiting.${NC}"
        exit 0
    fi
}

select_environment() {
    ENVIRONMENTS=$(curl -s -k -u $USERNAME:$PASSWORD "$FOREMAN_URL/api/environments" | jq -r '.results[].name')

    # Display current environments for each selected host
    echo "Current environments for selected hosts:"
    for HOST in "${SELECTED_HOSTS[@]}"; do
        HOST_ENV=$(curl -s -k -u $USERNAME:$PASSWORD "$FOREMAN_URL/api/hosts?search=${HOST}" | jq -r ".results[] | select(.name==\"${HOST}\") | .environment_name")
        echo "${HOST}: ${HOST_ENV:-'Not Available'}"
    done

    # After displaying, prompt to select a new environment
    echo "Press Enter to continue to environment selection..."
    read  # Wait for user to acknowledge

    SELECTED_ENVIRONMENT=$(echo "$ENVIRONMENTS" | fzf --prompt="Select a new environment: ")

    if [ -z "$SELECTED_ENVIRONMENT" ]; then
        echo "Environment selection was cancelled or failed. No changes will be made to environments."
        SELECTED_ENVIRONMENT="unchanged"
    else
      echo -e "${RED}Changing to environment: $SELECTED_ENVIRONMENT${NC}"
    fi
}

ask_change_host_group() {
    # First, display the current host group for each selected host
    echo "Current host groups for selected hosts:"
    for HOST in "${SELECTED_HOSTS[@]}"; do
        # Fetch the current host group of the host. Adjust the URL as needed.
        CURRENT_HOST_GROUP=$(curl -s -k -u $USERNAME:$PASSWORD "$FOREMAN_URL/api/hosts/$HOST" | jq -r '.hostgroup_name // "Not Assigned"')
        echo "$HOST: $CURRENT_HOST_GROUP"
    done

    echo "Press Enter to continue to host group selection..."
    read

    read -r -p "Do you want to change the host group for all selected hosts? [y/N]: " CHANGE_HOST_GROUP
    if [[ $CHANGE_HOST_GROUP =~ ^[Yy]$ ]]; then
        HOST_GROUPS=$(jq -r '.results[] | "\(.title)"' "$HOST_GROUPS_FILE" | sort -u)
        SELECTED_HOST_GROUP=$(echo "$HOST_GROUPS" | fzf --prompt="Select a host group: ")

        if [ -z "$SELECTED_HOST_GROUP" ]; then
            echo -e "${RED}Host group selection was cancelled. No changes will be made to host groups.${NC}"
            SELECTED_HOST_GROUP="unchanged"
        else
            echo -e "${RED}Selected Host Group: $SELECTED_HOST_GROUP${NC}"
        fi
    else
        SELECTED_HOST_GROUP="unchanged"
    fi
}

stop_puppet_agent() {
    echo -e "${RED}Stopping Puppet service on selected hosts...${NC}"
    xpanes -c "ssh -t {} 'sudo systemctl stop puppet.service && systemctl status puppet'" "${SELECTED_HOSTS[@]}"
}

fetch_ids_and_update_hosts() {
    # Fetch the environment ID
    ENVIRONMENT_ID=$(curl -s -k -u $USERNAME:$PASSWORD "$FOREMAN_URL/api/environments" | jq --arg ENV_NAME "$SELECTED_ENVIRONMENT" '.results[] | select(.name==$ENV_NAME) | .id' 2>/dev/null)

    # Fetch the host group ID (if the host group change was selected)
    if [ "$SELECTED_HOST_GROUP" != "unchanged" ]; then
        HOST_GROUP_ID=$(curl -s -k -u $USERNAME:$PASSWORD "$FOREMAN_URL/api/hostgroups" | jq --arg HG_NAME "$SELECTED_HOST_GROUP" '.results[] | select(.title==$HG_NAME) | .id' 2>/dev/null)
    fi

    # Update each host
    for HOST in "${SELECTED_HOSTS[@]}"; do
        # Construct the JSON payload for the update
        JSON_PAYLOAD="{\"host\": {\"environment_id\": $ENVIRONMENT_ID"

        if [ "$SELECTED_HOST_GROUP" != "unchanged" ]; then
            JSON_PAYLOAD+=", \"hostgroup_id\": $HOST_GROUP_ID"
        fi

        JSON_PAYLOAD+="}}"

        # Fetch host ID by name
        HOST_ID=$(curl -s -k -u $USERNAME:$PASSWORD "$FOREMAN_URL/api/hosts" | jq --arg HOST_NAME "$HOST" '.results[] | select(.name==$HOST_NAME) | .id' 2>/dev/null)

        # Update the host with the new environment and/or host group
        curl -s -k -u $USERNAME:$PASSWORD -H "Content-Type: application/json" -X PUT -d "$JSON_PAYLOAD" "$FOREMAN_URL/api/hosts/$HOST_ID" >/dev/null 2>&1
    done
}

run_puppet_noop() {
    echo -e "${GREEN}Running Puppet agent in --noop mode on selected hosts...${NC}"
    xpanes -c "ssh {} 'sudo puppet agent -t --noop'" "${SELECTED_HOSTS[@]}"
}

# Parse command line options
case "$1" in
    --prereq)
        check_and_install_prereqs
        ;;
    --help)
        display_help
        ;;
    *)
        if [ -n "$1" ]; then
            echo "Unknown option: $1"
            display_help
            exit 1
        fi
            update_host_groups_snapshot
            select_hosts
            stop_puppet_agent
            select_environment
            ask_change_host_group
            fetch_ids_and_update_hosts
            run_puppet_noop
        ;;
esac

exit 0
```
