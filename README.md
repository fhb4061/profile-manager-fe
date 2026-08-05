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