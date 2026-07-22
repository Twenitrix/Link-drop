# Stage 1: Build the React application
FROM node:20-alpine AS build-stage

WORKDIR /app

# Install dependencies first (leverages Docker cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY . .

# Argument for passing the backend API URL during build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build for production
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:stable-alpine AS production-stage

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
