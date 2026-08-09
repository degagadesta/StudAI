# 🧪 Theme Testing Checklist

## Pre-Flight Check

Before testing, ensure:
- [ ] Dev server is running (`npm run dev`)
- [ ] Browser cache is cleared
- [ ] No console errors on page load
- [ ] ThemeProvider is wrapping the app

## 🎨 Visual Testing

### Light Mode Verification
- [ ] Page background is warm cream (#F6F1E3)
- [ ] Cards/surfaces are off-white (#FFFDF7)
- [ ] Primary text is forest green (#253D31)
- [ ] Secondary text is gray-green (#5B6156)
- [ ] Borders are beige (#DCD2B4)
- [ ] Buttons are forest green (#253D31)
- [ ] Hover states are visible
- [ ] Focus states have visible rings
- [ ] All text is readable

### Dark Mode Verification
- [ ] Page background is near-black (#0D0F0D)
- [ ] Cards/surfaces are charcoal-green (#151815)
- [ ] Cards are visibly distinct from page background
- [ ] Primary text is warm off-white (#F2F1EC)
- [ ] Secondary text is medium gray (#8A8D87)
- [ ] Borders are subtle green-gray (#2A2E2A)
- [ ] Primary buttons are vivid green (#7ED957)
- [ ] Hover states darken/lighten appropriately
- [ ] Focus states are visible (green outline)
- [ ] All text is readable without eye strain
- [ ] Scrollbars are dark-themed
- [ ] Text selection has green background

### Theme Switching
- [ ] Settings → App Theme tab exists
- [ ] Three theme options visible (Light/Dark/System)
- [ ] Icons show correctly (Sun/Moon/Monitor)
- [ ] Clicking Light Mode switches to light theme
- [ ] Clicking Dark Mode switches to dark theme
- [ ] Clicking System Mode respects OS preference
- [ ] Theme transitions smoothly (no flash)
- [ ] All colors animate during transition
- [ ] No layout shift during theme change
- [ ] Theme persists after page reload
- [ ] Theme persists after browser restart

## 🖱️ Interaction Testing

### Hover States
- [ ] Cards darken on hover
- [ ] Buttons highlight on hover
- [ ] List items show hover background
- [ ] Borders become more visible on hover
- [ ] Cursor changes to pointer on interactive elements
- [ ] Hover transitions are smooth

### Focus States
- [ ] Tab key navigation works
- [ ] Focused inputs show green ring
- [ ] Focused buttons show outline
- [ ] Focus is visible in both themes
- [ ] Focus order is logical
- [ ] Focus styles don't break layout

### Active States
- [ ] Active nav items use accent color
- [ ] Selected items are clearly highlighted
- [ ] Checkboxes/radios show active state
- [ ] Toggle switches show active state
- [ ] Active states work in both themes

## 📱 Component Testing

### Settings Modal
- [ ] Modal opens correctly
- [ ] Modal backdrop is semi-transparent
- [ ] Modal content uses correct theme
- [ ] Close button works
- [ ] Sidebar uses theme colors
- [ ] Active tab is highlighted
- [ ] All tabs are clickable
- [ ] Theme tab shows theme options
- [ ] Theme selection works
- [ ] Close button uses accent color

### Forms
- [ ] Input borders are visible
- [ ] Input text is readable
- [ ] Placeholders are muted but visible
- [ ] Focus rings appear on focus
- [ ] Disabled inputs look disabled
- [ ] Error states show red color
- [ ] Success states show green color
- [ ] Select dropdowns styled correctly
- [ ] Textareas styled correctly

### Buttons
- [ ] Primary buttons use accent color
- [ ] Primary button text is readable (inverse color)
- [ ] Secondary buttons have borders
- [ ] Secondary button hover works
- [ ] Disabled buttons look disabled
- [ ] Button shadows are theme-appropriate
- [ ] Icon buttons styled correctly

### Cards
- [ ] Card backgrounds distinct from page
- [ ] Card borders visible but subtle
- [ ] Card hover states work
- [ ] Nested cards have layered appearance
- [ ] Card shadows appropriate for theme
- [ ] Card text is readable

### Lists
- [ ] List items have hover states
- [ ] List item dividers are visible
- [ ] Selected items are highlighted
- [ ] List backgrounds use surface color
- [ ] Scrollable lists work correctly

### Progress Bars
- [ ] Progress bar background is visible
- [ ] Progress bar fill uses accent color
- [ ] Progress percentage is readable
- [ ] Progress animates smoothly
- [ ] Multiple progress bars consistent

### Status Indicators
- [ ] Success status uses green
- [ ] Error status uses red
- [ ] Warning status uses orange
- [ ] Status badges readable
- [ ] Status icons match text color

## 🔄 System Integration

### System Theme Detection
- [ ] Set OS to light mode → System theme shows light
- [ ] Set OS to dark mode → System theme shows dark
- [ ] Change OS theme while app open → App updates
- [ ] System theme works on macOS
- [ ] System theme works on Windows
- [ ] System theme works on Linux

### localStorage Persistence
- [ ] Select light mode → Reload → Still light
- [ ] Select dark mode → Reload → Still dark
- [ ] Select system mode → Reload → Still system
- [ ] Clear localStorage → Defaults to light
- [ ] Theme key in localStorage is correct

### Browser Compatibility
- [ ] Chrome/Edge (Chromium) works
- [ ] Firefox works
- [ ] Safari works (if available)
- [ ] Mobile browsers work
- [ ] Private/Incognito mode works

## 📊 Data Visualization

### Charts (if applicable)
- [ ] Chart fills use accent color with opacity
- [ ] Chart strokes use accent color
- [ ] Chart grid lines are visible but subtle
- [ ] Chart text labels are readable
- [ ] Chart tooltips styled correctly
- [ ] Multiple datasets use different colors
- [ ] Charts animate on theme change
- [ ] Chart legends match theme

## ♿ Accessibility

### Color Contrast
- [ ] Primary text meets WCAG AA (4.5:1)
- [ ] Secondary text meets WCAG AA
- [ ] Button text meets WCAG AA
- [ ] Link text meets WCAG AA
- [ ] Error messages are readable
- [ ] Success messages are readable

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Tab order is logical
- [ ] Enter key activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys work in select/radio groups
- [ ] Focus visible at all times

### Screen Readers
- [ ] Theme buttons have aria-labels
- [ ] Active theme announced
- [ ] Status messages announced
- [ ] Form errors announced
- [ ] Modal opened/closed announced

## 🔬 Edge Cases

### Unusual Scenarios
- [ ] Rapid theme switching doesn't break
- [ ] Theme works with slow network
- [ ] Theme works offline (PWA)
- [ ] Theme works on first visit
- [ ] Theme works with animations disabled
- [ ] Theme works at 200% zoom
- [ ] Theme works on small screens (320px)
- [ ] Theme works on large screens (4K)

### Error States
- [ ] Theme loads if localStorage corrupted
- [ ] Theme loads if no localStorage support
- [ ] Theme loads if CSS fails to load
- [ ] Theme loads if JS fails
- [ ] Fallback to light mode on error

## 🚀 Performance

### Loading Performance
- [ ] Theme applies before first paint
- [ ] No flash of unstyled content (FOUC)
- [ ] No flash of wrong theme
- [ ] Page loads in <2 seconds
- [ ] Theme CSS is cached

### Runtime Performance
- [ ] Theme switch takes <300ms
- [ ] No jank during theme switch
- [ ] Smooth 60fps transitions
- [ ] No memory leaks on repeated switches
- [ ] CPU usage normal during switch

### Bundle Size
- [ ] Theme CSS adds <10KB
- [ ] Theme context adds <3KB
- [ ] No unused CSS variables
- [ ] No duplicate styles

## 📸 Visual Regression

### Take Screenshots
- [ ] Homepage light mode
- [ ] Homepage dark mode
- [ ] Settings modal light mode
- [ ] Settings modal dark mode
- [ ] Forms light mode
- [ ] Forms dark mode
- [ ] Dashboard light mode
- [ ] Dashboard dark mode
- [ ] Compare with design mockups
- [ ] Document any differences

## 🐛 Bug Testing

### Known Issues to Check
- [ ] No white flashes during theme switch
- [ ] No inline styles overriding theme
- [ ] No hardcoded colors remaining
- [ ] No console errors in dark mode
- [ ] No console warnings about theme
- [ ] No React context errors
- [ ] No infinite re-renders

## 📝 Documentation Verification

### Docs Check
- [ ] THEME_README.md is accurate
- [ ] THEME_GUIDE.md is accurate
- [ ] COLOR_MIGRATION.md is accurate
- [ ] All color values match implementation
- [ ] All examples work as shown
- [ ] All utility classes documented
- [ ] All CSS variables documented

## ✅ Final Checklist

### Before Deployment
- [ ] All visual tests pass
- [ ] All interaction tests pass
- [ ] All accessibility tests pass
- [ ] All performance tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] Theme works on staging
- [ ] Theme reviewed by design team
- [ ] Theme reviewed by dev team
- [ ] Documentation is complete
- [ ] Migration guide is complete

### QA Sign-off
- [ ] QA tested light mode
- [ ] QA tested dark mode
- [ ] QA tested system mode
- [ ] QA tested theme switching
- [ ] QA tested on multiple browsers
- [ ] QA tested on multiple devices
- [ ] QA tested accessibility
- [ ] QA approved for production

## 🎯 Success Criteria

**All tests must pass before considering the theme system complete.**

### Critical (Must Pass)
- Theme switches correctly
- Both themes are visually correct
- No console errors
- Persists across reloads
- Text is readable in both themes
- Interactive elements work

### Important (Should Pass)
- System theme detection works
- Smooth transitions
- Accessibility meets WCAG AA
- Works on major browsers
- Good performance

### Nice to Have (Optional)
- WCAG AAA compliance
- Works on all browsers
- Perfect design match
- Additional theme variants

## 📊 Test Results

### Test Environment
- Date: _______________
- Tester: _______________
- Browser: _______________
- OS: _______________
- Screen Size: _______________

### Results Summary
- Tests Run: ___/___
- Tests Passed: ___/___
- Tests Failed: ___/___
- Bugs Found: ___
- Critical Issues: ___

### Notes
```
[Add any notes, issues, or observations here]
```

---

**Testing Complete**: ⬜ Yes ⬜ No  
**Ready for Production**: ⬜ Yes ⬜ No  
**Sign-off**: _______________ Date: _______________
