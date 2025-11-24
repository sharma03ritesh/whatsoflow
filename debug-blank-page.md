# Debugging Blank Page Issue

## Steps to Debug:

1. **Open Browser Console (F12)** and check for errors:
   - Look for red error messages
   - Check the Console tab
   - Check the Network tab for failed requests

2. **Check if Vite is running:**
   - Look at terminal running `composer run dev`
   - Should see Vite dev server running
   - Check for any compilation errors

3. **Verify the page is loading:**
   - In browser console, type: `document.getElementById('app')` or `document.querySelector('[data-page]')`
   - Should return an element if Inertia is working

4. **Check Network Tab:**
   - Look for requests to `/` 
   - Check if the response contains HTML with Inertia data
   - Look for any 404 or 500 errors

5. **Common Issues:**
   - **JavaScript errors**: Check console for syntax errors
   - **Missing dependencies**: Run `npm install` again
   - **Vite not running**: Make sure `npm run dev` is running
   - **Route mismatch**: Page name in route doesn't match file name

## Quick Fixes to Try:

1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

2. **Clear browser cache**

3. **Restart dev servers:**
   ```bash
   # Stop current servers (Ctrl+C)
   composer run dev
   ```

4. **Rebuild assets:**
   ```bash
   npm run build
   ```

5. **Check if Welcome page renders:**
   - Try accessing: http://localhost:8000/login
   - If login page works, the issue is with Welcome page specifically

## What to Check in Console:

- Look for: "Failed to resolve import"
- Look for: "Cannot read property"
- Look for: "Uncaught Error"
- Look for: "Module not found"

