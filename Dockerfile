# Multi-stage build for Node.js + Expo (Web) + Express
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the frontend (Expo static build)
# Note: EXPO_PUBLIC_DOMAIN should satisfy scripts/build.js logic
# In production, this usually should be your final domain.
ARG EXPO_PUBLIC_DOMAIN=localhost:5000
ENV EXPO_PUBLIC_DOMAIN=$EXPO_PUBLIC_DOMAIN
RUN npm run expo:static:build

# Build the backend server
RUN npm run server:build

# Final Stage
FROM node:20-slim

WORKDIR /app

# Copy built assets and server
COPY --from=builder /app/server_dist ./server_dist
COPY --from=builder /app/static-build ./static-build
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env ./.env

# Install only production dependencies
RUN npm install --omit=dev

# Environment variables
ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "run", "server:prod"]
