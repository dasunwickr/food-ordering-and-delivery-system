# Stage 1: Build the TypeScript application
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy source and compile TypeScript to JavaScript
COPY tsconfig.json ./
COPY . .
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine

WORKDIR /app

# Copy only package files and install production dependencies
COPY --from=build /app/package*.json ./
RUN npm install --only=production

# Copy compiled code
COPY --from=build /app/dist ./dist

# Expose the service port
EXPOSE 5007

# Start the service
CMD ["node", "dist/server.js"]
