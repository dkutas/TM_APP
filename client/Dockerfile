# ---- Dev ----
FROM node:latest AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# CMD a compose-ban van

# ---- Build ----
FROM node:latest AS build
WORKDIR /app
COPY package*.json ./
RUN npm i
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE
COPY . .
# "build": "vite build"
RUN npm run build

# ---- Prod ----
FROM nginx:latest AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80