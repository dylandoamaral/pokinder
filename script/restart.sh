#!/bin/bash

# restart a specific service defined in docker compose by name
sudo docker compose -f docker-compose.live.yml --env-file configuration/.env.shared --env-file configuration/.env restart "$1"