# Vanilla JavaScript Starter Template

A minimal, modern starter template with vanilla HTML, CSS, and JavaScript powered by Vite.

## Features

- **Pure JavaScript** - No frameworks, just vanilla JS
- **Vite** - Lightning-fast development and optimized builds
- **ES6+ Modules** - Modern JavaScript with import/export
- **Hot Module Replacement** - Instant updates during development
- **Optimized Production Builds** - Minification and tree-shaking

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
├── src/
│   ├── main.js          # JavaScript entry point
│   └── style.css        # Main styles
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
└── package.json
```

## Development

The dev server runs at `http://localhost:5173` with hot module replacement enabled. Edit files in `src/` and see changes instantly.

## Adding Features

### New JavaScript Modules
Create `.js` files in `src/` and import them:

```javascript
// src/utils.js
export function greeting(name) {
  return `Hello, ${name}!`
}

// src/main.js
import { greeting } from './utils.js'
console.log(greeting('World'))
```

### Static Assets
Place images, fonts, etc. in the `public/` directory and reference them directly:

```html
<img src="/logo.png" alt="Logo" />
```

### Additional Libraries
Install via npm:

```bash
npm install lodash-es
```

Import in your JavaScript:

```javascript
import { debounce } from 'lodash-es'
```

## Production Build

```bash
npm run build
# Output: dist/
```

The `dist/` folder contains optimized, minified files ready for deployment. Serve with any static file server (nginx, Vercel, Netlify, etc.).

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

## License

MIT
