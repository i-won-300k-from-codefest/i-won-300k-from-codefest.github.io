# LocationDrawer - Dynamic Question Flow Component

A flexible, callback-driven drawer component for creating multi-step question flows with smooth animations.

## Features

- ✅ **Callback-based**: Full control over question logic
- ✅ **Async support**: Fetch questions from APIs
- ✅ **Dynamic branching**: Different paths based on answers
- ✅ **Smooth animations**: Slide transitions between questions
- ✅ **Loading states**: Built-in loading indicator
- ✅ **Back navigation**: Users can go back to previous questions
- ✅ **TypeScript**: Full type safety

## Basic Usage

```tsx
import { LocationDrawer, Question, Answer } from "./LocationDrawer";

export function MyLocationDrawer() {
  const initialQuestion: Question = {
    id: "location",
    title: "您最靠近什麼地方？",
    description: "請選擇您最靠近的位置",
    options: [
      { value: "restaurant", label: "餐廳" },
      { value: "entrance", label: "入口" },
      { value: "restroom", label: "廁所" },
      { value: "shop", label: "店鋪" },
    ],
  };

  const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
    // Return the next question based on current answers
    // Return null when flow is complete
    if (answers.length === 1) {
      return {
        id: "direction",
        title: "您面向哪個方向？",
        options: [
          { value: "north", label: "北" },
          { value: "south", label: "南" },
          { value: "east", label: "東" },
          { value: "west", label: "西" },
        ],
      };
    }
    return null; // Flow complete
  };

  const handleComplete = (answers: Answer[]) => {
    console.log("User selections:", answers);
    // Process final answers
  };

  return (
    <LocationDrawer
      initialQuestion={initialQuestion}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
    />
  );
}
```

## Types

### Question

```typescript
type Question = {
  id: string;              // Unique identifier for the question
  title: string;           // Question title shown in header
  description?: string;    // Optional description/subtitle
  options: QuestionOption[]; // Array of choices
};
```

### QuestionOption

```typescript
type QuestionOption = {
  value: string;  // Internal value (sent to callbacks)
  label: string;  // Display text shown to user
};
```

### Answer

```typescript
type Answer = {
  questionId: string;  // ID of the question this answers
  value: string;       // The selected option's value
  label: string;       // The selected option's label
};
```

### OnAnswerCallback

```typescript
type OnAnswerCallback = (
  answers: Answer[]
) => Promise<Question | null> | Question | null;
```

- **Parameters**: Array of all answers so far
- **Returns**: Next question, or `null` if flow is complete
- **Can be async**: Fetch questions from API

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `initialQuestion` | `Question` | ✅ | - | First question to display |
| `onAnswer` | `OnAnswerCallback` | ✅ | - | Called after each answer to get next question |
| `onComplete` | `(answers: Answer[]) => void` | ❌ | - | Called when flow completes (returns null) |
| `triggerLabel` | `string` | ❌ | "我在哪裡" | Label for the trigger button |

## Examples

### Example 1: Linear Flow

Simple sequential questions:

```tsx
const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
  if (answers.length === 1) {
    return { id: "q2", title: "Question 2", options: [...] };
  }
  if (answers.length === 2) {
    return { id: "q3", title: "Question 3", options: [...] };
  }
  return null; // Done
};
```

### Example 2: Branching Logic

Different questions based on previous answers:

```tsx
const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
  const firstAnswer = answers[0];

  if (answers.length === 1) {
    // Branch based on first answer
    if (firstAnswer.value === "restaurant") {
      return {
        id: "restaurant-detail",
        title: "您在餐廳的哪個位置？",
        options: [
          { value: "inside", label: "餐廳內" },
          { value: "queue", label: "排隊區" },
        ],
      };
    } else if (firstAnswer.value === "entrance") {
      return {
        id: "entrance-type",
        title: "是哪個入口？",
        options: [
          { value: "main", label: "主要入口" },
          { value: "side", label: "側門" },
        ],
      };
    }
  }

  return null;
};
```

### Example 3: API Integration

Fetch questions from your backend:

```tsx
const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
  try {
    const response = await fetch("/api/location/next-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    const data = await response.json();
    return data.nextQuestion; // Question | null
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
```

### Example 4: Complex State Management

Use answers array to make decisions:

```tsx
const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
  // Get specific answers
  const floorAnswer = answers.find(a => a.questionId === "floor");
  const areaAnswer = answers.find(a => a.questionId === "area");

  if (!areaAnswer) {
    // First question not answered yet
    return { id: "floor", title: "Which floor?", options: [...] };
  }

  if (!areaAnswer) {
    // Second question
    return { id: "area", title: "Which area?", options: [...] };
  }

  // Conditional third question
  if (floorAnswer.value === "1") {
    return { id: "ground-floor-detail", title: "...", options: [...] };
  }

  return null;
};
```

## How It Works

1. **User clicks trigger** → Drawer opens with `initialQuestion`
2. **User selects option** → `onAnswer` called with all answers so far
3. **Callback returns next question** → Slides to new question
4. **Callback returns null** → `onComplete` called, flow ends
5. **User clicks back** → Goes to previous question state
6. **User closes drawer** → State resets to initial

## Answer Flow

```
answers = []
  ↓
User selects option from Question 1
  ↓
answers = [{ questionId: "q1", value: "option1", label: "Option 1" }]
  ↓
onAnswer(answers) → returns Question 2
  ↓
User selects option from Question 2
  ↓
answers = [...previous, { questionId: "q2", value: "option2", label: "..." }]
  ↓
onAnswer(answers) → returns null
  ↓
onComplete(answers) called
```

## Back Button Behavior

When user clicks "上一步" (Back):

1. Removes the last answer from the answers array
2. Calls `onAnswer` with the new answers array
3. Expects you to return the previous question
4. If answers array is empty, shows `initialQuestion`

**Important**: Your `onAnswer` function should be **idempotent** - calling it with the same answers array should always return the same question.

## Loading State

The component shows a loading spinner when:
- Waiting for `onAnswer` callback to resolve
- Useful for API calls or complex computations

Buttons are disabled during loading.

## Grid Layout

- **4 or fewer options**: 2-column grid with large buttons (h-24)
- **More than 4 options**: Single column with medium buttons (h-16)

## Animations

- **Slide transitions**: Questions slide left/right
- **Spring animation**: Natural, smooth motion
- **Direction-aware**: Respects forward/backward navigation
- **No initial animation**: First question appears instantly

## Best Practices

### 1. Keep Question IDs Unique

```tsx
// ✅ Good
{ id: "floor-1", ... }
{ id: "area-restaurant", ... }

// ❌ Bad - duplicate IDs
{ id: "question", ... }
{ id: "question", ... }
```

### 2. Make onAnswer Idempotent

```tsx
// ✅ Good - same input, same output
const handleAnswer = (answers: Answer[]) => {
  if (answers.length === 1) {
    return questionTwo;
  }
  return null;
};

// ❌ Bad - non-deterministic
const handleAnswer = (answers: Answer[]) => {
  if (Math.random() > 0.5) {
    return questionTwo;
  }
  return questionThree;
};
```

### 3. Handle Errors Gracefully

```tsx
const handleAnswer = async (answers: Answer[]) => {
  try {
    const next = await fetchNextQuestion(answers);
    return next;
  } catch (error) {
    console.error("Failed to fetch question:", error);
    // Show error question or end flow
    return null;
  }
};
```

### 4. Type Your Options

```tsx
// ✅ Good - typed values
type LocationType = "restaurant" | "entrance" | "restroom" | "shop";

const options: QuestionOption[] = [
  { value: "restaurant" as LocationType, label: "餐廳" },
  // ...
];
```

### 5. Use onComplete for Final Actions

```tsx
const handleComplete = async (answers: Answer[]) => {
  // Submit to API
  await submitLocation(answers);

  // Update app state
  updateUserLocation(answers);

  // Show confirmation
  toast.success("位置已保存！");
};
```

## API Integration Example

### Backend API

```typescript
// POST /api/location/next-question
interface NextQuestionRequest {
  answers: Answer[];
}

interface NextQuestionResponse {
  nextQuestion: Question | null;
}
```

### Frontend

```tsx
const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
  const res = await fetch("/api/location/next-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });

  const { nextQuestion } = await res.json();
  return nextQuestion;
};
```

## Troubleshooting

### Questions don't slide smoothly
- Ensure each question has a unique `id`
- Check that `key={currentQuestion.id}` is set correctly

### Back button doesn't work
- Make sure `onAnswer` is idempotent
- Verify it returns the correct question for the previous state

### Loading spinner stuck
- Check for unhandled promise rejections
- Add error handling to async `onAnswer`

### Drawer height jumps
- This is expected with absolute positioning for animations
- See previous thread for height animation solutions

## Migration from Old Version

**Old (hardcoded):**
```tsx
const [step, setStep] = useState(0);
// Manual step management
```

**New (callback-based):**
```tsx
const handleAnswer = (answers) => {
  // Return next question dynamically
};
```

See `LocationDrawerExample.tsx` for full migration examples.
