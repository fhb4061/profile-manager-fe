# install stage
FROM node:24-alpine AS install
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

# Vite inlines import.meta.env.VITE_* at BUILD time, so every value the bundle
# needs must be present as an env var in this stage. Without these the shipped JS
# contains `undefined` for all Cognito/API config. Supply via --build-arg.
ARG VITE_COGNITO_AUTHORITY
ARG VITE_COGNITO_CLIENT_ID
ARG VITE_COGNITO_REDIRECT_URI
ARG VITE_COGNITO_POST_LOGOUT_REDIRECT_URI
ARG VITE_COGNITO_SILENT_REDIRECT_URI
ARG VITE_API_BASE_URL

ENV VITE_COGNITO_AUTHORITY=$VITE_COGNITO_AUTHORITY \
    VITE_COGNITO_CLIENT_ID=$VITE_COGNITO_CLIENT_ID \
    VITE_COGNITO_REDIRECT_URI=$VITE_COGNITO_REDIRECT_URI \
    VITE_COGNITO_POST_LOGOUT_REDIRECT_URI=$VITE_COGNITO_POST_LOGOUT_REDIRECT_URI \
    VITE_COGNITO_SILENT_REDIRECT_URI=$VITE_COGNITO_SILENT_REDIRECT_URI \
    VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ngix config stage
FROM nginx:stable-alpine AS nginx

# Copy compiled static files from Stage 1 to Nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if routing control is required
# COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
