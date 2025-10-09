# Privado Login Service

A Node.js backend service implementing secure authentication using Privado's decentralized identity protocol.

## Overview

This service provides a complete authentication flow leveraging Privado's zero-knowledge proof system. Users authenticate by clicking a universal link that opens the Privado ID wallet, offering a privacy-preserving authentication.

## Directories

- `keys/`: Verification keys used by the verifier to validate Privado authentication responses. Required at runtime; update only when changing circuits.
- `static/`: Frontend assets for the demo login UI (HTML, CSS, JS). Served by Express via `app.use(express.static('./static'))` in `index.js`.

### API Endpoints

- `GET /api/sign-in` – Starts the login flow and returns an authorization request, which is encoded to embed in the universal link
- `POST /api/callback` – Receives the wallet response and verifies it using the bundled verification keys
- `GET /api/auth-status` – Checks whether the session has completed authentication

## Quick Start

### Local Development with ngrok

Since Privado wallets require public HTTPS access for authentication callbacks, use ngrok for local development:

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
