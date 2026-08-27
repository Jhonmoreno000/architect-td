# ============================================
# Stage 1: Build Tailwind CSS Assets
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Compile Tailwind CSS
RUN npm run build

# ============================================
# Stage 2: Production Nginx Server
# ============================================
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx server configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets and game files from builder stage
COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/src /usr/share/nginx/html/src/

# Expose standard HTTP port
EXPOSE 80

# Healthcheck to ensure container availability
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
