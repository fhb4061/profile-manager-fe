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
# Unprivileged variant: runs as uid 101 (nginx), no root, listens on 8080.
FROM nginxinc/nginx-unprivileged:stable-alpine AS nginx

# Copy compiled static files from Stage 1 to Nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx configuration: SPA history fallback + security headers.
# Installed as a template, not directly as conf.d/default.conf, so the image's
# entrypoint runs envsubst over it at container start and the CSP origins can be
# set per-deployment via runtime env vars.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Restrict envsubst to CSP_* so nginx runtime vars ($uri, $host, ...) survive.
ENV NGINX_ENVSUBST_FILTER="^CSP_"

# CSP origins. Defaults are empty, which degrades to a 'self'-only policy.
ENV CSP_API_ORIGIN="" \
    CSP_COGNITO_ORIGIN="" \
    CSP_COGNITO_HOSTED_UI_ORIGIN="" \
    CSP_MEDIA_ORIGIN=""

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
