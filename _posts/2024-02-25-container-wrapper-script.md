---
title: "Docker/Podman cli manager"
categories:
  - Workflow
tags:
  - docker
  - podman
  - fzf
last_modified_at: 2024-02-25

intro:
  - excerpt: "Here are some pictures that illustrate how some of the features looks like in action, the script itself is quite self explanatory."

feature_row:
  - image_path: assets/images/delete-containers3.png
    title: "Multi select"
    excerpt: "Stop and delete multiple containers with minimum hassle"
  - image_path: /assets/images/start-service.png
    title: "Start services easy"
    excerpt: "Start well known services easy for testing purposes"
  - image_path: /assets/images/listcontainers.png
    title: "Auto increment"
    excerpt: "Buildt in auto increment of names and port numbers"
---

## Introduction

#### Importance and Utility
This script, like many others I have developed, is designed to enhance efficiency and save time. It provides a streamlined method for managing container lifecycles directly from the Command Line Interface (CLI) with minimal effort.

The script facilitates comprehensive control over various aspects of container management, including creation, deletion, purging, and executing operations within containers. Additionally, it features built-in support for port and name incrementation for basic service containers, facilitating simultaneous operation of multiple instances, such as multiple NGINX, without port or name conflicts. It supports the deployment of various containers, including NGINX, MySQL, MongoDB, MariaDB, and HTTPD, Portainer, with few keystrokes and without the need for CLI commands.


## Preview

{% include feature_row id="intro" type="center" %}

## Prerequisites
- Fzf
- Docker or Podman
- Fingers (not optional)

## Setup
To utilize this script, create a file with the content provided below, naming it as you prefer. For convenience, I named mine conctl and placed it in my PATH (~/.local/bin/conctl). Alternatively, the script can be downloaded directly from this link.
To make the script executable, execute the following command: ```chmod +x ~/Downloads/conctl && mv ~/Downloads/conctl ~/.local/bin/conctl```
You can then execute the script from anywhere using the ```conctl```command. This enables you to start or stop multiple containers by selecting them with fzf, among other functionalities.

```bash
#!/bin/bash
# Description: Tool to easily control containers from the CLI
# License: MIT License
# Written by: André Hansen
# Github: https://github.com/Andr0id88
# Linkedin: www.linkedin.com/in/andré-hansen-77914a1a1

# Color variables
reset=$'\e[0m'
green=$'\e[1;32m'
yellow=$'\e[1;33m'
red=$'\e[1;31m'

# Function to prompt user for container command choice
choose_container_cmd() {
    echo -e "${yellow}Both Docker and Podman are available. Please choose one:${reset}"
    select cmd in "Docker" "Podman"; do
        case $cmd in
            Docker ) echo "Docker selected."; CONTAINER_CMD="docker"; break;;
            Podman ) echo "Podman selected."; CONTAINER_CMD="podman"; break;;
            * ) echo "Invalid option. Please choose again."; continue;;
        esac
    done
}

# Initially set CONTAINER_CMD to empty
CONTAINER_CMD=""

# Detect package manager
if command -v dnf &>/dev/null; then
    PKG_MANAGER="dnf"
elif command -v yum &>/dev/null; then
    PKG_MANAGER="yum"
else
    echo -e "${red}Neither dnf nor yum could be found. Unable to install Docker or Podman.${reset}"
    exit 1
fi

# Check if Docker and Podman are available
if command -v docker &>/dev/null && command -v podman &>/dev/null; then
    # Let the user choose if both are available
    choose_container_cmd
elif command -v docker &>/dev/null; then
    # Use Docker if only Docker is available
    CONTAINER_CMD="docker"
elif command -v podman &>/dev/null; then
    # Use Podman if only Podman is available
    CONTAINER_CMD="podman"
else
    # Prompt the user to install Docker or Podman if neither is available
    echo -e "${yellow}Neither Docker nor Podman could be found on your system.${reset}"
    read -r -p "Would you like to install Docker (D) or Podman (P)? [D/P] " install_choice
    case $install_choice in
        [Dd]* )
            echo "Installing Docker..."
            sudo $PKG_MANAGER clean all
            sudo $PKG_MANAGER install docker -y
            CONTAINER_CMD="docker"
            ;;
        [Pp]* )
            echo "Installing Podman..."
            sudo $PKG_MANAGER clean all
            sudo $PKG_MANAGER install podman -y
            CONTAINER_CMD="podman"
            ;;
        * )
            echo -e "${red}Invalid selection. Exiting.${reset}"
            exit 1
            ;;
    esac
fi

# Check for fzf and offer to install if not found
if ! command -v fzf &> /dev/null; then
    echo "${yellow}fzf could not be found.${reset}"

    # Default to Yes if the user presses enter without giving an answer:
    read -r -p "Would you like to install fzf? [Y/n] " response
    response=${response:-Y}  # Default value is Y
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
    then
        echo "${yellow}Attempting to install fzf...${reset}"

        # Git clone and install fzf
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

echo "Using ${CONTAINER_CMD} for container management."

start_container() {
  echo -e "${yellow}Select container(s) to start (use TAB to multi-select):${reset}"
  containers=($($CONTAINER_CMD ps -a --format "{{.Names}}" | fzf --prompt="Start Container(s)> " --height=40% --layout=reverse -m))

  for container in "${containers[@]}"; do
    echo "Starting $container..."
    $CONTAINER_CMD start "$container"
    echo -e "${green}Container $container started.${reset}"
  done

  main_menu
}

stop_container() {
  echo -e "${yellow}Select container(s) to stop (use TAB to multi-select):${reset}"
  containers=($($CONTAINER_CMD ps --format "{{.Names}}" | fzf --prompt="Stop Container(s)> " --height=40% --layout=reverse -m))

  for container in "${containers[@]}"; do
    echo "Stopping $container..."
    $CONTAINER_CMD stop "$container"
    echo -e "${green}Container $container stopped.${reset}"
  done

  main_menu
}

list_containers() {
  echo -e "${green}All Containers:${reset}"
  $CONTAINER_CMD ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
  main_menu
}

list_images() {
  echo -e "${green}Available Images:${reset}"
  $CONTAINER_CMD images --format "table {{.Repository}}:{{.Tag}}\t{{.Created}}\t{{.Size}}"
  main_menu
}

exec_into_container() {
  echo -e "${yellow}Select a container to exec into:${reset}"
  container=$($CONTAINER_CMD ps --format "{{.Names}}" | fzf --prompt="Exec Container> " --height=40% --layout=reverse)
  if [ -n "$container" ]; then
    # Attempting to directly start an interactive shell inside the container
    # The -it flag ensures the session is interactive and provides a pseudo-TTY
    echo -e "${green}Attempting to start an interactive shell inside $container...${reset}"

    # Use 'docker exec -it' or 'podman exec -it' to start the shell
    if $CONTAINER_CMD exec -it "$container" /bin/bash 2>/dev/null || $CONTAINER_CMD exec -it "$container" /bin/sh; then
      echo -e "${green}Started an interactive session in $container.${reset}"
    else
      echo -e "${red}Failed to start an interactive session in $container. The container might not have a shell available.${reset}"
    fi
  else
    echo -e "${yellow}Action cancelled.${reset}"
  fi
  main_menu
}

delete_container() {
  echo -e "${yellow}Select container(s) to delete (use TAB to multi-select):${reset}"
  containers=($($CONTAINER_CMD ps -a --format "{{.Names}}" | fzf --prompt="Delete Container(s)> " --height=40% --layout=reverse -m))

  if [ ${#containers[@]} -eq 0 ]; then
    echo -e "${yellow}Action cancelled.${reset}"
    main_menu
    return
  fi

  # Check if any selected containers are running
  running_containers=()
  for container in "${containers[@]}"; do
    if [[ $($CONTAINER_CMD inspect --format '{{.State.Running}}' "$container") == "true" ]]; then
      running_containers+=("$container")
    fi
  done

  # If there are running containers selected, ask if the user wants to stop them first
  if [ ${#running_containers[@]} -ne 0 ]; then
    echo "Some selected containers are running."
    read -r -p "Would you like to stop them before deletion? [Y/n] " response
    response=${response:-Y}  # Default is Yes
    if [[ "$response" =~ ^([yY][eE][sS]|[yY]|)$ ]]; then
      for container in "${running_containers[@]}"; do
        echo "Stopping $container..."
        $CONTAINER_CMD stop "$container"
        echo -e "${green}Container $container stopped.${reset}"
      done
    fi
  fi

  # Proceed to delete the containers
  for container in "${containers[@]}"; do
    echo "Deleting $container..."
    $CONTAINER_CMD rm "$container"
    echo -e "${green}Container $container deleted.${reset}"
  done

  main_menu
}

delete_image() {
  echo -e "${yellow}Select image(s) to delete (use TAB to multi-select):${reset}"
  images=($($CONTAINER_CMD images --format "{{.Repository}}:{{.Tag}}" | fzf --prompt="Delete Image(s)> " --height=40% --layout=reverse -m))

  for image in "${images[@]}"; do
    # Attempt to delete the image
    if ! output=$($CONTAINER_CMD rmi "$image" 2>&1); then
      echo "$output"
      if [[ "$output" == *"image is in use by a container"* ]]; then
        echo -e "${yellow}The image $image is in use by one or more containers.${reset}"
        # Prompt the user, defaulting to Yes
        read -r -p "Would you like to stop and remove all containers using this image? [Y/n] " response
        response=${response:-Y}  # Default is Yes
        if [[ "$response" =~ ^([yY][eE][sS]|[yY]|)$ ]]; then  # Match empty response as 'Yes'
          # Find and remove containers using the image
          container_ids=$($CONTAINER_CMD ps -a --filter "ancestor=$image" --format "{{.ID}}")
          for cid in $container_ids; do
            echo "Stopping container $cid..."
            $CONTAINER_CMD stop "$cid"
            echo "Removing container $cid..."
            $CONTAINER_CMD rm "$cid"
          done
          # Try to delete the image again
          echo "Attempting to delete the image $image again..."
          if $CONTAINER_CMD rmi "$image"; then
            echo -e "${green}Image $image deleted.${reset}"
          else
            echo -e "${red}Failed to delete the image after removing containers. There might be other dependencies.${reset}"
          fi
        else
          echo -e "${yellow}Image deletion cancelled by user.${reset}"
        fi
      else
        echo -e "${red}Failed to delete image $image. Error: $output${reset}"
      fi
    else
      echo -e "${green}Image $image deleted.${reset}"
    fi
  done

  main_menu
}

purge_all() {
  # Remove all stopped containers
  echo "Removing all stopped containers..."
  $CONTAINER_CMD container prune -f
  echo -e "${green}All stopped containers have been removed.${reset}"

  # Check if there are any running containers
  running_containers=$($CONTAINER_CMD ps --format "table {{.ID}}\t{{.Image}}\t{{.Names}}")
  if [ ! -z "$running_containers" ]; then
    echo -e "${yellow}The following containers are running:${reset}"
    echo "$running_containers"

    # Prompt to stop all running containers and delete all images
    read -r -p "Found running containers. Do you want to stop them and delete all images? [y/N] " stop_and_delete_response
    stop_and_delete_response=${stop_and_delete_response:-N}

    if [[ "$stop_and_delete_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
      # Secondary confirmation
      read -r -p "Are you really sure you know what you are doing? [y/N] " really_sure_response
      really_sure_response=${really_sure_response:-N}

      if [[ "$really_sure_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        # Stop all running containers
        echo "Stopping all running containers..."
        $CONTAINER_CMD stop $($CONTAINER_CMD ps -q)

        # Remove all containers to ensure images can be deleted
        echo "Removing all containers..."
        $CONTAINER_CMD rm $($CONTAINER_CMD ps -a -q)

        # Remove all images
        echo "Removing all images..."
        $CONTAINER_CMD rmi $($CONTAINER_CMD images -q) -f
        echo -e "${green}All containers and images have been removed.${reset}"
      else
        echo -e "${yellow}Aborted the removal of all containers and images.${reset}"
      fi
    fi
  else
    echo -e "${green}No running containers found. Proceeding with image deletion...${reset}"
    # Attempt to remove images directly
    echo "Removing all images..."
    $CONTAINER_CMD rmi $($CONTAINER_CMD images -q) -f
    echo -e "${green}All images have been removed.${reset}"
  fi

  main_menu
}

view_container_logs() {
  echo -e "${yellow}Select a container to view logs:${reset}"
  container=$($CONTAINER_CMD ps -a --format "{{.Names}}" | fzf --prompt="View Logs for Container> " --height=40% --layout=reverse)

  if [ -z "$container" ]; then
    echo -e "${yellow}Action cancelled.${reset}"
    main_menu
    return
  fi

  # Display the logs for the selected container
  echo -e "${green}Showing logs for container $container:${reset}"
  $CONTAINER_CMD logs "$container"

  # Wait for user input before returning to the main menu
  read -p "Press [Enter] key to return to main menu..."
  main_menu
}

# Create an image (snapshot) from a container
snapshot_container() {
  echo -e "${yellow}Select a container to snapshot:${reset}"
  container=$($CONTAINER_CMD ps -a --format "{{.Names}}" | fzf --prompt="Snapshot Container> " --height=40% --layout=reverse)
  if [ -n "$container" ]; then
    read -rp "Enter snapshot (image) name: " image_name
    $CONTAINER_CMD commit "$container" "$image_name"
    echo -e "${green}Snapshot from container $container created as image $image_name.${reset}"
  else
    echo -e "${yellow}Action cancelled.${reset}"
  fi
  main_menu
}

start_service_container() {
  # Define base ports for each service
  declare -A base_ports=( [mysql]=3300 [nginx]=8000 [httpd]=8051 [mariadb]=3351 [mongodb]=27017 [portainer]=9000 )

  echo -e "${yellow}Select service(s) to start (use TAB to multi-select):${reset}"
  services=$(printf "MySQL\nNginx\nHTTPd\nMariaDB\nMongoDB\nPortainer" | fzf --prompt="Select Service(s)> " --height=40% --layout=reverse -m)

  IFS=$'\n' read -r -d '' -a selected_services <<< "$services"

  for service in "${selected_services[@]}"; do
    service_key=$(echo "${service,,}" | sed 's/httpd/httpd/') # Normalize service key
    base_port=${base_ports[$service_key]}
    base_name="my_${service_key}"
    counter=1
    name="${base_name}_$counter"

    # Find the next available port
    while $CONTAINER_CMD ps -a --format "{{.Ports}}" | grep -q "0.0.0.0:$base_port->"; do
      ((base_port++))
    done

    # Find the next available name
    while $CONTAINER_CMD ps -a --format "{{.Names}}" | grep -qw "$name"; do
      ((counter++))
      name="${base_name}_$counter"
    done

    echo "Starting $service container with name $name..."
    case $service in
      MySQL )
        echo -e "${green}Starting MySQL container....${reset}"
        $CONTAINER_CMD run -d --name "$name" -e MYSQL_ROOT_PASSWORD=test123 -p $base_port:3306 mysql:latest
        echo -e "${green}$service started as $name. Connect using port $base_port with password 'test123': mysql -h localhost -P $base_port -u root -p${reset}"
        ;;
      Nginx )
        echo -e "${green}Starting Nginx container....${reset}"
        $CONTAINER_CMD run -d --name "$name" -p $base_port:80 nginx:latest
        echo -e "${green}$service started as $name. Access via http://localhost:$base_port${reset}"
        ;;
      HTTPd )
        echo -e "${green}Starting httpd container....${reset}"
        $CONTAINER_CMD run -d --name "$name" -p $base_port:80 httpd:latest
        echo -e "${green}$service started as $name. Access via http://localhost:$base_port${reset}"
        ;;
      MariaDB )
        echo -e "${green}Starting MariaDB container....${reset}"
        $CONTAINER_CMD run -d --name "$name" -e MYSQL_ROOT_PASSWORD=test123 -p $base_port:3306 mariadb:latest
        echo -e "${green}MariaDB started as $name. Connect using port $base_port with password 'test123': mysql -h localhost -P $base_port -u root -p${reset}"
        ;;
      MongoDB )
        echo -e "${green}Starting MongoDB container....${reset}"
        $CONTAINER_CMD run -d --name "$name" -p $base_port:27017 mongo:latest
        echo -e "${green}$service started as $name. Connect using port $base_port${reset}"
        ;;
      Portainer )
        echo -e "${green}Starting Portainer container....${reset}"
        $CONTAINER_CMD run -d --name "$name" -p $base_port:9000 --privileged portainer/portainer-ce
        echo -e "${green}$service started as $name. Access via http://localhost:$base_port${reset}"
        ;;
      * )
        echo -e "${red}Unsupported service selected. Skipping.${reset}"
        ;;
    esac
  done

  main_menu
}

main_menu() {
  choice=$(printf "List Containers\nList Images\nStart Container\nStop Container\nSnapshot Container\nExec into Container\nDelete Container\nDelete Image\nPurge All\nStart Service Container\nView Container Logs\nExit\n" | fzf --prompt="Select an action> " --height=40% --layout=reverse) || exit

  case $choice in
    "List Containers") list_containers ;;
    "List Images") list_images ;;
    "Start Container") start_container ;;
    "Stop Container") stop_container ;;
    "Snapshot Container") snapshot_container ;;
    "Exec into Container") exec_into_container ;;
    "Delete Container") delete_container ;;
    "Delete Image") delete_image ;;
    "Purge All") purge_all ;;
    "Start Service Container") start_service_container ;;
    "View Container Logs") view_container_logs ;;
    "Exit") exit 0 ;;
    *) echo -e "${red}Invalid option or action cancelled.${reset}"; main_menu ;;
  esac
}

# Start the script
main_menu
```
