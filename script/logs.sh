#!/bin/bash

sudo docker compose -f docker-compose.live.yml --env-file configuration/.env.shared --env-file configuration/.env logs --tail 50