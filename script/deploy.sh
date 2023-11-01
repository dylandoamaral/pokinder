#!/bin/bash

# Build new images for pokinder applications
sudo docker compose --env-file configuration/.env build

# Deploy the different pokinder services
sudo docker compose --env-file configuration/.env up -d