# 🔧 Theme System Troubleshooting Guide

## Common Issues & Solutions

### ❌ Error: "Failed to resolve import ThemeContext"

**Symptom:**
```
Pre-transform error: Failed to resolve import "../../contexts/ThemeContext" 
from "src/components/settings/tabs/ThemeTab.tsx". Does the file exist?
```

**Cause:** Incorrect relative import path

**Solution:**
The import path needs to match the file structure. From `src/components/settings/tabs/ThemeTab.tsx` to `src/contexts/ThemeContext.tsx`, you need to go up 3 levels:

```tsx
// ❌ Wrong (2 levels up)
import { useTheme } from "../../contexts/ThemeContext";

// ✅ Correct (3 levels up)
import { useTheme } from "../../../contexts/ThemeContext";
```

**Quick Fix:**
This has been fixed in the latest version. Restart your dev server:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

### ❌ Error: "useTheme is not a function"

**Symptom:**
```
TypeError: useTheme is not a function
```

**Cause:** Component not wrapped in ThemeProvider

**Solution:**
Ensure `App.tsx` wraps the entire app with `ThemeProvider`:

```tsx
<ThemeProvider>
  <BrowserRouter>
    <AuthProvider>
      {/* Your app */}
    </AuthProvider>
  </BrowserRouter>
</ThemeProvider>
```

---

### ❌ Theme not switching

**Symptom:** Clicking theme buttons doesn't change colors

**Possible Causes & Solutions:**

1. **Browser cache issue**
   ```bash
   # Clear cache and hard reload
   Ctrl+Shift+R (Chrome/Edge)
   Cmd+Shift+R (Mac)
   ```

2. **CSS not loaded**
   - Check browser console for CSS errors
   - Verify `src/index.css` is imported in `src/main.tsx`

3. **ThemeProvider not rendering**
   - Check React DevTools for ThemeProvider in component tree
   - Verify no errors in console

---

### ❌ Colors not updating

**Symptom:** Some elements don't change color with theme

**Possible Causes:**

1. **Using hardcoded colors**
   ```tsx
   // ❌ Won't change with theme
   <div className="bg-[#FFFDF7]">
   
   // ✅ Will change with theme
   <div className="bg-surface">
   ```

2. **Inline styles overriding**
   ```tsx
   // ❌ Overrides theme
   <div className="bg-surface" style={{ backgroundColor: '#fff' }}>
   
   // ✅ Uses CSS variable
   <div className="bg-surface" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
   ```

3. **CSS specificity issue**
   - Use browser DevTools to check computed styles
   - Look for more specific selectors overriding theme

---

### ❌ localStorage errors

**Symptom:**
```
Failed to execute 'setItem' on 'Storage'
```

**Cause:** Private browsing or localStorage disabled

**Solution:**
The theme system will fallback to memory-only storage. Theme won't persist but will still work during the session.

---

### ❌ System theme not working

**Symptom:** "System" mode doesn't follow OS preference

**Possible Causes:**

1. **Browser doesn't support `prefers-color-scheme`**
   - Check browser compatibility
   - Use Chrome/Firefox/Safari (recent versions)

2. **OS doesn't have theme setting**
   - Some older OS versions don't support system-wide dark mode
   - Use "Light" or "Dark" mode explicitly

---

### ❌ Utility classes not working

**Symptom:**
```tsx
<div className="bg-surface text-primary">
// Still showing default styles
```

**Solution:**

1. **Verify CSS is loaded**
   ```bash
   # Check browser Network tab for index.css
   ```

2. **Check Tailwind v4 config**
   - Ensure `@tailwindcss/vite` plugin is in `vite.config.ts`
   - Our utility classes are defined in `@layer utilities`

3. **Clear build cache**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

---

### ❌ TypeScript errors

**Symptom:**
```
Property 'theme' does not exist on type 'ThemeContextType | undefined'
```

**Solution:**
The `useTheme()` hook already includes the undefined check. If you still see this:

```tsx
import { useTheme } from '@/contexts/ThemeContext';

// This should work out of the box
const { theme, setTheme } = useTheme();
```

If TypeScript still complains, restart your TypeScript server:
- VSCode: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

---

### ❌ Performance issues

**Symptom:** Theme switch is slow or janky

**Solutions:**

1. **Too many transitions**
   - Reduce number of animated elements
   - Use `will-change: background-color` for heavy animations

2. **Large component tree**
   - Theme system is CSS-only, shouldn't cause slowness
   - Check for other performance issues

3. **Browser extensions**
   - Disable extensions and test again
   - Some ad blockers interfere with CSS

---

### ❌ Build errors

**Symptom:**
```
Error: Cannot find module './contexts/ThemeContext'
```

**Solution:**
1. Verify file exists:
   ```bash
   ls src/contexts/ThemeContext.tsx
   ```

2. Check import paths in:
   - `src/App.tsx`
   - `src/components/settings/tabs/ThemeTab.tsx`

3. Rebuild:
   ```bash
   npm run build
   ```

---

### ❌ Dark mode looks wrong

**Symptom:** Colors don't match the design spec

**Solution:**

1. **Check CSS variables**
   Open browser DevTools → Elements → `<html class="dark">` → Computed styles
   
   Verify these values:
   ```css
   --color-bg-page: #0D0F0D
   --color-bg-surface: #151815
   --color-text-primary: #F2F1EC
   --color-accent-primary: #7ED957
   ```

2. **Check for inline styles**
   Search codebase for hardcoded colors:
   ```bash
   node scripts/find-hardcoded-colors.js
   ```

3. **Compare with ThemePreview**
   Visit `/theme-preview` route to see correct colors

---

## Quick Diagnostics

### Check Theme System Status

1. **Open Browser Console**
   - Press F12

2. **Run these checks:**
   ```javascript
   // 1. Check if dark class is applied
   document.documentElement.classList.contains('dark')
   
   // 2. Check CSS variable value
   getComputedStyle(document.documentElement)
     .getPropertyValue('--color-bg-surface')
   
   // 3. Check localStorage
   localStorage.getItem('studai-theme')
   ```

3. **Expected Results:**
   - Dark mode: `dark` class should be true
   - CSS variable: Should return color hex value
   - localStorage: Should be "light", "dark", or "system"

---

## Still Having Issues?

### 1. Clear Everything
```bash
# Stop server
# Delete node_modules
rm -rf node_modules

# Clear cache
rm -rf node_modules/.vite
rm -rf dist

# Reinstall
npm install

# Restart
npm run dev
```

### 2. Check Browser Console
- Look for any JavaScript errors
- Check Network tab for failed CSS loads
- Verify no 404 errors

### 3. Verify File Structure
```
src/
├── contexts/
│   └── ThemeContext.tsx  ← Must exist
├── index.css             ← Must have theme variables
└── App.tsx               ← Must wrap with ThemeProvider
```

### 4. Test in Different Browser
- Try Chrome, Firefox, or Edge
- Use incognito/private mode
- Disable all extensions

### 5. Check Documentation
- `THEME_README.md` - Main guide
- `THEME_GUIDE.md` - Color reference
- `THEME_ARCHITECTURE.md` - System design

---

## Getting Help

If you're still stuck:

1. **Check browser console** for specific error messages
2. **Run the scanner**: `node scripts/find-hardcoded-colors.js`
3. **Visit ThemePreview**: Add route and check `/theme-preview`
4. **Review logs**: Look for any warnings about theme
5. **Check versions**: Ensure compatible browser/Node version

---

## Preventive Measures

### Best Practices to Avoid Issues:

1. ✅ **Always use semantic classes**
   ```tsx
   <div className="bg-surface text-primary">
   ```

2. ✅ **Test in both themes**
   Before committing, toggle dark mode and verify

3. ✅ **Use relative imports correctly**
   Count directory levels carefully

4. ✅ **Don't modify CSS variables**
   Use the predefined ones in `index.css`

5. ✅ **Follow the migration guide**
   See `COLOR_MIGRATION.md` for patterns

---

## Error Reference

| Error | Likely Cause | Quick Fix |
|-------|--------------|-----------|
| Import resolve error | Wrong path | Fix import path |
| useTheme undefined | No Provider | Add ThemeProvider |
| Colors not changing | Hardcoded colors | Use utilities |
| Theme not persisting | localStorage issue | Check browser settings |
| System theme not working | Browser support | Use explicit mode |
| TypeScript errors | Type inference | Restart TS server |
| Build errors | Missing files | Check file structure |
| Performance issues | Unrelated | Check other code |

---

**Last Updated:** January 2026  
**Version:** 1.0.0  

For more help, see:
- `THEME_README.md` - Complete guide
- `THEME_TESTING_CHECKLIST.md` - Testing procedures
- `THEME_ARCHITECTURE.md` - System design
