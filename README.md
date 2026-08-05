# Profile Manager

> Frontend to manage your own profile

## Capabilities
- Login and Logout flow
- Can ONLY update your own profile defails
- Can ONLY update your own profile picture
- Can view other profiles
- Has a profile list view

## Install and Run
```
npm install
npm dev
```

## Docker

Vite inlines `import.meta.env.VITE_*` at **build** time, so all app config must be
passed as `--build-arg`. Omitting one ships a bundle with `undefined` in its place.

```
docker build \
  --build-arg VITE_COGNITO_AUTHORITY=https://cognito-idp.<region>.amazonaws.com/<user-pool-id> \
  --build-arg VITE_COGNITO_CLIENT_ID=<app-client-id> \
  --build-arg VITE_COGNITO_REDIRECT_URI=https://app.example.com/callback \
  --build-arg VITE_COGNITO_POST_LOGOUT_REDIRECT_URI=https://app.example.com/ \
  --build-arg VITE_COGNITO_SILENT_REDIRECT_URI=https://app.example.com/silent-renew \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  -t profile-manager-fe .
```

Local `.env` / `.env.*` files are excluded from the build context so their values
can never be inlined into a shipped image.

### Running the image

The image serves via nginx as a **non-root** user and listens on **8080**
(`nginxinc/nginx-unprivileged`), so map the port explicitly:

```
docker run -p 8080:8080 profile-manager-fe
```

`nginx.conf` handles the SPA history fallback (deep links like `/profiles` and
`/profile/:id` resolve to `index.html` instead of 404ing) and sets
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and a
`Content-Security-Policy` that uses `frame-ancestors 'none'` in place of
`X-Frame-Options`.

The CSP origins are deployment-specific, so they are **runtime** env vars
(applied by the nginx image's `envsubst` template mechanism at container start —
no rebuild needed). Each defaults to empty, which leaves a `'self'`-only policy:

| Variable | Purpose | Example |
| --- | --- | --- |
| `CSP_API_ORIGIN` | Backend API — `connect-src` | `https://api.example.com` |
| `CSP_COGNITO_ORIGIN` | Cognito issuer/authority; OIDC discovery + JWKS — `connect-src`, `frame-src` | `https://cognito-idp.eu-west-1.amazonaws.com` |
| `CSP_COGNITO_HOSTED_UI_ORIGIN` | Cognito Hosted UI domain; token endpoint and the silent-renew iframe — `connect-src`, `frame-src`, `form-action` | `https://myapp.auth.eu-west-1.amazoncognito.com` |
| `CSP_MEDIA_ORIGIN` | S3/CloudFront serving profile photos; also the direct upload target — `img-src`, `connect-src` | `https://cdn.example.com` |

```
docker run -p 8080:8080 \
  -e CSP_API_ORIGIN=https://api.example.com \
  -e CSP_COGNITO_ORIGIN=https://cognito-idp.eu-west-1.amazonaws.com \
  -e CSP_COGNITO_HOSTED_UI_ORIGIN=https://myapp.auth.eu-west-1.amazoncognito.com \
  -e CSP_MEDIA_ORIGIN=https://cdn.example.com \
  profile-manager-fe
```

Getting these wrong breaks auth quietly: omitting the Hosted UI origin from
`frame-src` disables `automaticSilentRenew` (it renews in a hidden iframe), and
omitting it from `connect-src` blocks the token exchange.