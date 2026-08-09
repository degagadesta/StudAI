# 🎨 StudAI Theme System

## Overview

A sophisticated dual-theme system featuring carefully crafted light and dark modes. The system uses CSS custom properties for seamless theme switching without requiring component-level changes.

## 🌓 Features

- **Two Beautiful Themes**: Light mode (warm, earthy) and Dark mode (analytics-inspired with vivid greens)
- **System Preference Support**: Automatically respects user's OS theme preference
- **Smooth Transitions**: All color changes animate smoothly (200ms)
- **Semantic Variables**: Use meaningful names like `text-primary` instead of hex codes
- **Type-Safe Context**: React context with TypeScript for theme management
- **Persistent Preferences**: Theme choice saved to localStorage
- **Zero Component Changes**: Existing components automatically adapt when using semantic colors

## 🚀 Quick Start

### 1. Using the Theme Context

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Current: {theme} (Resolved: {resolvedTheme})
    </button>
  );
}
```

### 2. Using Utility Classes

```tsx
// Card with theme-aware colors
<div className="bg-surface border border-default rounded-xl p-4">
  <h3 className="text-primary font-semibold">Title</h3>
  <p className="text-secondary">Description text</p>
</div>

// Primary button
<button className="bg-accent hover-accent text-inverse px-4 py-2 rounded-lg">
  Click Me
</button>

// Interactive card
<div className="bg-surface hover-surface border border-default hover-border rounded-lg">
  Hover me!
</div>
```

### 3. Using CSS Variables Directly

```tsx
// In inline styles
<div style={{ 
  backgroundColor: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)' 
}}>
  Content
</div>

// In CSS modules or styled-components
.myClass {
  background-color: var(--color-bg-surface);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}
```

## 🎨 Color Palette

### Light Theme (Default)
- **Page Background**: Warm cream (#F6F1E3)
- **Cards/Surfaces**: Off-white (#FFFDF7)
- **Primary Text**: Deep forest green (#253D31)
- **Accent**: Forest green (#253D31)
- **Borders**: Beige (#DCD2B4)

### Dark Theme
- **Page Background**: Near-black with green tint (#0D0F0D)
- **Cards/Surfaces**: Charcoal-green (#151815)
- **Primary Text**: Warm off-white (#F2F1EC)
- **Accent**: Vivid green (#7ED957) 🟢
- **Secondary Accent**: Warm orange (#F2A93B) 🟠
- **Borders**: Subtle dark green (#2A2E2A)

## 📚 Documentation Files

### For Developers

1. **`THEME_GUIDE.md`** - Complete documentation
   - All CSS variables with hex values
   - Usage patterns and examples
   - Best practices
   - Data visualization guidelines

2. **`COLOR_MIGRATION.md`** - Migration guide
   - Hardcoded color → theme variable mapping
   - Search & replace patterns
   - Common component patterns
   - Testing checklist

3. **`src/components/ThemePreview.tsx`** - Visual testing component
   - Live preview of all theme colors
   - Interactive theme switcher
   - Example components
   - Color palette reference

### Key Files

- **`src/index.css`** - Theme variable definitions and utility classes
- **`src/contexts/ThemeContext.tsx`** - React context for theme management
- **`src/components/settings/tabs/ThemeTab.tsx`** - User-facing theme settings

## 🛠️ Implementation Details

### Architecture

```
┌─────────────────────────────────────┐
│      ThemeProvider (Context)        │
│   - Manages theme state             │
│   - Listens to system preference    │
│   - Persists to localStorage        │
│   - Applies .dark class to <html>   │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│        CSS Custom Properties        │
│   :root { --color-*: lightValue }  │
│   .dark { --color-*: darkValue }   │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│         Utility Classes             │
│   .bg-surface { background:         │
│     var(--color-bg-surface) }       │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      Components (no changes!)       │
│   <div className="bg-surface        │
│         text-primary" />            │
└─────────────────────────────────────┘
```

### How It Works

1. **Theme Selection**: User selects theme via ThemeTab component
2. **Context Updates**: ThemeContext updates state and localStorage
3. **DOM Class**: `.dark` class added/removed from `<html>`
4. **CSS Variables Switch**: Browser re-evaluates all `var(--color-*)` references
5. **Smooth Transition**: All color properties transition over 200ms

### System Preference Detection

```tsx
// Automatically detects and responds to OS theme changes
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
mediaQuery.addEventListener("change", (e) => {
  if (theme === "system") {
    applyTheme(e.matches ? "dark" : "light");
  }
});
```

## 🎯 Usage Guidelines

### DO ✅

- Use semantic utility classes (`bg-surface`, `text-primary`)
- Use CSS variables in custom components
- Test components in both themes
- Follow the surface layering system (page → surface → surface-hover → elevated)
- Use `bg-accent` for all primary actions
- Use `text-secondary` for supporting text

### DON'T ❌

- Use hardcoded hex colors (`bg-[#FFFDF7]`)
- Use one-off dark mode classes (`dark:bg-gray-800`)
- Skip testing in dark mode
- Create custom color variables without adding to theme system
- Mix hardcoded and theme-aware colors in the same component

## 🔄 Migration Steps

### Step 1: Identify Components
```bash
# Find all hardcoded colors
grep -r "bg-\[#\|text-\[#\|border-\[#" src/**/*.tsx
```

### Step 2: Replace Colors
Use the mapping table in `COLOR_MIGRATION.md`

### Step 3: Test
```bash
npm run dev
```
- Switch to dark mode in Settings
- Verify all colors adapt correctly
- Check hover/focus states
- Test interactive elements

### Step 4: Verify
- [ ] Light mode looks correct
- [ ] Dark mode looks correct  
- [ ] System mode works
- [ ] Transitions are smooth
- [ ] No console errors
- [ ] All states (hover, focus, active) work

## 📦 Available Utility Classes

### Backgrounds
```
bg-page              # Main page background
bg-surface           # Cards, panels, modals
bg-surface-hover     # Hover states
bg-elevated          # Elevated surfaces
bg-accent            # Primary accent
bg-accent-hover      # Accent hover
bg-accent-light      # Light accent tint
```

### Text
```
text-primary         # Main text
text-secondary       # Supporting text
text-muted           # Placeholders, disabled
text-inverse         # Text on colored backgrounds
text-accent          # Accent text
```

### Borders
```
border-default       # Standard borders
border-hover         # Hover state borders
border-accent        # Accent borders
```

### Interactive Hover Classes
```
hover-surface        # Hover background
hover-accent         # Hover accent
hover-border         # Hover border
```

### Status Colors
```
bg-success           # Success backgrounds
bg-success-light     # Light success tint
text-success         # Success text
bg-error             # Error backgrounds
text-error           # Error text
bg-warning           # Warning backgrounds
text-warning         # Warning text
```

## 🧪 Testing & Preview

### Using ThemePreview Component

```tsx
// Add to your routes for testing
import ThemePreview from '@/components/ThemePreview';

<Route path="/theme-preview" element={<ThemePreview />} />
```

Access at: `http://localhost:5173/theme-preview`

### Manual Testing Checklist

- [ ] Settings modal theme tab works
- [ ] Theme persists after page reload
- [ ] System theme mode follows OS preference
- [ ] All buttons have correct colors
- [ ] All cards have visible borders
- [ ] Text is readable on all backgrounds
- [ ] Hover states are visible
- [ ] Focus states are visible
- [ ] Progress bars use accent color
- [ ] Form inputs have correct styling
- [ ] Modals/dialogs have correct backdrop

## 🚨 Troubleshooting

### Theme not switching?

Check if `ThemeProvider` wraps your app:
```tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

### Colors not updating?

1. Verify CSS is imported: `import './index.css'` in `main.tsx`
2. Check browser console for errors
3. Clear browser cache and rebuild
4. Verify utility class names are correct

### System theme not working?

Check browser support for `prefers-color-scheme`:
```tsx
const isDarkSupported = window.matchMedia('(prefers-color-scheme: dark)').matches !== undefined;
```

### Hardcoded colors still showing?

Search for remaining hardcoded colors:
```bash
# Find remaining hex colors
grep -r "bg-\[#\|text-\[#\|border-\[#" src/**/*.tsx

# Or use the migration script
node scripts/find-hardcoded-colors.js
```

## 🎨 Extending the Theme

### Adding New Colors

1. Add CSS variable to `src/index.css`:
```css
:root {
  --color-my-new-color: #hexvalue;
}

.dark {
  --color-my-new-color: #darkHexValue;
}
```

2. Add utility class:
```css
.bg-my-color { background-color: var(--color-my-new-color); }
.text-my-color { color: var(--color-my-new-color); }
```

3. Document in `THEME_GUIDE.md`

### Adding New Accent Colors

Future enhancement: Allow users to choose from multiple accent colors:

```tsx
const ACCENT_PRESETS = {
  forest: { light: '#253D31', dark: '#7ED957' },
  ocean: { light: '#1E5652', dark: '#5AC8BE' },
  sunset: { light: '#8B4513', dark: '#FF8C42' },
};
```

## 📈 Performance

- **CSS Variables**: Near-zero performance cost
- **Transitions**: GPU-accelerated, smooth 60fps
- **No JavaScript recalculation**: All theme logic in CSS
- **Bundle size**: ~3KB for theme context + CSS

## 🔮 Future Enhancements

- [ ] Per-user accent color customization
- [ ] High contrast mode
- [ ] Custom theme builder
- [ ] Theme export/import
- [ ] Scheduled theme switching (day/night)
- [ ] Per-page theme overrides
- [ ] Theme animation presets

## 📞 Support

- Check `THEME_GUIDE.md` for comprehensive docs
- Use `ThemePreview` component for visual reference
- Review `COLOR_MIGRATION.md` for migration help
- Contact dev team for edge cases

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Maintainer**: StudAI Dev Team
