# 🎓 Interactive Debugging Tutorial

## 🚀 **You're Currently Debugging!**

Your debug server is running at: **http://localhost:3000**

The debugger is listening on: **ws://127.0.0.1:9229**

## 📊 **What You Just Saw**

When we called `/health`, the debug server logged:
```
📥 Incoming request: GET /health
🏥 Health check requested
📤 Response: 200 (5ms)
```

This is **verbose logging** in action!

## 🎯 **Let's Debug Something Real**

### **Example 1: Debug Product Loading**

1. **Open your browser** to: http://localhost:3000

2. **Open Chrome DevTools** (Press F12)

3. **Go to Network tab**

4. **Refresh the page**

5. **Watch the debug server logs** - You'll see:
   ```
   📥 GET /api/products
   📦 Fetching all products
      Returning 5 products
   📤 GET /api/products - 200 (Xms)
   ```

### **Example 2: Debug a Specific Product**

**Try this in your browser:**
```
http://localhost:3000/api/products/1/reviews
```

**You'll see in the logs:**
```
📥 GET /api/products/1/reviews
⭐ Fetching reviews for product 1
   Found X approved reviews
📤 GET /api/products/1/reviews - 200 (Xms)
```

### **Example 3: Debug Rating Calculation**

**Try this:**
```
http://localhost:3000/api/products/1/rating
```

**Debug logs will show:**
```
📥 GET /api/products/1/rating
📊 Calculating rating for product 1
   Average: 4.67, Count: 3
📤 GET /api/products/1/rating - 200 (Xms)
```

## 🔍 **Using Chrome DevTools**

### **Step 1: Open DevTools**
1. Go to http://localhost:3000
2. Press **F12** (or right-click → Inspect)

### **Step 2: Network Tab**
- See all API requests
- Click any request to see:
  - Headers
  - Response data
  - Timing information

### **Step 3: Console Tab**
- See any console.log messages
- Try typing: `fetch('/api/products').then(r => r.json()).then(console.log)`

### **Step 4: Sources Tab**
- Find your React components
- Set breakpoints by clicking line numbers
- Execution will pause when code runs

## 🐛 **Using Node Inspector**

### **Step 1: Open Chrome Inspector**
1. Open Chrome
2. Go to: `chrome://inspect`
3. Click "Open dedicated DevTools for Node"

### **Step 2: Set Breakpoints**
1. Go to Sources tab
2. Find `debug.js`
3. Click line numbers to set breakpoints
4. Make an API call
5. Execution pauses at breakpoint!

### **Step 3: Inspect Variables**
When paused:
- Hover over variables to see values
- Use Console to type variable names
- Step through code with F10/F11

## 🎨 **Debugging React Components**

### **Install React DevTools**
1. Install "React Developer Tools" Chrome extension
2. Refresh your app
3. Open DevTools
4. Find "Components" and "Profiler" tabs

### **Inspect Components**
- Click any component in the tree
- See props and state
- Edit values in real-time
- Track re-renders

## 💡 **Quick Debug Commands**

### **In Browser Console:**
```javascript
// Fetch products
fetch('/api/products').then(r => r.json()).then(console.log)

// Fetch reviews for product 1
fetch('/api/products/1/reviews').then(r => r.json()).then(console.log)

// Fetch rating for product 1
fetch('/api/products/1/rating').then(r => r.json()).then(console.log)
```

### **In PowerShell:**
```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://localhost:3000/health"

# Test products endpoint
Invoke-WebRequest -Uri "http://localhost:3000/api/products"

# Test reviews endpoint
Invoke-WebRequest -Uri "http://localhost:3000/api/products/1/reviews"
```

## 🎯 **Common Debugging Scenarios**

### **Scenario 1: Products Not Loading**

**Symptoms:** Empty product list

**Debug Steps:**
1. Check Network tab - Is `/api/products` called?
2. Check response - Is data returned?
3. Check Console - Any errors?
4. Check debug server logs - What does it show?

**Solution:**
```javascript
// In ProductList.jsx, add:
useEffect(() => {
  console.log('Fetching products...');
  fetchProducts();
}, []);
```

### **Scenario 2: Reviews Not Showing**

**Symptoms:** Product page shows no reviews

**Debug Steps:**
1. Check Network tab - Is `/api/products/:id/reviews` called?
2. Check the product ID in the URL
3. Check debug server logs - How many reviews found?
4. Check if reviews exist for that product

**Solution:**
```javascript
// In ProductDetail.jsx, add:
useEffect(() => {
  console.log('Product ID:', id);
  console.log('Fetching reviews for product:', id);
}, [id]);
```

### **Scenario 3: Rating Not Calculating**

**Symptoms:** Shows 0 stars or wrong rating

**Debug Steps:**
1. Check `/api/products/:id/rating` response
2. Check debug logs for calculation
3. Verify reviews exist and are approved
4. Check RatingDisplay component props

**Solution:**
```javascript
// In RatingDisplay.jsx, add:
console.log('Rating:', rating);
console.log('Max Rating:', maxRating);
```

## 🔥 **Pro Debugging Tips**

### **1. Use Debugger Statement**
```javascript
function fetchProducts() {
  debugger; // Execution pauses here!
  // ... rest of code
}
```

### **2. Conditional Logging**
```javascript
if (productId === 1) {
  console.log('Debugging product 1:', data);
}
```

### **3. Table Logging**
```javascript
console.table(products); // Shows data in a table
```

### **4. Time Measurement**
```javascript
console.time('fetchProducts');
await fetchProducts();
console.timeEnd('fetchProducts'); // Shows duration
```

### **5. Stack Traces**
```javascript
console.trace('How did we get here?');
```

## 📈 **Next Steps**

1. **Open the app**: http://localhost:3000
2. **Open DevTools**: Press F12
3. **Try the examples above**
4. **Watch the debug logs** in your terminal
5. **Experiment with breakpoints**

## 🎊 **You're Debugging!**

The server is running in debug mode with:
- ✅ Verbose logging enabled
- ✅ Node inspector active
- ✅ All endpoints working
- ✅ Real-time request monitoring

**Happy Debugging!** 🐛🔍

---

## 📞 **Need Help?**

If something isn't working:
1. Check the debug server is running (you should see logs)
2. Check http://localhost:3000/health returns OK
3. Check Chrome DevTools Console for errors
4. Look at the debug server logs for clues

The debug server shows EVERY request with:
- 📥 Request details
- 📦 What data is being processed
- 📤 Response status and timing
- ❌ Any errors with stack traces