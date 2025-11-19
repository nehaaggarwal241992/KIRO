# 🔍 Debugging Guide for ReviewHub

This guide will help you debug both the frontend and backend of the ReviewHub application.

## 🎯 Quick Start Debugging

### Option 1: Debug in VS Code (Recommended)

1. **Open VS Code** in the project root
2. **Go to Run and Debug** (Ctrl+Shift+D or Cmd+Shift+D)
3. **Select a debug configuration:**
   - `🚀 Debug Backend (Production)` - Debug the production server
   - `🔧 Debug Backend (Simple Demo)` - Debug the simple demo server
   - `🌐 Debug Frontend (Chrome)` - Debug React app in Chrome
   - `🎯 Debug Backend + Frontend` - Debug both simultaneously

4. **Press F5** or click the green play button
5. **Set breakpoints** by clicking in the gutter next to line numbers
6. **Interact with the app** and watch execution pause at breakpoints

### Option 2: Debug with Node Inspector

```bash
cd backend
npm run debug
```

Then open Chrome and navigate to: `chrome://inspect`

### Option 3: Debug with Console Logs

The debug server includes verbose logging. Start it with:

```bash
cd backend
node src/scripts/debug.js
```

## 🔧 Backend Debugging

### Setting Breakpoints

1. **In VS Code:**
   - Click in the gutter (left of line numbers)
   - Red dot appears = breakpoint set
   - F9 to toggle breakpoint

2. **In Code:**
   ```javascript
   debugger; // Execution will pause here when debugging
   ```

### Common Debug Points

**API Routes** (`backend/src/scripts/debug.js`):
- Line ~80: Products endpoint
- Line ~90: Reviews endpoint  
- Line ~100: Rating calculation

**Services** (if using full backend):
- `backend/src/services/ReviewService.js`
- `backend/src/services/ModerationService.js`

### Inspecting Variables

When paused at a breakpoint:
- **Hover** over variables to see values
- **Debug Console**: Type variable names to inspect
- **Watch Panel**: Add expressions to monitor
- **Call Stack**: See function call hierarchy

### Debug Console Commands

```javascript
// Inspect request
req.params
req.body
req.headers

// Inspect data
mockProducts
mockReviews

// Execute code
mockProducts.filter(p => p.id === 1)
```

## 🌐 Frontend Debugging

### Chrome DevTools

1. **Open the app** in Chrome: http://localhost:3000
2. **Press F12** to open DevTools
3. **Go to Sources tab**
4. **Find your files** under `webpack://` or `localhost:5173`
5. **Set breakpoints** by clicking line numbers

### React DevTools

1. **Install React DevTools** extension for Chrome
2. **Open DevTools** and find "Components" and "Profiler" tabs
3. **Inspect component props and state**
4. **Track component renders**

### Common Debug Points

**Components:**
- `frontend/src/components/products/ProductList.jsx` - Line ~20 (fetchProducts)
- `frontend/src/components/products/ProductDetail.jsx` - Line ~30 (data loading)
- `frontend/src/components/reviews/ReviewCard.jsx` - Line ~10 (rendering)

**Services:**
- `frontend/src/services/api.js` - Line ~10 (API configuration)
- `frontend/src/services/productService.js` - API calls

### Console Debugging

```javascript
// In browser console
console.log('Debug:', variable);
console.table(arrayData);
console.dir(object);

// Inspect React components
$r // Selected component in React DevTools
```

## 🐛 Common Issues and Solutions

### Issue: API calls failing

**Debug Steps:**
1. Check Network tab in DevTools
2. Verify API URL in `frontend/src/services/api.js`
3. Check backend server is running
4. Look for CORS errors in console

**Solution:**
```javascript
// In api.js, verify baseURL
baseURL: 'http://localhost:3000/api'
```

### Issue: Components not rendering

**Debug Steps:**
1. Check React DevTools for component tree
2. Look for errors in Console
3. Verify props are being passed correctly
4. Check if data is loading

**Solution:**
```javascript
// Add console logs in component
useEffect(() => {
  console.log('Component mounted');
  console.log('Props:', props);
}, []);
```

### Issue: State not updating

**Debug Steps:**
1. Check if setState is being called
2. Verify state dependencies in useEffect
3. Look for async timing issues

**Solution:**
```javascript
// Add logging to state updates
const [data, setData] = useState([]);

useEffect(() => {
  console.log('Data changed:', data);
}, [data]);
```

## 📊 Debugging Tools

### Backend Tools

1. **Node Inspector** - Built-in debugger
2. **VS Code Debugger** - Full IDE integration
3. **Console Logs** - Simple but effective
4. **Postman/Thunder Client** - Test API endpoints

### Frontend Tools

1. **Chrome DevTools** - Essential for web debugging
2. **React DevTools** - Component inspection
3. **Redux DevTools** - If using Redux
4. **Network Tab** - Monitor API calls
5. **Console** - Log messages and errors

## 🎓 Debugging Best Practices

### DO:
✅ Use meaningful variable names
✅ Add descriptive console logs
✅ Test one thing at a time
✅ Use breakpoints strategically
✅ Check Network tab for API issues
✅ Read error messages carefully
✅ Use React DevTools for component issues

### DON'T:
❌ Leave debugger statements in production
❌ Ignore console warnings
❌ Debug multiple issues simultaneously
❌ Skip reading error stack traces
❌ Forget to check browser console

## 🚀 Advanced Debugging

### Performance Debugging

**Frontend:**
```javascript
// Measure component render time
console.time('ComponentRender');
// ... component code
console.timeEnd('ComponentRender');
```

**Backend:**
```javascript
// Measure API response time
const start = Date.now();
// ... API logic
console.log(`Duration: ${Date.now() - start}ms`);
```

### Memory Debugging

**Chrome DevTools:**
1. Go to Memory tab
2. Take heap snapshot
3. Compare snapshots to find leaks

### Network Debugging

**Monitor all requests:**
1. Open Network tab
2. Filter by XHR/Fetch
3. Click request to see details
4. Check Headers, Preview, Response

## 📝 Debug Logging Levels

The debug server uses these log levels:

- 🏥 Health checks
- 📦 Product requests
- ⭐ Review requests
- 📊 Rating calculations
- 🌐 Page requests
- ❌ Errors

## 🔗 Useful Resources

- [Chrome DevTools Docs](https://developer.chrome.com/docs/devtools/)
- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)

## 💡 Quick Tips

1. **Use Source Maps** - They map minified code to original source
2. **Preserve Log** - Enable in DevTools to keep logs across page reloads
3. **Conditional Breakpoints** - Right-click breakpoint to add condition
4. **Logpoints** - Log without stopping execution
5. **Watch Expressions** - Monitor specific values

---

Happy Debugging! 🐛🔍