#!/bin/bash

# This startup script copy-pasted into the GCP console.
# Docs: https://docs.cloud.google.com/compute/docs/containers/migrate-containers#sample-startup-scripts

# update versioning and whatnot here
CONTAINER_NAME="www"
IMAGE="us-central1-docker.pkg.dev/personal-website-405823/docker/www:20231123-061e163"

# Enable incoming traffic
iptables -A INPUT -j ACCEPT

# Stop and remove the container if it exists
docker stop "$CONTAINER_NAME" || true
docker rm "$CONTAINER_NAME" || true

# update and re-launch
docker pull "$IMAGE"
docker run \
  --name=$CONTAINER_NAME \
  --restart=always \
  --detach \
  --network="host" \
  "$IMAGE" \
  python server.py --certbot
