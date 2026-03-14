# Ephemeral Spaces

A minimalist, real-time chat application with zero data persistence.

## 🚀 Deployment Warning

**Vercel is NOT supported.**
This application uses a custom Node.js server (`server.js`) with `Socket.io` for persistent WebSocket connections. Vercel's Serverless Functions do not support this architecture, which will cause the app to get stuck on "Securing Room...".

### Recommended Hosting
- **[Render](https://render.com)** (Recommended)
- **[Railway](https://railway.app)**
- **Fly.io**
- **DigitalOcean App Platform**

## 🛠️ Deployment Steps (Render)

1. Connect your GitHub repository to **Render**.
2. Select **Web Service**.
3. Use the following settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server.js`
   - **Environment Variables:** `NODE_ENV=production`

## 💎 Features
- **Zero Persistence:** No database, all messages live in server RAM.
- **Auto-Wipe:** Rooms and history are deleted automatically when empty.
- **Private Sessions:** Password-protected rooms with owner-only renaming.
- **Premium UI:** Sleek dark aesthetic with gold accents and bubble tails.
- **Attachments:** Share images and files instantly (Base64/RAM only).
