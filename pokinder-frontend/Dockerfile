# build environment
FROM node:20.9.0-alpine3.18 as build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json yarn.lock ./
RUN yarn add react-scripts@5.0.1 -g --silent
COPY . ./

ARG REACT_APP_BACKEND_PORT
ENV REACT_APP_BACKEND_PORT $REACT_APP_BACKEND_PORT
ARG REACT_APP_BACKEND_HOST
ENV REACT_APP_BACKEND_HOST $REACT_APP_BACKEND_HOST

RUN yarn build

# production environment
FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
