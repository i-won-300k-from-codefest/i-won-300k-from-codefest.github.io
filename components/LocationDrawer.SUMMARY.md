# LocationDrawer - Summary & Implementation Guide

## Overview

The **LocationDrawer** component is a flexible, callback-driven drawer for creating dynamic multi-step question flows. It's designed for **frontend-only applications** with map data and features a beautiful loading indicator that shows for a minimum of 500ms.

## Key Features

✅ **Callback-Based Architecture** - Full control over question logic
✅ **Frontend-Only** - No backend required, works with map data
✅ **Async Support** - Handles async operations seamlessly
✅ **Loading Popout** - Beautiful spinner with guaranteed 500ms minimum display
✅ **Dynamic Branching** - Different paths based on user answers
✅ **Smooth Animations** - Slide transitions between questions
✅ **Back Navigation** - Users can navigate backward through questions
✅ **TypeScript** - Fully typed for safety
✅ **Responsive** - Works on all screen sizes

## What Changed

### Before (Old Version)
- Hardcoded questions with manual step management
- Fixed flow with no flexibility
- No loading states
- Difficult to extend

### After (New Version)
- Callback-driven with infinite flexibility
- Dynamic questions based on previous answers
- Loading popout with minimum 500ms display
- Easy to integrate with map data
- Simple to extend and maintain

## Core Concept

```typescript
// You provide a callback that returns the next question
const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
  // 1. Receive all answers so far
  // 2. Process/query map data
  // 3. Return next question or null when done

  if (answers.length === 1) {
    return nextQuestion;  // Show next question
  }

  return null;  // Flow complete
};
```

## Quick Start (30 seconds)

```tsx
import { LocationDrawer, Question, Answer } from "@/components/LocationDrawer";

export function MyComponent() {
  const initialQuestion: Question = {
    id: "floor",
    title: "您在哪一樓？",
    options: [
      { value: "1", label: "1樓" },
      { value: "2", label: "2樓" },
      { value: "3", label: "3樓" },
    ],
  };

  const handleAnswer = async (answers: Answer[]) => {
    // Return next question or null
    if (answers.length === 1) {
      return {
        id: "location",
        title: "您在哪裡？",
        options: [...]
      };
    }
    return null;
  };

  return (
    <LocationDrawer
      initialQuestion={initialQuestion}
      onAnswer={handleAnswer}
      onComplete={(answers) => console.log("Done!", answers)}
    />
  );
}
```

## Loading Indicator

### How It Works

1. User clicks an option
2. Loading popout appears immediately
3. Your `onAnswer` callback executes
4. Even if callback finishes in 50ms, loading shows for 500ms minimum
5. After 500ms, loading disappears and next question slides in

### Why 500ms Minimum?

- Prevents flickering for fast operations
- Gives user visual feedback that something happened
- Creates a smooth, polished experience
- Matches modern UI/UX standards

### Implementation

The component automatically handles this! Just add a small delay in your callback:

```tsx
const handleAnswer = async (answers) => {
  // Optional: Add delay to make loading visible
  await new Promise(resolve => setTimeout(resolve, 300));

  // Your logic here...
  return nextQuestion;
};
```

## Map Data Integration

### Structure Your Data

```json
{
  "floors": [1, 2, 3, 4, 5],
  "locations": [
    {
      "id": "restaurant-1",
      "name": "美食街",
      "type": "restaurant",
      "floor": 3,
      "coordinates": { "x": 100, "y": 200 }
    }
  ]
}
```

### Use in Component

```tsx
const [mapData, setMapData] = useState(null);

useEffect(() => {
  fetch("/data/map.json")
    .then(res => res.json())
    .then(setMapData);
}, []);

const handleAnswer = async (answers) => {
  const floor = answers.find(a => a.questionId === "floor")?.value;

  // Query your map data
  const locations = mapData.locations.filter(
    loc => loc.floor === parseInt(floor)
  );

  return {
    id: "location",
    title: "您在哪裡？",
    options: locations.map(loc => ({
      value: loc.id,
      label: loc.name
    }))
  };
};
```

## File Guide

| File | Purpose |
|------|---------|
| `LocationDrawer.tsx` | Main component (refactored) |
| `LocationDrawer.QUICKSTART.md` | 5-minute getting started guide |
| `LocationDrawer.README.md` | Complete API documentation |
| `LocationDrawer.MapExample.tsx` | Full example with map data |
| `LocationDrawer.MAP-GUIDE.md` | Map integration tutorial |
| `LocationDrawer.API.example.ts` | Backend API examples (if needed) |
| `LocationDrawerExample.tsx` | 4 different usage examples |
| `LocationDrawer.DEMO.md` | Quick test demo setup |

## Common Use Cases

### 1. Simple Linear Flow
```tsx
if (answers.length === 1) return question2;
if (answers.length === 2) return question3;
return null;
```

### 2. Branching Logic
```tsx
if (answers[0].value === "restaurant") {
  return restaurantQuestion;
} else {
  return shopQuestion;
}
```

### 3. Map-Based Questions
```tsx
const floor = answers.find(a => a.questionId === "floor")?.value;
const locationsOnFloor = mapData.locations.filter(
  loc => loc.floor === parseInt(floor)
);
return {
  id: "location",
  title: "選擇地點",
  options: locationsOnFloor.map(...)
};
```

## API Reference

### Props

```typescript
interface LocationDrawerProps {
  triggerLabel?: string;           // Button text (default: "我在哪裡")
  initialQuestion: Question;        // First question to show
  onAnswer: OnAnswerCallback;       // Called after each answer
  onComplete?: (Answer[]) => void;  // Called when flow ends
}
```

### Types

```typescript
type Question = {
  id: string;              // Unique ID
  title: string;           // Question text
  description?: string;    // Optional subtitle
  options: QuestionOption[];
};

type QuestionOption = {
  value: string;  // Internal value
  label: string;  // Display text
};

type Answer = {
  questionId: string;
  value: string;
  label: string;
};

type OnAnswerCallback = (
  answers: Answer[]
) => Promise<Question | null> | Question | null;
```

## Best Practices

### ✅ DO

- Keep question IDs unique
- Make `onAnswer` deterministic (same input = same output)
- Return `null` when flow is complete
- Use `onComplete` for final actions
- Add small delays to show loading indicator
- Test the back button functionality

### ❌ DON'T

- Use random logic in `onAnswer` (breaks back button)
- Forget to handle the completion state
- Put side effects in `onAnswer` (use `onComplete`)
- Hardcode questions (defeats the purpose)
- Skip error handling for async operations

## Example Workflows

### Workflow 1: Find User on Map
```
Floor → Location Type → Specific Location → Section → Landmark → DONE
```

### Workflow 2: Report Issue
```
Floor → Issue Type → Severity → Description → DONE
```

### Workflow 3: Navigate to Destination
```
Current Floor → Destination Type → Specific Destination → DONE
```

## Integration with Your App

### After Flow Completes

```tsx
const handleComplete = (answers: Answer[]) => {
  // 1. Parse answers
  const locationId = answers.find(
    a => a.questionId === "location"
  )?.value;

  // 2. Get coordinates from map
  const location = mapData.locations.find(
    loc => loc.id === locationId
  );

  // 3. Update map view
  showUserOnMap(location.coordinates);

  // 4. Update app state
  setUserLocation(location);

  // 5. Show confirmation
  toast.success("位置已確定！");
};
```

## Performance

- ⚡ All processing happens in browser
- ⚡ No backend API calls needed
- ⚡ Map data loads once and cached
- ⚡ Smooth animations with Framer Motion
- ⚡ Optimized re-renders with React callbacks

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Next Steps

1. **Quick Test**: Create demo page from `LocationDrawer.DEMO.md`
2. **Learn API**: Read `LocationDrawer.QUICKSTART.md`
3. **Map Integration**: Follow `LocationDrawer.MAP-GUIDE.md`
4. **See Examples**: Check `LocationDrawer.MapExample.tsx`
5. **Full Docs**: Read `LocationDrawer.README.md`

## Questions?

Check the documentation files:
- Basic usage: `QUICKSTART.md`
- Map integration: `MAP-GUIDE.md`
- Complete API: `README.md`
- Examples: `LocationDrawerExample.tsx` and `MapExample.tsx`

## Summary

You now have a **powerful, flexible, frontend-only location drawer** with:
- ✅ Dynamic question flow
- ✅ Beautiful loading states (500ms minimum)
- ✅ Map data integration
- ✅ Smooth animations
- ✅ Full TypeScript support
- ✅ No backend required

**Ready to use in your Taipei Pass app!** 🚀
