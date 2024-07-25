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
RUN npm ci

# Build codepair backend
RUN npm run build

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

# Set the environment variables
ENV NODE_ENV production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

# Expose port 3000 to the outside world
EXPOSE 3000

# Run the backend server
CMD ["npm", "run", "start:prod"]
