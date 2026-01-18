## Multi-stage Dockerfile for production Next.js app
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

# Copy source and build
COPY . .
RUN npm run build
RUN npm prune --production --silent || true

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and production deps
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/public public
COPY --from=builder /app/prisma prisma

# Do not copy .env into image; provide at runtime via env or secret

EXPOSE 3000
CMD ["npm", "start"]
