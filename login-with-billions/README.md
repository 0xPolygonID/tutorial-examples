# Billions Login Service

A Reference implementation implementing secure did based authentication using Billions Network.

## Overview

This service provides a complete authentication flow leveraging Billions's zero-knowledge proof system. Users authenticate by clicking a universal link that opens the Billions wallet, offering a privacy-preserving authentication.

## Directories

- `static/`: Frontend assets for the demo UI. Served by Express via `app.use(express.static('./static'))` in `index.js`.

### API Endpoints

- `GET /api/sign-in` – Starts the login flow and returns an authorization request, which is encoded to embed in the universal link
- `POST /api/callback` – Receives the wallet response and verifies the user's DID using the js-iden3-auth library
- `GET /api/auth-status` – Checks whether the session has completed authentication

## Quick Start

### Local Development with ngrok

Since Billions wallets require public HTTPS access for authentication callbacks, use ngrok for local development:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your server:**
   ```bash
   # Install dependencies
   npm install
   
   # Start the server
   node index.js
   ```

3. **Expose with ngrok (in another terminal):**
   ```bash
   ngrok http 8080
   ```

4. **Update the hostUrl in `index.js`:**
   ```javascript
   // Replace with your ngrok URL
   const hostUrl = "https://your-ngrok-url.ngrok-free.app";
   ```

5. **Restart the server and access via ngrok URL**

### Using Your Own Public API

If you have your own public API endpoint:

1. **Deploy your service** to your preferred cloud provider (AWS, Google Cloud, etc.)

2. **Update the hostUrl:**
   ```javascript
   const hostUrl = "https://your-api-domain.com";
   ```

3. **Ensure HTTPS is enabled** for secure wallet communication

---

## Going Production-Ready

This example uses an in-memory `Map` (`requestMap`) to store pending auth requests and completed authentication results. This data is lost on restart and cannot be shared across multiple server instances. Below is guidance on what to replace before going live.

### Session storage — use Redis

`requestMap` holds two kinds of short-lived entries:

- `sessionId` → pending auth request (created at sign-in, deleted after callback)
- `sessionId_authenticated` → verified auth response (polled by the frontend)

Redis is a natural fit for both: it supports TTL-based expiry, is fast, and works across multiple server instances. Use the `ioredis` npm package to connect. Store both key types with a TTL (e.g. 10 minutes) so stale entries are cleaned up automatically.

### Deployment

Run the server and Redis as separate services — Docker Compose works well for this. Pass the Redis connection details via environment variables (`REDIS_URL`).

### Checklist before going to production

- [ ] Replace `requestMap` with Redis (with TTL on all keys)
- [ ] Set `CORS` origin to your actual frontend domain (not `*`)
- [ ] Set `hostUrl` via an environment variable, not hardcoded
- [ ] Use HTTPS (terminate TLS at a load balancer or reverse proxy)
- [ ] Run behind a process manager (`pm2`) or container orchestrator
- [ ] Set `NODE_ENV=production`
- [ ] Store all secrets and config in environment variables, never in code

---
