# Vanilla JavaScript Starter - Claude Development Guide

## Stack

- **Vanilla JavaScript** (ES6+) - No frameworks
- **Vite 5.2+** - Fast build tool with HMR
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
```

## Project Structure

```
src/
├── main.js          # JavaScript entry point
└── style.css        # Styles
index.html           # HTML entry point
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

## Production Build

```bash
npm run build
# Output: dist/
```

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
