# Официальный образ Node.js на Alpine (легковесный)
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --include=dev
RUN npm run build

# Для разработки (опционально)
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# Финальный образ
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "start"]