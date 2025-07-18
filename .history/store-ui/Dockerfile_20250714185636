FROM node:18-alpine AS build-step

# Performance optimizations
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV GENERATE_SOURCEMAP=false
ENV INLINE_RUNTIME_CHUNK=false

ARG APP_BUILD_DIR=/src/app
ARG APP_SERVE_DIR=/store-ui

WORKDIR $APP_BUILD_DIR

# Copy package files first for better layer caching
COPY package*.json ./
COPY .npmrc ./

# Use npm ci for faster, reliable installs
RUN npm ci --silent --legacy-peer-deps

# Copy source code
COPY public/ ./public/
COPY src/ ./src/
COPY *.json *.js *.ts *.html ./

# Build the app
RUN npm run build

# Production stage
FROM nginx:1.21.6-alpine
COPY nginx.conf /etc/nginx/nginx.conf
ARG APP_BUILD_DIR=/src/app
ARG APP_SERVE_DIR=/store-ui
COPY --from=build-step $APP_BUILD_DIR/build $APP_SERVE_DIR
EXPOSE 80