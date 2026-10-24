# ==============================================================================
# Dynamics 365 Healthcare Management System - Production Dockerfile
# Lightweight, secure, zero-dependency Node.js Alpine container
# ==============================================================================

FROM node:20-alpine AS runner

# Set production environment flags
ENV NODE_ENV=production
ENV PORT=3000

# Set workspace directory
WORKDIR /app

# Ensure proper permissions and non-root user setup
# Alpine node image comes with an unprivileged 'node' user (uid 1000)
COPY package.json ./
COPY server.js ./
COPY frontend/ ./frontend/
COPY backend/ ./backend/
COPY tests/ ./tests/

# Fix ownership for non-root runtime security
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose HTTP application port
EXPOSE 3000

# Native healthcheck using built-in alpine wget against server's /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the Node.js HTTP server
CMD ["node", "server.js"]
