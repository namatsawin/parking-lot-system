FROM node:18-alpine3.17 AS builder
RUN mkdir -p /app
WORKDIR /app
COPY package*.json ./
RUN npm install -g rimraf
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine3.17 as production
RUN mkdir -p /app
WORKDIR /app
COPY --from=builder /app/.env ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/schema.prisma ./
COPY --from=builder /app/seed.ts ./
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/migrations ./migrations/
COPY --from=builder /app/dist/ ./dist/
EXPOSE 3000
CMD npx prisma migrate deploy && npm run start:prod