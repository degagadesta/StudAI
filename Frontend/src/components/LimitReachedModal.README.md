# Limit Reached Modal Usage Guide

## Overview
The `LimitReachedModal` displays when users hit their subscription limits, encouraging them to upgrade with a beautiful, conversion-optimized interface.

## Quick Start

### 1. Using the useLimitModal Hook (Recommended)

```tsx
import { useLimitModal } from "../hooks/useLimitModal";

function MyComponent() {
  const { handleApiError, LimitModal } = useLimitModal();

  const handleAction = async () => {
    try {
      await someApiCall();
    } catch (error) {
      // Automatically shows modal if it's a limit error
      if (!handleApiError(error)) {
        // Handle other errors
        console.error(error);
      }
    }
  };

  return (
    <div>
      <button onClick={handleAction}>Do Something</button>
      {LimitModal}
    </div>
  );
}
```

### 2. Manual Usage

```tsx
import { useState } from "react";
import LimitReachedModal from "../components/LimitReachedModal";

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Show Limit Modal
      </button>

      <LimitReachedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        featureName="AI Chat Messages"
        currentPlan="free"
        limitUsed={100}
        limitTotal={100}
        onUpgrade={(plan) => {
          console.log("Upgrading to:", plan);
          // Navigate to checkout
        }}
      />
    </>
  );
}
```

## Backend Error Format

The backend must return a 429 status with this format:

```json
{
  "success": false,
  "error": "You've reached your CHAT_MESSAGE limit (100/100). Upgrade your plan for more access.",
  "code": "LIMIT_EXCEEDED",
  "details": {
    "feature": "CHAT_MESSAGE",
    "used": 100,
    "limit": 100,
    "plan": "FREE",
    "resetDate": "2024-02-01T00:00:00.000Z"
  }
}
```

## Error Handler Utilities

```tsx
import {
  isLimitError,
  getLimitErrorDetails,
  handleApiErrorWithToast
} from "../utils/errorHandler";

// Check if error is a limit error
if (isLimitError(error)) {
  const details = getLimitErrorDetails(error);
  // details: { feature, used, limit, plan }
}

// Handle with toast
handleApiErrorWithToast(
  error,
  (details) => {
    // Show limit modal
    showLimitModal(details);
  },
  (message, type) => {
    // Show toast notification
    toast(message, { type });
  }
);
```

## Feature Names Mapping

| Backend Feature | Display Name |
|----------------|--------------|
| PDF_UPLOAD | PDF Uploads |
| CHAT_MESSAGE | AI Chat Messages |
| FLASHCARDS | Flashcards |
| SUMMARY | AI Summaries |
| QUIZ_GENERATION | Quiz Generations |
| NOTES_GENERATION | Notes Generation |
| MAX_COURSES | Active Courses |

## Props

### LimitReachedModal

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Whether modal is visible |
| onClose | () => void | Yes | Called when user closes modal |
| featureName | string | Yes | Display name of the feature |
| currentPlan | SubscriptionTier | Yes | User's current plan (free/student/pro) |
| limitUsed | number | Yes | How many times feature was used |
| limitTotal | number | Yes | Maximum allowed uses |
| onUpgrade | (plan) => void | Yes | Called when user selects a plan |

## Best Practices

1. **Always use handleApiError** - It automatically detects and shows the modal
2. **Don't show modal for PRO users** - They have unlimited access
3. **Show usage warnings before hitting limits** - Use UsageWidget to warn users at 80%
4. **Make upgrade path clear** - Modal handles navigation to checkout
5. **Track modal views** - Analytics to optimize conversion

## Example: Complete Integration

```tsx
import { useState } from "react";
import { useLimitModal } from "../hooks/useLimitModal";
import { generateFlashcards } from "../api/aiApi";

function FlashcardsGenerator() {
  const [loading, setLoading] = useState(false);
  const { handleApiError, LimitModal } = useLimitModal();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const flashcards = await generateFlashcards(materialId);
      // Success
    } catch (error) {
      if (!handleApiError(error)) {
        // Not a limit error, show generic error
        alert("Failed to generate flashcards");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        Generate Flashcards
      </button>
      {LimitModal}
    </div>
  );
}
```
