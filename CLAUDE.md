# Vanilla JavaScript Starter - Claude Development Guide

## Stack

- **Vanilla JavaScript** (ES6+) - No frameworks
- **Vite 7** - Fast build tool with HMR
- **Vitest** - Unit testing framework
- **ESLint 9** - Code quality linting (flat config)
- **HTML5** & **CSS3**

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests (watch mode)
npm test

# Run tests once (CI)
npm run test:run

# Lint source files
npm run lint
```

## Project Structure

```
src/
├── main.js          # JavaScript entry point
├── style.css        # Styles
├── utils.js         # Shared utility helpers (clamp, formatCurrency, debounce)
├── utils.test.js    # Tests for utils
├── store.js         # Observable state management
└── store.test.js    # Tests for store
index.html           # HTML entry point (includes CSP meta tag)
vite.config.js       # Vite build configuration
eslint.config.js     # ESLint flat config (ESLint 9+)
package.json         # Dependencies and scripts
README.md            # Project setup and customization guide
```

## Key Patterns

### ES6 Modules
Use import/export for modularity:

```javascript
// src/utils.js
export function sum(a, b) {
  return a + b
}

// src/main.js
import { sum } from './utils.js'
console.log(sum(2, 3))
```

### DOM Manipulation
```javascript
const button = document.getElementById('myBtn')
button?.addEventListener('click', () => {
  console.log('Clicked!')
})
```

### Async/Await for APIs
```javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data')
    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### CSS Modules
Vite supports CSS imports:
```javascript
import './style.css'
import './components/button.css'
```

## Adding Features

### New Modules
Create `.js` files in `src/` and import:
```javascript
import { myFunction } from './modules/myModule.js'
```

### Static Assets
- Place in `public/` directory
- Reference directly: `<img src="/logo.png" />`
- Or import in JS: `import imgUrl from './assets/logo.png'`

### NPM Packages
```bash
npm install axios
```

```javascript
import axios from 'axios'
```

### Local Storage
```javascript
// Save
localStorage.setItem('key', 'value')

// Retrieve
const value = localStorage.getItem('key')

// Remove
localStorage.removeItem('key')
```

## Testing

Vitest is pre-configured. Create test files alongside source files:

```javascript
// src/utils.test.js
import { describe, it, expect } from 'vitest'
import { sum } from './utils.js'

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(2, 3)).toBe(5)
  })
})
```

```bash
npm test          # watch mode
npm run test:run  # single run (CI)
```

## Linting

ESLint 9 flat config (`eslint.config.js`) is pre-configured with:
- `@eslint/js` recommended rules
- Browser globals
- ES2022 syntax
- `dist/` excluded from linting

```bash
npm run lint      # lint src/**/*.js
```

## Security

`index.html` includes a Content Security Policy meta tag that restricts resource loading to `'self'` by default. When integrating third-party resources (fonts, CDN scripts, external APIs), update the `connect-src`, `script-src`, or `style-src` directives accordingly.

## Vite Configuration

`vite.config.js` sets sensible defaults:
- `base: '/'` — override via `VITE_BASE_URL` env var for subdirectory deployments
- `chunkSizeWarningLimit: 500` — warns on chunks >500KB
- Dev server on port `5173` (`strictPort: false` allows fallback)

### Environment Variables
Vite exposes env vars prefixed with `VITE_` to the browser:

```bash
# .env
VITE_API_URL=https://api.example.com
```

```javascript
// Access in browser code
const apiUrl = import.meta.env.VITE_API_URL
```

> **Note**: Variables without the `VITE_` prefix are server-only and will be `undefined` in the browser.

## Common Patterns

### Event Delegation
```javascript
document.addEventListener('click', (e) => {
  if (e.target.matches('.delete-btn')) {
    // Handle delete
  }
})
```

### Template Strings
```javascript
const name = 'World'
const html = `
  <div class="card">
    <h1>Hello, ${name}!</h1>
  </div>
`
document.getElementById('app').innerHTML = html
```

### Array Methods
```javascript
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)
const evens = numbers.filter(n => n % 2 === 0)
const sum = numbers.reduce((acc, n) => acc + n, 0)
```


### State Management
```javascript
import { store } from './store.js'
store.set({ user: null })                          // update state
store.get()                                        // read current state
const unsub = store.subscribe(state => render(state))  // reactive subscription
unsub()                                            // cleanup
```
## Production Build

```bash
npm run build
# Output: dist/
```

nginx serves files from the `dist/` directory — always run `npm run build` before deploying.

Optimizations:
- Minification
- Tree-shaking (removes unused code)
- Code splitting
- Asset optimization

## Debugging

### Console Methods
```javascript
console.log('Info')
console.error('Error')
console.warn('Warning')
console.table([{name: 'John', age: 30}])
console.time('timer')
// ... code ...
console.timeEnd('timer')
```

### Browser DevTools
- Use breakpoints in Sources panel
- `debugger` statement pauses execution
- Network panel for API requests

## Resources

- [MDN JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Vite Guide](https://vitejs.dev/guide/)
- [JavaScript.info](https://javascript.info/)
- [Vitest Docs](https://vitest.dev/)
- [ESLint Docs](https://eslint.org/docs/latest/)
