# RSI Starter: Vanilla JS + Vite

A minimal starter template for RSI-managed products. Vanilla JavaScript with Vite for fast builds and HMR.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build for production → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest unit tests |

## Project Structure

```
├── index.html          # HTML entry point
├── src/
│   ├── main.js         # JavaScript entry point
│   └── style.css       # Global styles
├── public/             # Static assets (served as-is)
├── vite.config.js      # Vite configuration
└── package.json
```

## Customization

### Adding npm Packages

```bash
npm install <package-name>
```

```javascript
import axios from 'axios'
```

### Adding Modules

Create `.js` files in `src/` and import them:

```javascript
// src/modules/api.js
export async function fetchItems() { ... }

// src/main.js
import { fetchItems } from './modules/api.js'
```

### Environment Variables

Use `import.meta.env` for Vite environment variables. Prefix variables with `VITE_` to expose them to client code:

```bash
# .env
VITE_API_URL=https://api.example.com
```

```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

Note: Do not expose secrets via `VITE_` prefixed variables — they are bundled into client code.

## RSI Hub Integration

This product has access to RSI Platform API Hubs. Authenticate using the `RSI_HUB_TOKEN` environment variable (injected at runtime by the RSI worker):

```javascript
async function callAIHub(prompt) {
  const response = await fetch('https://rsi.digify.no/hub/ai/chat', {
    method: 'POST',
    headers: {
      'Authorization': `WorkerHub ${RSI_HUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: prompt }),
  })
  return response.json()
}
```

Available hubs: **AI Hub**, **Client Error Intelligence Hub**, **Maps Hub**.

## Deployment

Production builds output to `dist/`. Nginx serves files directly from this directory — no server process required.

```bash
npm run build   # generates dist/
```

Deploys automatically when a PR is merged to `main`.
