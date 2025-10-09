# -----------------------------
# 1️⃣ Base Stage – Dependencies
# -----------------------------
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# -----------------------------
# 2️⃣ Build Stage
# -----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy environment variables for build-time use
COPY .env .env

# Generate Prisma client and build Next.js app
RUN npx prisma generate
RUN npm run build

# -----------------------------
# 3️⃣ Production Stage
# -----------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only the built app and necessary files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/api/ingest ./ingest  # ingest server folder


# Expose Next.js port
EXPOSE 3000
EXPOSE 8288

RUN npm install -g concurrently

# Run the production server
CMD ["concurrently", "\"npm run start\"", "\"node ingest/index.js\""]

# CMD ["npm", "run", "dev"]
# -----------------------------
