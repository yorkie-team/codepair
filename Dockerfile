# Stage 1: build codepair backend
# Start from the node base image
FROM node:alpine3.18 AS base
# Set pnpm installation directory and add it to the PATH
RUN corepack enable
RUN corepack use pnpm@9

# Download dependency for Prisma
RUN apk upgrade --update-cache --available && \
    apk add openssl && \
    rm -rf /var/cache/apk/*

# Download dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set the environment variables
ENV NODE_ENV production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

# Stage 2: build stage
FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm backend db:generate
RUN pnpm backend build
RUN pnpm deploy --filter=backend --prod /prod/backend
WORKDIR /prod/backend
RUN pnpx prisma generate

# Stage 3: deploy stage
FROM base AS backend
COPY --from=build /prod/backend /prod/backend
WORKDIR /prod/backend
EXPOSE 3000

# Run the backend server
CMD ["pnpm", "run", "start:prod"]