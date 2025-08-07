 
# Multi-Cloud GitOps Controller Dockerfile
# ESI-SBA Thesis Research - TechMart Platform
# Optimized for Azure Container Instances deployment

# Use official Node.js LTS Alpine image for smaller size and security
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
# Use npm ci for faster, reliable, reproducible builds
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p /app/logs && \
    chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 3000, path: '/health', timeout: 2000 }; \
    const request = http.request(options, (res) => { \
        if (res.statusCode == 200) process.exit(0); \
        else process.exit(1); \
    }); \
    request.on('error', () => process.exit(1)); \
    request.end();"

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Define labels for better container management
LABEL maintainer="ESI-SBA Thesis Research" \
      version="1.0.0" \
      description="TechMart Multi-Cloud GitOps Controller" \
      org.opencontainers.image.source="https://github.com/your-repo/multicloud-controller" \
      org.opencontainers.image.title="Multi-Cloud Controller" \
      org.opencontainers.image.description="Orchestrates and monitors multi-cloud microservices deployment"

# Start the application
CMD ["node", "server.js"]