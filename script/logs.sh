#!/bin/bash

sudo docker compose --env-file configuration/.env --env-file configuration/.env.shared logs --tail 50