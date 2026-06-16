# install stage
FROM node:20-alpine AS install
WORKDIR /app

# copy package management files and install dependencies
COPY package*.json ./
RUN npm ci

# copy all file for later stages
COPY . .

# test stage
FROM install AS test
CMD ["npm", "run", "test"]

# build stage
FROM install AS build
RUN npm run build

# ngix config stage
FROM nginx:stable-alpine AS nginx

# Copy compiled static files from Stage 1 to Nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if routing control is required
# COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
