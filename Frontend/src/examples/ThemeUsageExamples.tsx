/**
 * Theme Usage Examples
 * 
 * This file contains practical examples of using the theme system
 * in various common scenarios. Use these as templates for your components.
 */

import { useTheme } from "../contexts/ThemeContext";
import { Sun, Moon, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

// ============================================
// Example 1: Dashboard Card
// ============================================
export function DashboardCard() {
  return (
    <div className="bg-surface border border-default hover-border rounded-xl p-6 hover-surface transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-primary">Course Progress</h3>
        <TrendingUp size={20} className="text-accent" />
      </div>
      
      <p className="text-secondary text-sm mb-4">
        You've completed 8 out of 12 courses this semester.
      </p>
      
      {/* Progress bar using theme colors */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-secondary">Progress</span>
          <span className="text-primary font-medium">67%</span>
        </div>
        <div className="h-2 bg-elevated rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-500"
            style={{ width: '67%' }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Example 2: Form with Theme-Aware Inputs
// ============================================
export function ThemeAwareForm() {
  return (
    <form className="bg-surface border border-default rounded-xl p-6 space-y-4">
      <h2 className="font-serif text-xl text-primary mb-4">Create New Task</h2>
      
      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Task Title
        </label>
        <input
          type="text"
          placeholder="Enter task title..."
          className="w-full px-3 py-2 bg-surface border border-default rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
        />
      </div>
      
      {/* Textarea */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Description
        </label>
        <textarea
          rows={3}
          placeholder="Add details..."
          className="w-full px-3 py-2 bg-surface border border-default rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none"
        />
      </div>
      
      {/* Select */}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Priority
        </label>
        <select className="w-full px-3 py-2 bg-surface border border-default rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all cursor-pointer">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      
      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-accent hover-accent text-inverse py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
        >
          Create Task
        </button>
        <button
          type="button"
          className="px-4 bg-surface border border-default hover-surface hover-border text-secondary hover:text-primary rounded-lg font-medium transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ============================================
// Example 3: Status Alerts
// ============================================
export function StatusAlerts() {
  return (
    <div className="space-y-3">
      {/* Success Alert */}
      <div className="bg-success-light border border-accent rounded-lg p-4 flex items-start gap-3">
        <CheckCircle size={20} className="text-success shrink-0 mt-0.5" />
        <div>
          <h4 className="text-success font-semibold text-sm mb-1">Success!</h4>
          <p className="text-secondary text-sm">
            Your changes have been saved successfully.
          </p>
        </div>
      </div>
      
      {/* Error Alert */}
      <div className="bg-error border border-error rounded-lg p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
        <div>
          <h4 className="text-error font-semibold text-sm mb-1">Error</h4>
          <p className="text-secondary text-sm">
            Unable to save your changes. Please try again.
          </p>
        </div>
      </div>
      
      {/* Warning Alert */}
      <div className="bg-warning border border-warning rounded-lg p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-warning shrink-0 mt-0.5" />
        <div>
          <h4 className="text-warning font-semibold text-sm mb-1">Warning</h4>
          <p className="text-secondary text-sm">
            This action cannot be undone. Please review before continuing.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Example 4: Interactive List
// ============================================
export function InteractiveList() {
  const items = [
    { id: 1, title: "Complete Math Assignment", status: "completed" },
    { id: 2, title: "Study for Physics Exam", status: "in-progress" },
    { id: 3, title: "Read Chapter 5", status: "pending" },
  ];
  
  return (
    <div className="bg-surface border border-default rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-default bg-surface-hover">
        <h3 className="font-serif text-lg text-primary">Tasks</h3>
      </div>
      
      <div className="divide-y divide-default">
        {items.map((item) => (
          <div
            key={item.id}
            className="px-4 py-3 hover-surface transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={item.status === "completed"}
                className="w-4 h-4 text-accent border-default rounded focus:ring-2 focus:ring-accent cursor-pointer"
                readOnly
              />
              <span className={`text-sm ${
                item.status === "completed" 
                  ? "text-muted line-through" 
                  : "text-primary"
              }`}>
                {item.title}
              </span>
            </div>
            
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              item.status === "completed"
                ? "bg-success-light text-success"
                : item.status === "in-progress"
                ? "bg-warning text-warning"
                : "bg-elevated text-secondary"
            }`}>
              {item.status.replace("-", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Example 5: Theme Toggle Button
// ============================================
export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-surface hover-surface border border-default hover-border rounded-lg transition-all"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-accent" />
      ) : (
        <Moon size={18} className="text-accent" />
      )}
    </button>
  );
}

// ============================================
// Example 6: Modal/Dialog
// ============================================
export function ThemeAwareModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-page/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-default rounded-2xl max-w-md w-full shadow-xl-theme">
        {/* Header */}
        <div className="px-6 py-4 border-b border-default">
          <h2 className="font-serif text-xl text-primary">Confirm Action</h2>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-secondary text-sm">
            Are you sure you want to proceed with this action? This change will be permanent.
          </p>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-default flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface border border-default hover-surface hover-border text-secondary hover:text-primary rounded-lg font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent hover-accent text-inverse rounded-lg font-medium transition-all shadow-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Example 7: Stats Grid
// ============================================
export function StatsGrid() {
  const stats = [
    { label: "Total Courses", value: "12", change: "+2", trend: "up" },
    { label: "Completed", value: "8", change: "+3", trend: "up" },
    { label: "In Progress", value: "4", change: "-1", trend: "down" },
    { label: "Average Grade", value: "87%", change: "+5%", trend: "up" },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-surface border border-default rounded-xl p-4 hover-surface hover-border transition-all"
        >
          <p className="text-muted text-xs font-medium mb-1">{stat.label}</p>
          <div className="flex items-end justify-between">
            <p className="text-primary text-2xl font-bold">{stat.value}</p>
            <span className={`text-xs font-medium ${
              stat.trend === "up" ? "text-success" : "text-error"
            }`}>
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Example 8: Navigation Tabs
// ============================================
export function NavigationTabs() {
  const tabs = ["Overview", "Courses", "Analytics", "Settings"];
  const activeTab = "Courses";
  
  return (
    <div className="border-b border-default">
      <nav className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? "text-accent border-b-2 border-accent"
                : "text-secondary hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ============================================
// All Examples Component (for testing)
// ============================================
export default function ThemeUsageExamples() {
  return (
    <div className="bg-page min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl text-primary mb-2">
            Theme Usage Examples
          </h1>
          <p className="text-secondary">
            Practical examples of theme-aware components
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-xl text-primary">Quick Toggle</h2>
          <ThemeToggleButton />
        </div>
        
        <section>
          <h2 className="font-serif text-xl text-primary mb-4">Dashboard Card</h2>
          <DashboardCard />
        </section>
        
        <section>
          <h2 className="font-serif text-xl text-primary mb-4">Form Example</h2>
          <ThemeAwareForm />
        </section>
        
        <section>
          <h2 className="font-serif text-xl text-primary mb-4">Status Alerts</h2>
          <StatusAlerts />
        </section>
        
        <section>
          <h2 className="font-serif text-xl text-primary mb-4">Interactive List</h2>
          <InteractiveList />
        </section>
        
        <section>
          <h2 className="font-serif text-xl text-primary mb-4">Stats Grid</h2>
          <StatsGrid />
        </section>
        
        <section>
          <h2 className="font-serif text-xl text-primary mb-4">Navigation Tabs</h2>
          <NavigationTabs />
        </section>
      </div>
    </div>
  );
}
