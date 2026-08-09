# StudAI Theme System Guide

## Overview

The StudAI app features a sophisticated dual-theme system with carefully crafted color palettes for both light and dark modes. The theme system uses CSS custom properties (CSS variables) to enable seamless switching between modes without component-level changes.

## Color Philosophy

### Light Theme
- **Warm, earthy tones** inspired by natural materials
- High readability with deep forest greens on cream backgrounds
- Professional academic aesthetic

### Dark Theme
- **Near-black background** (#0D0F0D) with subtle green tint
- **Charcoal-green surfaces** (#151815) for cards and panels
- **Vivid green accent** (#7ED957) for interactive elements and data visualization
- **Warm orange** (#F2A93B) for secondary highlights and streaks
- **Off-white text** (#F2F1EC) for optimal readability without harsh contrast

## CSS Custom Properties

All theme colors are defined as CSS variables in `src/index.css`:

### Backgrounds & Surfaces

| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|--------|
| `--color-bg-page` | #F6F1E3 | #0D0F0D | Main page background |
| `--color-bg-surface` | #FFFDF7 | #151815 | Cards, panels, modals |
| `--color-bg-surface-hover` | #F9F6EE | #1C201C | Hover states, nested elements |
| `--color-bg-elevated` | #EFE8D4 | #212521 | Elevated components |

### Text Colors

| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|--------|
| `--color-text-primary` | #253D31 | #F2F1EC | Main headings, body text |
| `--color-text-secondary` | #5B6156 | #8A8D87 | Secondary text, descriptions |
| `--color-text-muted` | #A9A18A | #5A5D58 | Placeholder, disabled text |
| `--color-text-inverse` | #F6F1E3 | #0D0F0D | Text on colored backgrounds |

### Borders

| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|--------|
| `--color-border` | #DCD2B4 | #2A2E2A | Default borders |
| `--color-border-hover` | #8CA37E | #3A3E3A | Hover state borders |

### Accent Colors

| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|--------|
| `--color-accent-primary` | #253D31 | #7ED957 | Primary buttons, active states |
| `--color-accent-primary-hover` | #2F4A3D | #8FE168 | Button hover states |
| `--color-accent-primary-light` | #8CA37E | #7ED957 | Lighter accent variant |
| `--color-accent-primary-bg` | #EFE8D4 | rgba(126, 217, 87, 0.15) | Accent background tint |
| `--color-accent-secondary` | #8CA37E | #F2A93B | Secondary highlights |
| `--color-accent-secondary-hover` | #7A9168 | #FFB84D | Secondary hover |

### Status Colors

| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|--------|
| `--color-success` | #8CA37E | #7ED957 | Success messages, progress |
| `--color-success-bg` | rgba(140, 163, 126, 0.2) | rgba(126, 217, 87, 0.15) | Success backgrounds |
| `--color-error` | #8B3A3A | #E67E7E | Error messages |
| `--color-error-bg` | #F7E8E8 | rgba(230, 126, 126, 0.15) | Error backgrounds |
| `--color-warning` | #F2A93B | #F2A93B | Warnings, streaks |
| `--color-warning-bg` | rgba(242, 169, 59, 0.15) | rgba(242, 169, 59, 0.15) | Warning backgrounds |

## Utility Classes

Pre-built utility classes are available for common theme-aware styling:

### Background Classes
```css
.bg-page              /* Page background */
.bg-surface           /* Card/panel background */
.bg-surface-hover     /* Hover surface */
.bg-elevated          /* Elevated surface */
.bg-accent            /* Primary accent background */
.bg-accent-hover      /* Accent hover state */
.bg-accent-light      /* Light accent tint */
```

### Text Classes
```css
.text-primary         /* Primary text color */
.text-secondary       /* Secondary text color */
.text-muted           /* Muted/placeholder text */
.text-inverse         /* Inverse text (light on dark or vice versa) */
.text-accent          /* Accent text color */
```

### Border Classes
```css
.border-default       /* Default border */
.border-hover         /* Hover border */
.border-accent        /* Accent border */
```

### Interactive Classes
```css
.hover-surface:hover  /* Hover surface background */
.hover-accent:hover   /* Hover accent background */
.hover-border:hover   /* Hover border color */
```

## Usage Examples

### Basic Card Component
```tsx
<div className="bg-surface border border-default rounded-xl p-4">
  <h3 className="text-primary font-serif text-lg">Card Title</h3>
  <p className="text-secondary text-sm">Card description text</p>
</div>
```

### Primary Button
```tsx
<button className="bg-accent hover-accent text-inverse px-4 py-2 rounded-lg">
  Primary Action
</button>
```

### Interactive List Item
```tsx
<div className="bg-surface hover-surface border border-default hover-border rounded-lg p-3 cursor-pointer">
  <span className="text-primary">List Item</span>
</div>
```

### Progress Indicator
```tsx
<div className="h-2 bg-surface rounded-full overflow-hidden">
  <div className="h-full bg-accent" style={{ width: '60%' }} />
</div>
```

## Theme Switching

The theme is managed through the `ThemeContext`:

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  // theme: "light" | "dark" | "system"
  // resolvedTheme: "light" | "dark" (actual applied theme)
  
  return (
    <button onClick={() => setTheme('dark')}>
      Switch to Dark Mode
    </button>
  );
}
```

## Best Practices

1. **Always use semantic variables** - Use `--color-text-primary` instead of hardcoded hex values
2. **Test in both themes** - Verify all components work in light and dark mode
3. **Respect the hierarchy** - Use the surface layering system (page → surface → surface-hover → elevated)
4. **Consistent interactions** - Use accent colors for all interactive elements
5. **Smooth transitions** - All color properties have automatic 200ms transitions

## Data Visualization

For charts and data visualizations:
- **Primary data**: Use `--color-accent-primary` at full opacity for lines/strokes
- **Fill areas**: Use `--color-accent-primary` at 15-30% opacity
- **Secondary data**: Use `--color-accent-secondary` for highlights
- **Grid lines**: Use `--color-border` for subtle grid lines

Example:
```css
/* Chart line */
stroke: var(--color-accent-primary);
stroke-width: 2px;

/* Chart fill */
fill: var(--color-accent-primary);
fill-opacity: 0.2;
```

## Migration from Hardcoded Colors

When converting existing components:

**Before:**
```tsx
<div className="bg-[#FFFDF7] border-[#DCD2B4] text-[#253D31]">
```

**After:**
```tsx
<div className="bg-surface border-default text-primary">
```

This ensures the component automatically adapts to theme changes.

## System Preference Support

The theme system respects the user's system preference when set to "system" mode:
- Automatically detects `prefers-color-scheme: dark`
- Listens for system theme changes
- Persists user preference in localStorage

## Future Enhancements

Planned features:
- [ ] Custom accent color picker (beyond preset colors)
- [ ] High contrast mode for accessibility
- [ ] Per-component theme overrides
- [ ] Theme animation customization
