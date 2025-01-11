#!/bin/bash


echo "Enter the prefix of container and volume you want to stop"
read prefix
# Stop containers matching the prefix
docker container stop $(docker container ls -q --filter "name=${prefix}")

# Prune stopped containers
docker container prune -f

# Stop containers matching the prefix
docker volume rm $(docker volume ls -q --filter "name=${prefix}")

