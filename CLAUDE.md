<!-- rsi-worker-metadata
  workerId=82bf9bbe-750c-4648-a241-37f3cd214cb3
  productId=7a29c078-9a00-469d-acab-dcd658a5ec1b
  scopeConfigHash=4901c9f773ef1190
  generatedAt=2026-04-24T22:02:21.039Z
-->
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

# Run tests with coverage report
npm run test:coverage

# Lint source files
npm run lint
```

## Project Structure

```
src/
├── main.js              # JavaScript entry point
├── main.test.js         # Tests for initApp()
├── style.css            # Styles
├── utils.js             # Shared utility helpers (clamp, formatCurrency, debounce)
├── utils.test.js        # Tests for utils
├── store.js             # Observable state management
├── store.test.js        # Tests for store
└── components/
    ├── card.js          # Card component factory (returns DOM element)
    └── card.test.js     # Tests for card component (requires jsdom environment)
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
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// src/main.js
import { clamp } from './utils.js'
const result = clamp(5, 0, 10) // result === 5
```

### DOM Manipulation
```javascript
const button = document.getElementById('myBtn')
button?.addEventListener('click', () => {
  // use debugger or DevTools to inspect
})
```

### Accessible DOM Components
Always set semantic roles and labels when building interactive components:

```javascript
// Button with accessible label — aria-label is correct here because the visible
// content (✕) doesn't convey the button's purpose on its own
const btn = document.createElement('button')
btn.type = 'button'
btn.setAttribute('aria-label', 'Close dialog')
btn.textContent = '✕'

// DO NOT use aria-label when the button has descriptive visible text —
// it overrides the computed name and loses visible content (violates WCAG 2.5.3).
// Let the visible text serve as the accessible name instead:
const counterBtn = document.createElement('button')
counterBtn.textContent = 'Click Count: 0'  // accessible name = visible text
// For reactive updates, use aria-live on the changing child element, not aria-label on the button.

// Status region that announces updates to screen readers
const status = document.createElement('div')
status.setAttribute('role', 'status')
status.setAttribute('aria-live', 'polite')

// Loading state
const spinner = document.createElement('div')
spinner.setAttribute('role', 'status')
spinner.setAttribute('aria-label', 'Loading...')
spinner.setAttribute('aria-busy', 'true')
```

**When to use `aria-label`**: Only for controls whose visible label is insufficient — icon-only buttons (✕, ≡), controls whose purpose isn't conveyed by their text alone. **Avoid `aria-label` on buttons that already have descriptive visible text** — it overrides the visible label and may violate WCAG 2.5.3 Label in Name.

Prefer native semantic elements (`<button>`, `<nav>`, `<main>`, `<header>`) over generic `<div>` with ARIA roles where possible.

### Async/Await for APIs
```javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data')
    const data = await response.json()
    return data
  } catch (error) {
    // handle error — avoid console.log in source files (triggers no-console warning)
    throw error
  }
}
```

### CSS Modules
Vite supports CSS imports:
```javascript
// Import global styles
import './style.css'

// Import component styles the same way
// import './components/card.css'
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
import { clamp } from './utils.js'

describe('clamp', () => {
  it('clamps value to min', () => {
    expect(clamp(-1, 0, 10)).toBe(0)
  })
})
```

```bash
npm test          # watch mode
npm run test:run  # single run (CI)
```

### DOM Testing (jsdom)

Component factory tests that manipulate DOM elements require the `jsdom` environment. This is already configured globally in `vite.config.js`:

```javascript
test: {
  environment: 'jsdom',
  globals: true,
}
```

With jsdom enabled, all tests have access to `document`, `window`, and other browser APIs. This allows testing DOM-manipulating components like:

```javascript
// src/components/card.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { createCard } from './card.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('createCard', () => {
  it('renders title and body', () => {
    const card = createCard({ title: 'Hello', body: 'World' })
    expect(card.querySelector('h2').textContent).toBe('Hello')
    expect(card.querySelector('p').textContent).toBe('World')
  })
})
```

The `jsdom` package is listed in `devDependencies` — do not remove it.

### Test Isolation with Store
When tests share the observable store, reset it before each test and clean up subscriptions after each test to prevent state and subscriber leaks:

```javascript
import { beforeEach, afterEach } from 'vitest'
import { store } from './store.js'  // adjust to '../store.js' for src/components/ tests

let unsub

beforeEach(() => {
  store.reset()
})

afterEach(() => {
  unsub?.()  // clean up any active subscription
})
```

Copy this pattern into any test file that reads or writes store state. Always clean up subscriptions in `afterEach` — active subscribers from a previous test continue receiving state updates and can cause false positives or hard-to-trace failures in later tests.

### Testing Time-Dependent Functions (debounce)

`debounce` is time-dependent — use Vitest fake timers instead of relying on real elapsed time:

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from './utils.js'  // adjust to '../utils.js' for src/components/ tests

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('delays invocation until after the wait period', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('resets the timer on repeated calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(200)
    debounced()             // resets the 300ms window
    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()  // would have fired if timer wasn't reset
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledOnce()
  })
})
```

Always restore real timers in `afterEach` — leaving fake timers active leaks into subsequent test files.

### Testing Async Actions (mocking fetch)

When testing functions that use `createAsyncAction` with real `fetch()` calls, mock `global.fetch` using `vi.fn()` to avoid real network requests:

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { store, createAsyncAction } from './store.js'  // adjust to '../store.js' for src/components/ tests

describe('loadUser', () => {
  const dispatch = createAsyncAction(store.set.bind(store))

  beforeEach(() => {
    store.reset()
  })

  afterEach(() => {
    vi.restoreAllMocks()  // restore any vi.spyOn() mocks
    delete global.fetch  // clean up direct global.fetch assignment (vi.restoreAllMocks does not cover this)
  })

  it('fetches user and sets store', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ id: 1, name: 'Alice' }),
    })

    const user = await dispatch(() =>
      fetch('/users/1').then(r => r.json())
    )
    store.set({ user })

    expect(store.get().user).toEqual({ id: 1, name: 'Alice' })
    expect(store.get().loading).toBe(false)
  })

  it('sets error state on fetch failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await dispatch(() => fetch('/users/1').then(r => r.json()))
    expect(result).toBeUndefined()

    expect(store.get().error?.message).toBe('Network error')
    expect(store.get().loading).toBe(false)
  })
})
```

Always call `vi.restoreAllMocks()` in `afterEach` to prevent the mock from leaking into other tests. jsdom does not provide a real `fetch` implementation, so tests that skip mocking will throw `ReferenceError: fetch is not defined`.

## Linting

ESLint 9 flat config (`eslint.config.js`) is pre-configured with:
- `@eslint/js` recommended rules
- Browser globals
- ES2022 syntax
- `dist/` excluded from linting
- `no-console` rule (use `debugger` or DevTools instead)

```bash
npm run lint      # lint src/**/*.js
```

## Security

`index.html` includes a Content Security Policy meta tag that restricts resource loading to `'self'` by default. The `connect-src` directive includes `ws://localhost:*` during **development** to allow Vite HMR WebSocket connections. In **production builds**, the `strip-dev-csp` plugin in `vite.config.js` automatically removes this directive — `dist/index.html` will not contain `ws://localhost:*`.

When integrating third-party resources (fonts, CDN scripts, external APIs), update the `connect-src`, `script-src`, or `style-src` directives accordingly. For example, if your app fetches from `https://api.example.com`, add it explicitly: `connect-src 'self' https://api.example.com` (the `ws://localhost:*` is stripped automatically in production).

## Vite Configuration

`vite.config.js` sets sensible defaults:
- `base: '/'` — override via `VITE_BASE_URL` env var for subdirectory deployments
- `chunkSizeWarningLimit: 500` — warns on chunks >500KB
- Dev server on port `5173` (`strictPort: false` allows fallback)


### Coverage Thresholds

Vitest is configured with coverage thresholds to prevent test debt from accumulating silently:

```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'lcov'],
  include: ['src/**/*.js'],
  exclude: ['src/**/*.test.js'],
  thresholds: {
    statements: 75,
    branches: 70,
    functions: 80,
    lines: 75
  }
}
```

Thresholds are set ~5% below the measured baseline so CI fails only on genuine regressions. If you add new tested code that raises the baseline, tighten the thresholds accordingly.

### Environment Variables
Create `.env.local` from `.env.example` for local settings (gitignored).
Only `VITE_`-prefixed vars are exposed to the browser via `import.meta.env`:

```bash
# .env.local (copy from .env.example)
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
Use template literals for readable string construction, but build DOM elements safely
using `createElement` and `textContent` rather than `innerHTML`:

```javascript
const name = 'World'
const card = document.createElement('div')
card.className = 'card'
const heading = document.createElement('h1')
heading.textContent = `Hello, ${name}!`
card.appendChild(heading)
document.getElementById('app').appendChild(card)
```

Avoid `element.innerHTML = userInput` — it can enable XSS. Use `textContent` for
text content or `createElement`/`appendChild` for DOM structure.


### Component Factory
Create reusable component factories that return DOM elements:

```javascript
// src/components/card.js
export function createCard({ title = '', body = '' } = {}) {
  const card = document.createElement('div')
  card.className = 'card'
  const h2 = document.createElement('h2')
  h2.textContent = title ?? ''
  card.appendChild(h2)
  const p = document.createElement('p')
  p.textContent = body ?? ''
  card.appendChild(p)
  return card
}

// Usage in main.js
import { createCard } from './components/card.js'
const card = createCard({ title: 'Hello', body: 'World' })
document.getElementById('app').appendChild(card)
```

This keeps components encapsulated, avoids `innerHTML`, and makes units testable in isolation.

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
render(store.get())                                    // render initial state — subscribe() does not call fn immediately
unsub()                                            // cleanup
```

> **Note**: `store.set()` performs a **shallow merge** — `store.set({ foo: 1 })` preserves existing keys not mentioned. Every `set()` call — including `set({})` with an empty patch — always notifies all active subscribers with the current state. `store.reset()` restores state to the initial value passed to `createStore()` and **silently** clears all active subscriptions (without notifying them) — use it to return to a known baseline. To replace state with a *different* value than the initial, call `store.reset()` first (to clear subscriptions and reset state), then `store.set(newState)`. `store.subscribe()` uses a `Set` internally — subscribing the same function reference twice registers it only once. The second call is silently ignored; `unsub()` will remove the function entirely.
>
> **Warning**: `store.reset()` drops all active subscriptions silently (`listeners.clear()`) — subscribers are not called. In production code, any components that subscribed via `store.subscribe()` will stop receiving updates after a `reset()`. Reserve `store.reset()` for test setup/teardown — do not call it in running app code.

> **Subscriber errors**: If a subscriber callback throws, the store catches the error (logs to console) and continues notifying remaining subscribers. This prevents one broken subscriber from freezing unrelated UI components.

To verify this behavior in tests:

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { store } from './store.js'  // adjust to '../store.js' for src/components/ tests

describe('subscribe error isolation', () => {
  beforeEach(() => store.reset())
  afterEach(() => {
    store.reset()
    vi.restoreAllMocks()
  })

  it('continues notifying remaining subscribers if one throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const secondCalled = vi.fn()

    store.subscribe(() => { throw new Error('subscriber error') })
    store.subscribe(secondCalled)

    expect(() => store.set({ x: 1 })).not.toThrow()
    expect(secondCalled).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledOnce()
  })
})
```

### Async State Management
Use `createAsyncAction` to wrap async operations — it automatically sets `loading: true, error: null`
before the call and `loading: false` when it resolves or rejects:

```javascript
import { store, createAsyncAction } from './store.js'

const dispatch = createAsyncAction(store.set.bind(store))

async function loadUser(id) {
  const user = await dispatch(() => fetch(`/users/${id}`).then(r => r.json()))
  // On success, user is the fetched data; on error, dispatch returns undefined
  // and store.error is already set — no try/catch needed
  if (user !== undefined) store.set({ user })
}
```

> **Concurrency warning**: `createAsyncAction` does not prevent race conditions. If two `dispatch()` calls overlap (e.g., a button clicked twice quickly), the first one to finish will call `setState({ loading: false })` while the second is still in flight — the UI will briefly show a non-loading state mid-fetch. To avoid this, either disable the trigger while loading (`if (store.get().loading) return`) or abort the previous request before starting a new one.

#### Rendering async state in subscribers

Your store's initial state should include `{ loading: false, error: null }` so subscribers can always read these fields safely — even before the first async action runs:

```javascript
// In your subscriber (e.g. main.js render function)
function render(state) {
  if (state.loading) {
    loadingEl.style.display = 'block'
    errorEl.style.display = 'none'
    return
  }
  if (state.error) {
    errorEl.textContent = state.error.message
    errorEl.style.display = 'block'
    return
  }
  // render normal state
  loadingEl.style.display = 'none'
  errorEl.style.display = 'none'
  renderUser(state.user)
}

store.subscribe(render)
render(store.get())  // populate initial UI and handle any pre-existing loading/error state — subscribe() does not call fn immediately
```

> **Note**: `createAsyncAction` does **not** re-throw errors. On failure, `setState({ loading: false, error: err })` is called and `dispatch()` returns `undefined`. Check `store.get().error` or use the subscriber pattern to handle failures in the UI — no `try/catch` is needed around `dispatch()`.

**How `createAsyncAction` works**: It wraps a thunk, calls `setState({ loading: true, error: null })` before the thunk runs, then on success calls `setState({ loading: false, error: null })` and returns the thunk's result. On failure, calls `setState({ loading: false, error: err })` and returns `undefined` — no error is thrown from `dispatch()`.


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

> **Note**: `console.*` calls trigger a **warning** from the `no-console` ESLint rule in this project (`'warn'`, not `'error'` — lint will not fail). Use browser DevTools instead: open the Sources panel to set breakpoints, or use the `debugger` statement to pause execution.

```javascript
// Pause execution and inspect in DevTools
debugger

// Or use DevTools console interactively (not in source files)
```

If you need temporary logging during development, disable the rule for a single line:

```javascript
// eslint-disable-next-line no-console
console.log(someValue)  // remove before committing
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
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

