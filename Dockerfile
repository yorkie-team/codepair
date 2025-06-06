# Stage 1: build codepair backend
# Start from the node base image
FROM node:18.20.7-alpine3.21 AS base
# Set pnpm installation directory and add it to the PATH

RUN npm i -g pnpm@9

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
    ttf-freefont \
    wget \
    unzip

# Download Korean font for Puppeteer
RUN mkdir /usr/share/fonts/nanumfont && \
    wget http://cdn.naver.com/naver/NanumFont/fontfiles/NanumFont_TTF_ALL.zip && \
    unzip NanumFont_TTF_ALL.zip -d /usr/share/fonts/nanumfont && \ 
    fc-cache -f -v

# Set the environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

# Stage 2: build stage
FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN sed -i 's/"prepare": "husky install"/"prepare": ""/' ./package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpx prisma@^5.8.1 generate --schema=./backend/prisma/schema.prisma
RUN pnpm backend build
RUN pnpm deploy --filter=backend --prod /prod/backend
WORKDIR /prod/backend
RUN pnpx prisma@^5.8.1 generate

# Stage 3: deploy stage
FROM base AS backend
COPY --from=build /prod/backend /prod/backend
WORKDIR /prod/backend
EXPOSE 3000

# Run the backend server
CMD ["pnpm", "run", "start:prod"]
