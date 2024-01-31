FROM node:alpine3.18 AS builder
WORKDIR /app
COPY . .
# Dependency for Prisma
RUN apk upgrade --update-cache --available && \
    apk add openssl && \
    rm -rf /var/cache/apk/*
RUN npm ci
RUN npm run build

FROM node:alpine3.18
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app ./
# Dependency for Prisma
RUN apk upgrade --update-cache --available && \
    apk add openssl && \
    rm -rf /var/cache/apk/*
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
