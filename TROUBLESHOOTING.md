# Troubleshooting Guide

Common issues and their solutions for Nieuws Scraper Frontend.

## TypeScript Errors in VSCode

### "Cannot find module '@/components/...'"

**Symptoms:**
- VSCode shows red squiggles on import statements
- Imports work fine, build succeeds
- Errors like "Cannot find module '@/components/navigation'"

**Solution:**
1. **Reload VSCode Window**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Reload Window"
   - Select "Developer: Reload Window"

2. **Restart TypeScript Server**
   - Press `Ctrl+Shift+P` / `Cmd+Shift+P`
   - Type "Restart TS Server"
   - Select "TypeScript: Restart TS Server"

3. **Clear TypeScript Cache**
   ```bash
   # Delete TypeScript build info
   rm -rf .next
   rm tsconfig.tsbuildinfo
   
   # Restart VSCode
   ```

### "Element implicitly has an 'any' type"

**Symptoms:**
- Error on `headers['X-API-Key']` line
- Build succeeds despite error

**Solution:**
This is a VSCode cache issue. The code is already typed correctly as `Record<string, string>`. Follow the steps above to reload VSCode or restart the TypeScript server.

## CSS Warnings

### "@tailwind is unknown at rule"

**Symptoms:**
- Yellow warnings in `globals.css`
- Warnings like "Unknown at rule @tailwind"

**This is normal!** These are CSS linter warnings for Tailwind directives. The build works correctly.

**To disable (optional):**
Create `.vscode/settings.json`:
```json
{
  "css.lint.unknownAtRules": "ignore"
}
```

## Build Issues

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Node Modules Issues

**Error:** Various dependency errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Try again
npm run dev
```

### TypeScript Version Conflicts

**Error:** TypeScript version mismatch

**Solution:**
```bash
# Use the workspace TypeScript version
# In VSCode: Ctrl+Shift+P -> "TypeScript: Select TypeScript Version"
# Choose "Use Workspace Version"
```

## API Connection Issues

### Cannot Connect to Backend

**Symptoms:**
- "Network Error" in console
- Failed to fetch articles
- CORS errors

**Solutions:**

1. **Check Backend is Running**
   ```bash
   curl http://localhost:8080/health
   ```

2. **Verify API URL**
   Check `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

3. **Check CORS Settings**
   Backend must allow frontend origin. Check backend CORS config.

4. **Check Network Tab**
   - Open DevTools (F12)
   - Go to Network tab
   - Check failed requests
   - Look for CORS or 404 errors

### Rate Limiting

**Symptoms:**
- "429 Too Many Requests"
- Rate limit errors

**Solution:**
- Wait for rate limit to reset (check `X-RateLimit-Reset` header)
- Add API key if you have one
- Reduce request frequency

## Runtime Errors

### "Hydration Failed"

**Symptoms:**
- Console error about hydration mismatch
- Content flashing/changing

**Common Causes:**
1. Using `Date.now()` or random values in server components
2. Browser extensions modifying HTML

**Solution:**
```tsx
// ❌ Bad - causes hydration mismatch
const timestamp = Date.now();

// ✅ Good - use client component
'use client';
const timestamp = Date.now();
```

### Images Not Loading

**Symptoms:**
- Broken image placeholders
- Console errors about image loading

**Solutions:**

1. **Check Image URL**
   - Verify URL in article data
   - Check if URL is accessible

2. **Configure Next.js for External Images**
   Already configured in `next.config.mjs`:
   ```javascript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: '**',
       },
     ],
   }
   ```

3. **Handle Image Errors**
   Already implemented in ArticleCard with onError handler

## Performance Issues

### Slow Page Loading

**Solutions:**

1. **Check API Response Times**
   - Look at Network tab timings
   - Backend might be slow

2. **Verify Caching**
   - React Query caches for 60 seconds
   - Check if cache is working

3. **Check for Memory Leaks**
   ```bash
   # Use React DevTools Profiler
   # Check component re-renders
   ```

### High Memory Usage

**Solutions:**
1. Close other applications
2. Clear browser cache
3. Restart development server
4. Check for infinite loops in useEffect

## Development Server Issues

### Hot Reload Not Working

**Solutions:**
1. Restart dev server (`Ctrl+C`, then `npm run dev`)
2. Clear `.next` folder
3. Check file watcher limits (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### Changes Not Reflecting

**Solutions:**
1. Hard refresh browser (`Ctrl+Shift+R` or `Cmd+Shift+R`)
2. Clear browser cache
3. Restart dev server
4. Delete `.next` folder and restart

## VSCode Specific Issues

### IntelliSense Not Working

**Solutions:**
1. Restart TypeScript server (Ctrl+Shift+P -> "TypeScript: Restart TS Server")
2. Check `tsconfig.json` is valid
3. Ensure TypeScript extension is enabled
4. Try reloading VSCode window

### Path Aliases Not Resolving

**Symptoms:**
- Imports with `@/` not working
- "Cannot find module" errors

**Solution:**
Verify `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Then restart TypeScript server.

## Environment Variables

### Environment Variables Not Loading

**Symptoms:**
- `undefined` values
- API URL not working

**Solutions:**

1. **Check File Name**
   - Must be named `.env.local` (not `.env.local.txt`)
   - Must be in project root

2. **Restart Dev Server**
   - Environment variables are loaded at startup
   - Changes require restart

3. **Use NEXT_PUBLIC_ Prefix**
   - Client-side variables must start with `NEXT_PUBLIC_`
   - Example: `NEXT_PUBLIC_API_URL`

4. **Check Syntax**
   ```env
   # ✅ Correct
   NEXT_PUBLIC_API_URL=http://localhost:8080
   
   # ❌ Wrong - no quotes needed
   NEXT_PUBLIC_API_URL="http://localhost:8080"
   ```

## Production Build Issues

### Build Fails with Type Errors

**Solution:**
```bash
# Check for type errors
npm run type-check

# Fix errors before building
npm run build
```

### Build Succeeds but Runtime Errors

**Common Issues:**
1. Environment variables not set in production
2. API URL pointing to localhost
3. Missing external dependencies

**Solution:**
- Set proper production environment variables
- Use production API URL
- Test production build locally:
  ```bash
  npm run build
  npm start
  ```

## Getting More Help

### Debug Mode

Enable verbose logging:
```bash
# Development with debug info
NODE_OPTIONS='--inspect' npm run dev

# Build with debug info
DEBUG=* npm run build
```

### Request ID Tracking

Every API response includes a `request_id`. Use it for debugging:

```typescript
const response = await apiClient.getArticles();
console.log('Request ID:', response.request_id);
// Share this ID when reporting issues
```

### Browser DevTools

1. **Console** - Check for errors and warnings
2. **Network** - Inspect API requests/responses
3. **React DevTools** - Inspect component state
4. **Performance** - Profile slow operations

### Still Need Help?

1. Check [README.md](README.md) for documentation
2. Review [DEVELOPMENT.md](DEVELOPMENT.md) for best practices
3. Check backend API logs with request ID
4. Review this troubleshooting guide
5. Check browser console for detailed errors

---

Most issues are resolved by:
1. ✅ Restarting the TypeScript server
2. ✅ Reloading VSCode window  
3. ✅ Restarting the development server
4. ✅ Clearing caches and rebuilding

Happy debugging! 🐛