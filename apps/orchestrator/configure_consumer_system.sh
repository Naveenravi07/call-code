#!/bin/bash

REPO_PATH="/home/cc_orchestrator/.local/callcode"

if id -u "cc_orchestrator" > /dev/null 2>&1 ; then
    echo 'cc_orchestrator user exists'
else
    echo 'User missing. Creating cc_orchestrator'
    sudo useradd -s /bin/bash -m cc_orchestrator
fi

if [ ! -d "/home/cc_orchestrator" ]; then
    echo "Creating home directory for cc_orchestrator..."
    sudo mkdir -p /home/cc_orchestrator
    sudo chown  cc_orchestrator:cc_orchestrator /home/cc_orchestrator
fi

if [ ! -d "$REPO_PATH" ]; then
    echo "Repository directory does not exist. Cloning repository..."
    sudo -i -u cc_orchestrator bash << 'EOF'
    REPO_PATH="/home/cc_orchestrator/.local/callcode"
    mkdir -p "$REPO_PATH"
    git clone https://github.com/Naveenravi07/call-code-base-images.git "$REPO_PATH"
EOF
else
    echo "Repository directory already exists."
fi


