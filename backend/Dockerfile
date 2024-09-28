# Stage 1: build codepair backend
# Start from the node base image
FROM node:alpine3.18 AS builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy the source from the current directory to the Working Directory inside the container
COPY . .

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

# Install dependencies
RUN pnpm ci

# Build codepair backend
RUN pnpm run build

# Stage 2: copy build outputs and dependencies for actual image
FROM node:alpine3.18

# Set the Current Working Directory inside the container
WORKDIR /app

# Get and copy the build outputs from the builder stage
COPY --from=builder /app ./

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

# Download Korean font for Puppeteer
RUN mkdir /usr/share/fonts/nanumfont && \
    wget http://cdn.naver.com/naver/NanumFont/fontfiles/NanumFont_TTF_ALL.zip && \
    unzip NanumFont_TTF_ALL.zip -d /usr/share/fonts/nanumfont && \ 
    fc-cache -f -v

# Set the environment variables
ENV NODE_ENV production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

# Expose port 3000 to the outside world
EXPOSE 3000

# Run the backend server
CMD ["pnpm", "run", "start:prod"]
