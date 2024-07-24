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

# Dependency for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
