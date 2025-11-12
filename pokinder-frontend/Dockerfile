# syntax=docker/dockerfile:1.4

FROM node:20.9.0-alpine3.18 AS deps

COPY package.json /tmp

# NOTE: We remove version number from package.json to enable caching.
RUN awk -v new_version="0.0.1" '/"version": "[^"]*"/ && !found {sub(/"version": "[^"]*"/, "\"version\": \"" new_version "\""); found=1} 1' /tmp/package.json > tmpfile && mv tmpfile /tmp/package.json

FROM node:20.9.0-alpine3.18 as build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY --from=deps /tmp/package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . ./

ARG REACT_APP_BACKEND_HOST
ENV REACT_APP_BACKEND_HOST $REACT_APP_BACKEND_HOST
ARG REACT_APP_BACKEND_PORT
ENV REACT_APP_BACKEND_PORT $REACT_APP_BACKEND_PORT
ARG REACT_APP_VERSION
ENV REACT_APP_VERSION $REACT_APP_VERSION
ARG REACT_APP_MINIO_HOST
ENV REACT_APP_MINIO_HOST $REACT_APP_MINIO_HOST
ARG REACT_APP_MINIO_PORT
ENV REACT_APP_MINIO_PORT $REACT_APP_MINIO_PORT

RUN yarn build

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
