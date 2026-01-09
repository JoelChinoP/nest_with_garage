# 1: Build Dependencies Stage
FROM node:22-bookworm-slim AS build-deps
WORKDIR /app

# Install dependencies based on the presence of package-lock.json
COPY package*.json ./
RUN npm ci --no-audit --no-fund --legacy-peer-deps;

# 2: Production Dependencies Stage
FROM node:22-bookworm-slim AS prod-deps
WORKDIR /app

# Install dependencies based on the presence of package-lock.json
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund --legacy-peer-deps;


# 3: Build Stage
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY . .

# Copy dependencies from the previous stage
COPY --from=build-deps /app/node_modules ./node_modules

# Build the application
RUN npm run build


# 3: Runtime Stage
FROM gcr.io/distroless/nodejs22-debian12 AS production
WORKDIR /app

# Set environment variables
ARG NODE_ENV=production
ARG APP_PORT=8080
ENV APP_PORT=${APP_PORT}
ENV NODE_ENV=${NODE_ENV}

# Copy only necessary files from the build stage
COPY --from=build /app/dist/src ./
COPY --from=build /app/package*.json ./
COPY --from=prod-deps /app/node_modules ./node_modules

# User setup for security, expose port and define entrypoint
USER nonroot:nonroot
EXPOSE ${APP_PORT}
CMD ["main.js"]

#CMD ["ls -la && env","dist/main.js"]