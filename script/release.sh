#!/usr/bin/env bash

# takes the tag as an argument (e.g. 0.1.0)
if [ -n "$1" ]; then
    if [[ "$1" =~ ^[0-9]{0,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        read -r -p "Are you sure to upgrade to v$1 ? [y/N] " response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
        then
            # update the version in pokinder-backend/pyproject.toml POSIX compliant
            awk -v new_version="${1#v}" '/version = "[^"]*"/ && !found {sub(/version = "[^"]*"/, "version = \"" new_version "\""); found=1} 1' pokinder-backend/pyproject.toml > tmpfile && mv tmpfile pokinder-backend/pyproject.toml
            git add pokinder-backend/pyproject.toml
            # update the version in pokinder-frontend/package.json POSIX compliant
            awk -v new_version="${1#v}" '/"version": "[^"]*"/ && !found {sub(/"version": "[^"]*"/, "\"version\": \"" new_version "\""); found=1} 1' pokinder-frontend/package.json > tmpfile && mv tmpfile pokinder-frontend/package.json
            git add pokinder-frontend/package.json
            # update the version in configuration/.env.shared POSIX compliant
            awk -v new_version="${1#v}" '/^VERSION=/ && !found {sub(/^VERSION=.*/, "VERSION=" new_version); found=1} 1' configuration/.env.shared > tmpfile && mv tmpfile configuration/.env.shared
            git add configuration/.env.shared
            # push update to github
            git commit -m "chore(release): prepare for v$1"
            git tag "v$1"
            git push --atomic origin main "v$1"
        else
            echo "Operation canceled"
        fi
    else
        echo "The version should be X.X.X"
    fi
else
	echo "Please provide a tag"
fi