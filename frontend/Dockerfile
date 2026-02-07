# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files from current folder
COPY package*.json ./
RUN npm install

# Copy all frontend files
COPY . .

# Build Next.js app
RUN npm run build

# Stage 2: Serve the application
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Security ke liye non-root user
RUN addgroup -g 1001 -S nextjs && adduser -S nextjs -u 1001

# Zaroori files copy karein (Standard Mode)
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000

# Start command for standard build
CMD ["npm", "start"]