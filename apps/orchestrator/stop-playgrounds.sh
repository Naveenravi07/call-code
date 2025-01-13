#!/bin/bash


echo "Enter the prefix of container and volume you want to stop"
read prefix
# Stop containers matching the prefix
docker container stop $(docker container ls -q --filter "name=${prefix}")

# Prune stopped containers
docker container prune -f

# Stop containers matching the prefix
docker volume rm $(docker volume ls -q --filter "name=${prefix}")

# Stop containers matching the prefix
 docker image rm $(docker image ls -q | xargs -n 1 docker image inspect --format '{{.Id}} {{.RepoTags}}' | grep "${prefix}" | awk '{print $1}')
# Remove dangling images
docker image prune -f


