FROM node:18-alpine3.16 AS build-step

# Update latest security patches (CACHED - rarely changes)
RUN apk update && apk upgrade

# SET default APP_BUILD_DIR path (CACHED - never changes)
ARG APP_BUILD_DIR=/src/app
ARG APP_SERVE_DIR=/store-ui

# Create APP_BUILD_DIR path (CACHED - never changes)
RUN mkdir -p $APP_BUILD_DIR
RUN mkdir -p $APP_SERVE_DIR

# Change working directory (CACHED - never changes)
WORKDIR $APP_BUILD_DIR

# Copy package.json first (CACHED - unless dependencies change)
COPY package.json package-lock.json* ./

# Install dependencies (CACHED - unless package.json changes)
RUN npm install --legacy-peer-deps

# Copy configuration files (CACHED - unless config changes)
COPY public/ ./public/
COPY *.json ./
COPY *.js ./
COPY *.ts ./
COPY *.html ./

# Copy ONLY src/ folder (REBUILDS - when src changes)
COPY src/ ./src/

# Build application (REBUILDS - when src changes)
RUN npm run build

FROM nginx:1.21.6-alpine
COPY nginx.conf /etc/nginx/nginx.conf
ARG APP_BUILD_DIR=/src/app
ARG APP_SERVE_DIR=/store-ui
COPY --from=build-step $APP_BUILD_DIR/build $APP_SERVE_DIR