# Color Migration Guide

## Quick Reference: Hardcoded Colors → Theme Variables

This guide helps you convert existing hardcoded hex colors to theme-aware CSS variables.

### Background Colors

| Old Hardcoded Value | New Utility Class | CSS Variable |
|---------------------|-------------------|--------------|
| `bg-[#F6F1E3]` | `bg-page` | `var(--color-bg-page)` |
| `bg-[#FFFDF7]` | `bg-surface` | `var(--color-bg-surface)` |
| `bg-[#F9F6EE]` | `bg-surface-hover` | `var(--color-bg-surface-hover)` |
| `bg-[#EFE8D4]` | `bg-elevated` | `var(--color-bg-elevated)` |
| `bg-white` | `bg-surface` | `var(--color-bg-surface)` |

### Text Colors

| Old Hardcoded Value | New Utility Class | CSS Variable |
|---------------------|-------------------|--------------|
| `text-[#253D31]` | `text-primary` | `var(--color-text-primary)` |
| `text-[#5B6156]` | `text-secondary` | `var(--color-text-secondary)` |
| `text-[#A9A18A]` | `text-muted` | `var(--color-text-muted)` |
| `text-[#F6F1E3]` or `text-white` | `text-inverse` | `var(--color-text-inverse)` |

### Border Colors

| Old Hardcoded Value | New Utility Class | CSS Variable |
|---------------------|-------------------|--------------|
| `border-[#DCD2B4]` | `border-default` | `var(--color-border)` |
| `border-[#8CA37E]` | `border-hover` or `border-accent` | `var(--color-border-hover)` |

### Accent/Primary Colors

| Old Hardcoded Value | New Utility Class | CSS Variable |
|---------------------|-------------------|--------------|
| `bg-[#253D31]` | `bg-accent` | `var(--color-accent-primary)` |
| `bg-[#2F4A3D]` | `bg-accent-hover` | `var(--color-accent-primary-hover)` |
| `bg-[#8CA37E]` | `bg-accent-light` or `text-accent` | `var(--color-accent-primary-light)` |
| `text-[#2F4A3D]` | `text-accent` | `var(--color-accent-primary)` |

### Status Colors

| Old Hardcoded Value | New Utility Class | CSS Variable |
|---------------------|-------------------|--------------|
| `text-[#8B3A3A]` | `text-error` | `var(--color-error)` |
| `bg-[#F7E8E8]` | `bg-error` | `var(--color-error-bg)` |
| Success colors | `bg-success-light`, `text-success` | Various success vars |

## Common Patterns

### Pattern 1: Modal/Dialog Backdrop

**Before:**
```tsx
<div className="fixed inset-0 bg-[#253D31]/40 backdrop-blur-xs">
```

**After:**
```tsx
<div className="fixed inset-0 bg-page/40 backdrop-blur-sm">
```

### Pattern 2: Card Component

**Before:**
```tsx
<div className="bg-[#FFFDF7] border border-[#DCD2B4] rounded-xl">
  <h3 className="text-[#253D31]">Title</h3>
  <p className="text-[#5B6156]">Description</p>
</div>
```

**After:**
```tsx
<div className="bg-surface border border-default rounded-xl">
  <h3 className="text-primary">Title</h3>
  <p className="text-secondary">Description</p>
</div>
```

### Pattern 3: Primary Button

**Before:**
```tsx
<button className="bg-[#253D31] hover:bg-[#2F4A3D] text-[#F6F1E3]">
  Click Me
</button>
```

**After:**
```tsx
<button className="bg-accent hover-accent text-inverse">
  Click Me
</button>
```

### Pattern 4: Interactive List Item

**Before:**
```tsx
<div className="bg-[#FFFDF7] hover:bg-[#F9F6EE] border border-[#DCD2B4] hover:border-[#8CA37E]">
```

**After:**
```tsx
<div className="bg-surface hover-surface border border-default hover-border">
```

### Pattern 5: Progress Bar

**Before:**
```tsx
<div className="h-2 bg-[#DCD2B4] rounded-full">
  <div className="h-full bg-[#8CA37E]" style={{ width: '60%' }} />
</div>
```

**After:**
```tsx
<div className="h-2 bg-elevated rounded-full">
  <div className="h-full bg-accent" style={{ width: '60%' }} />
</div>
```

### Pattern 6: Icon Container

**Before:**
```tsx
<div className="w-10 h-10 rounded-lg bg-[#EFE8D4] flex items-center justify-center">
  <Icon className="text-[#2F4A3D]" />
</div>
```

**After:**
```tsx
<div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center">
  <Icon className="text-accent" />
</div>
```

### Pattern 7: Form Input

**Before:**
```tsx
<input className="border border-[#DCD2B4] bg-[#FFFDF7] text-[#253D31] placeholder:text-[#A9A18A] focus:ring-[#253D31]" />
```

**After:**
```tsx
<input className="border border-default bg-surface text-primary placeholder:text-muted focus:ring-2 focus:ring-accent" />
```

## Search & Replace Guide

You can use these regex patterns to help automate migration:

### VSCode Search & Replace

1. **Background Colors:**
   - Search: `bg-\[#FFFDF7\]`
   - Replace: `bg-surface`

2. **Text Colors:**
   - Search: `text-\[#253D31\]`
   - Replace: `text-primary`

3. **Border Colors:**
   - Search: `border-\[#DCD2B4\]`
   - Replace: `border-default`

### Comprehensive List

```
# Backgrounds
bg-[#F6F1E3] → bg-page
bg-[#FFFDF7] → bg-surface
bg-[#F9F6EE] → bg-surface-hover
bg-[#EFE8D4] → bg-elevated

# Text
text-[#253D31] → text-primary
text-[#5B6156] → text-secondary
text-[#A9A18A] → text-muted
text-[#F6F1E3] → text-inverse

# Borders
border-[#DCD2B4] → border-default
border-[#8CA37E] → border-hover (or border-accent for active states)

# Accent/Actions
bg-[#253D31] → bg-accent
bg-[#2F4A3D] → bg-accent-hover (or just use hover-accent class)
bg-[#8CA37E] → bg-accent-light (for light tints)
text-[#2F4A3D] → text-accent
text-[#8CA37E] → text-accent

# Errors
text-[#8B3A3A] → text-error
bg-[#F7E8E8] → bg-error
```

## Manual Review Required

Some patterns need manual review:

1. **Opacity values** - Check if opacity should apply in both themes
   ```tsx
   // Before
   bg-[#253D31]/40
   
   // After - verify opacity works in both themes
   bg-accent/40
   ```

2. **Hover states combining colors** - Use hover utility classes
   ```tsx
   // Before
   bg-[#FFFDF7] hover:bg-[#F9F6EE]
   
   // After
   bg-surface hover-surface
   ```

3. **Ring/Focus colors** - Update to use theme-aware ring colors
   ```tsx
   // Before
   focus:ring-[#253D31]
   
   // After
   focus:ring-2 focus:ring-accent
   ```

4. **Dark mode specific styles** - Remove these, let theme handle it
   ```tsx
   // Before
   className={isDark ? "bg-gray-800" : "bg-white"}
   
   // After
   className="bg-surface"
   ```

## Testing Checklist

After migration, verify:

- [ ] Component looks correct in light mode
- [ ] Component looks correct in dark mode
- [ ] Component looks correct in system mode
- [ ] Hover states work in both themes
- [ ] Focus states are visible in both themes
- [ ] Text remains readable in both themes
- [ ] Borders are visible but not too prominent in both themes
- [ ] Interactive elements are clearly identifiable

## Tools

### Component Scanner Script

Create a script to find components with hardcoded colors:

```bash
# Find all hardcoded hex colors in TSX files
grep -r "bg-\[#\|text-\[#\|border-\[#" src/**/*.tsx
```

### Git Workflow

When migrating:

```bash
# Create a migration branch
git checkout -b theme/migrate-colors

# Migrate one component at a time
# Commit after each component
git add src/components/MyComponent.tsx
git commit -m "theme: migrate MyComponent to theme system"

# Test thoroughly before merging
npm run dev
# Test light mode, dark mode, and system mode
```

## Priority Order

Migrate in this order for best results:

1. **Layout components** (Sidebar, Topbar, DashboardLayout)
2. **Common UI components** (Buttons, Cards, Modals)
3. **Form components** (Inputs, Selects, Textareas)
4. **Page components** (Dashboard, Settings, etc.)
5. **Data visualization** (Charts, Graphs, Progress bars)

## Need Help?

- Check `THEME_GUIDE.md` for comprehensive documentation
- Use `ThemePreview.tsx` component to test theme colors
- Review `index.css` for all available CSS variables
- Contact the dev team for edge cases
