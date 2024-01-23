FROM node:18-slim AS builder
WORKDIR /app
COPY . .
# Dependency for Prisma
RUN apt-get update -y && apt-get install -y openssl
RUN npm ci
RUN npm run build

FROM node:18-slim
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app ./
# Dependency for Prisma
RUN apt-get update -y && apt-get install -y openssl
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
