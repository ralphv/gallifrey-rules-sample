ARG NODE_VERSION=21

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app

################################################################################
# Create a stage for installing production dependecies.
FROM base AS deps

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

################################################################################
# Create a stage for building the application.
FROM deps AS build

COPY . .
RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base AS final

ENV NODE_ENV=production
USER node
COPY package.json .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./

# Run the application.
ENTRYPOINT ["npm", "run"]
CMD ["docker-start"]
