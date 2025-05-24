#!/bin/bash

# Check if environment argument is provided
if [ -z "$1" ]; then
  echo "Please provide an environment (development/production)"
  exit 1
fi

ENV=$1
ENV_FILE=".env.${ENV}"
TARGET_FILE=".env"

# Check if source env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Environment file $ENV_FILE does not exist"
  exit 1
fi

# Copy the environment file
cp "$ENV_FILE" "$TARGET_FILE"
echo "Switched to $ENV environment" 