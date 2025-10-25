# Stage 1 — build
FROM node:20-alpine AS builder
WORKDIR /app

# Install build deps
COPY package*.json ./
RUN npm ci

# Copy source & build
COPY . .
# If using TypeScript, build to dist
RUN npm run build

# Stage 2 — runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only production deps (from builder)
COPY --from=builder /app/package*.json ./
RUN npm ci --production

# Copy built files
COPY --from=builder /app/dist ./dist
# Copy non-TS runtime assets (uploads, openapi.json, etc.)
COPY --from=builder /app/openapi.json ./openapi.json
# If you use uploads directory in container (recommended to use volume instead), copy or create
# COPY --from=builder /app/uploads ./uploads

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000
CMD ["node", "dist/server.js"]