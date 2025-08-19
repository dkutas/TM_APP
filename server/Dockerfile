# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- Dev ----
FROM base AS dev
RUN npm install
# Feltételezve NestJS: start:dev = nest start --watch
CMD ["npm", "run", "start:dev"]

# ---- Build ----
FROM base AS build
RUN npm ci
COPY . .
# Feltételezve Nest build script: "build": "nest build"
RUN npm run build

# ---- Prod ----
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]