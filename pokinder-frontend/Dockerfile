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

ARG VITE_BACKEND_HOST
ENV VITE_BACKEND_HOST $VITE_BACKEND_HOST
ARG VITE_BACKEND_PORT
ENV VITE_BACKEND_PORT $VITE_BACKEND_PORT
ARG VITE_VERSION
ENV VITE_VERSION $VITE_VERSION
ARG VITE_MINIO_HOST
ENV VITE_MINIO_HOST $VITE_MINIO_HOST
ARG VITE_MINIO_PORT
ENV VITE_MINIO_PORT $VITE_MINIO_PORT

RUN yarn build

# NOTE: Alpine's nginx package is used because it ships a matching brotli module.
FROM alpine:3.20

RUN apk add --no-cache nginx nginx-mod-http-brotli \
  && ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
