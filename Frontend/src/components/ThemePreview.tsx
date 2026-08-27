import { useTheme } from "../contexts/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

/**
 * ThemePreview Component
 * 
 * A comprehensive preview of all theme colors and components.
 * Useful for testing and documenting the theme system.
 */
export default function ThemePreview() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="bg-page min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-4xl text-primary mb-2">
            Theme System Preview
          </h1>
          <p className="text-secondary">
            Current mode: <span className="font-semibold">{theme}</span> (
            resolved: {resolvedTheme})
          </p>
        </div>

        {/* Theme Switcher */}
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-primary mb-4">
            Theme Controls
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                theme === "light"
                  ? "bg-accent text-inverse border-accent"
                  : "bg-surface border-default text-secondary hover-surface hover-border"
              }`}
            >
              <Sun size={18} />
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                theme === "dark"
                  ? "bg-accent text-inverse border-accent"
                  : "bg-surface border-default text-secondary hover-surface hover-border"
              }`}
            >
              <Moon size={18} />
              Dark
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                theme === "system"
                  ? "bg-accent text-inverse border-accent"
                  : "bg-surface border-default text-secondary hover-surface hover-border"
              }`}
            >
              <Monitor size={18} />
              System
            </button>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-primary mb-4">Typography</h2>
          <div className="space-y-3">
            <p className="text-primary text-lg font-semibold">
              Primary Text - Main headings and important content
            </p>
            <p className="text-secondary">
              Secondary Text - Descriptions and supporting information
            </p>
            <p className="text-muted text-sm">
              Muted Text - Placeholders and disabled states
            </p>
            <p className="text-accent font-medium">
              Accent Text - Links and highlighted content
            </p>
          </div>
        </div>

        {/* Surface Layers */}
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-primary mb-4">
            Surface Layers
          </h2>
          <div className="space-y-4">
            <div className="bg-page p-4 rounded-lg">
              <p className="text-primary text-sm font-medium mb-1">
                Page Background
              </p>
              <p className="text-muted text-xs">var(--color-bg-page)</p>
            </div>
            <div className="bg-surface p-4 rounded-lg border border-default">
              <p className="text-primary text-sm font-medium mb-1">
                Surface (Cards, Panels)
              </p>
              <p className="text-muted text-xs">var(--color-bg-surface)</p>
            </div>
            <div className="bg-surface-hover p-4 rounded-lg border border-default">
              <p className="text-primary text-sm font-medium mb-1">
                Surface Hover / Nested
              </p>
              <p className="text-muted text-xs">
                var(--color-bg-surface-hover)
              </p>
            </div>
            <div className="bg-elevated p-4 rounded-lg border border-default">
              <p className="text-primary text-sm font-medium mb-1">
                Elevated Surface
              </p>
              <p className="text-muted text-xs">var(--color-bg-elevated)</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-primary mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <button className="bg-accent hover-accent text-inverse px-4 py-2 rounded-lg font-medium">
              Primary Button
            </button>
            <button className="bg-surface border border-default hover-surface hover-border text-primary px-4 py-2 rounded-lg font-medium">
              Secondary Button
            </button>
            <button className="bg-accent-light text-accent px-4 py-2 rounded-lg font-medium hover:bg-accent hover:text-inverse transition-all">
              Accent Light Button
            </button>
            <button
              className="text-muted px-4 py-2 rounded-lg cursor-not-allowed"
              disabled
            >
              Disabled Button
            </button>
          </div>
        </div>

        {/* Interactive Cards */}
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-primary mb-4">
            Interactive Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface hover-surface border border-default hover-border rounded-xl p-4 cursor-pointer transition-all">
              <h3 className="text-primary font-semibold mb-2">Card Title</h3>
              <p className="text-secondary text-sm">
                Hover over this card to see the interactive state change.
              </p>
            </div>
            <div className="bg-surface hover-surface border border-default hover-border rounded-xl p-4 cursor-pointer transition-all">
              <h3 className="text-primary font-semibold mb-2">Another Card</h3>
              <p className="text-secondary text-sm">
                All cards use semantic color variables.
              </p>
            </div>
            <div className="bg-surface hover-surface border border-default hover-border rounded-xl p-4 cursor-pointer transition-all">
              <h3 className="text-primary font-semibold mb-2">Third Card</h3>
              <p className="text-secondary text-sm">
                Theme changes apply automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-primary mb-4">
            Progress Indicators
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-primary">Course Progress</span>
                <span className="text-secondary">75%</span>
              </div>
              <div className="h-2 bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: "75%" }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-primary">Study Streak</span>
                <span className="text-warning">12 days 🔥</span>
              </div>
              <div className="h-2 bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-secondary transition-all"
                  style={{ width: "90%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-primary mb-4">
            Status Colors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-success-light border border-accent rounded-lg p-4">
              <p className="text-success font-semibold mb-1">✓ Success</p>
              <p className="text-secondary text-sm">
                Task completed successfully
              </p>
            </div>
            <div className="bg-error border border-error rounded-lg p-4">
              <p className="text-error font-semibold mb-1">✕ Error</p>
              <p className="text-secondary text-sm">
                Something went wrong
              </p>
            </div>
            <div className="bg-warning border border-warning rounded-lg p-4">
              <p className="text-warning font-semibold mb-1">⚠ Warning</p>
              <p className="text-secondary text-sm">Please review this item</p>
            </div>
          </div>
        </div>

        {/* Form Elements */}
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-primary mb-4">
            Form Elements
          </h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Text Input
              </label>
              <input
                type="text"
                placeholder="Enter text..."
                className="w-full px-3 py-2 bg-surface border border-default rounded-lg text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Textarea
              </label>
              <textarea
                placeholder="Enter description..."
                rows={3}
                className="w-full px-3 py-2 bg-surface border border-default rounded-lg text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Select Dropdown
              </label>
              <select className="w-full px-3 py-2 bg-surface border border-default rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all cursor-pointer">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Color Palette Reference */}
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-primary mb-4">
            Color Palette Reference
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Page BG", var: "--color-bg-page", class: "bg-page" },
              {
                name: "Surface",
                var: "--color-bg-surface",
                class: "bg-surface",
              },
              {
                name: "Surface Hover",
                var: "--color-bg-surface-hover",
                class: "bg-surface-hover",
              },
              {
                name: "Elevated",
                var: "--color-bg-elevated",
                class: "bg-elevated",
              },
              {
                name: "Primary Text",
                var: "--color-text-primary",
                class: "bg-primary text-inverse",
              },
              {
                name: "Secondary Text",
                var: "--color-text-secondary",
                class: "bg-secondary text-inverse",
              },
              {
                name: "Accent",
                var: "--color-accent-primary",
                class: "bg-accent",
              },
              {
                name: "Accent Secondary",
                var: "--color-accent-secondary",
                class: "bg-accent-secondary",
              },
            ].map((color) => (
              <div key={color.name} className="space-y-2">
                <div
                  className={`${color.class} h-16 rounded-lg border border-default`}
                />
                <p className="text-xs font-medium text-primary">{color.name}</p>
                <p className="text-xs text-muted font-mono">{color.var}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
