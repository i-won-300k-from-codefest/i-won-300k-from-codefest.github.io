# LocationDrawer Quick Start Guide

Get started with the callback-based LocationDrawer in 5 minutes!

## 1. Basic Setup (Simplest Example)

```tsx
import { LocationDrawer, Question, Answer } from "@/components/LocationDrawer";

export function MyPage() {
  // Define your first question
  const initialQuestion: Question = {
    id: "location",
    title: "您最靠近什麼地方？",
    options: [
      { value: "restaurant", label: "餐廳" },
      { value: "entrance", label: "入口" },
      { value: "restroom", label: "廁所" },
      { value: "shop", label: "店鋪" },
    ],
  };

  // Define what happens after each answer
  const handleAnswer = (answers: Answer[]) => {
    // Return null to end the flow
    return null;
  };

  return (
    <LocationDrawer
      initialQuestion={initialQuestion}
      onAnswer={handleAnswer}
    />
  );
}
```

✅ That's it! You now have a working drawer with one question.

---

## 2. Add a Second Question

```tsx
const handleAnswer = (answers: Answer[]) => {
  // After first question, show second question
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

  // After second question, end flow
  return null;
};
```

✅ Now you have 2 questions!

---

## 3. Do Something When Complete

```tsx
const handleComplete = (answers: Answer[]) => {
  console.log("User answered:", answers);
  // Send to your API, update state, etc.
};

return (
  <LocationDrawer
    initialQuestion={initialQuestion}
    onAnswer={handleAnswer}
    onComplete={handleComplete} // ← Add this
  />
);
```

✅ You can now process the final answers!

---

## 4. Add Branching Logic

Different questions based on previous answers:

```tsx
const handleAnswer = (answers: Answer[]) => {
  const firstAnswer = answers[0];

  if (answers.length === 1) {
    // Show different second questions based on first answer
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

✅ Different paths for different choices!

---

## 5. Fetch Questions from API

```tsx
const handleAnswer = async (answers: Answer[]) => {
  // Call your backend
  const response = await fetch("/api/location/next-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });

  const data = await response.json();
  return data.nextQuestion; // Question | null
};
```

✅ Fully dynamic questions from your backend!

---

## Complete Working Example

```tsx
"use client";

import { LocationDrawer, Question, Answer } from "@/components/LocationDrawer";

export function LocationFlow() {
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

  const handleAnswer = (answers: Answer[]): Question | null => {
    const lastAnswer = answers[answers.length - 1];

    // Question 2: Direction
    if (answers.length === 1) {
      return {
        id: "direction",
        title: "您面向哪個方向？",
        description: `您選擇了：${lastAnswer.label}`,
        options: [
          { value: "north", label: "北" },
          { value: "south", label: "南" },
          { value: "east", label: "東" },
          { value: "west", label: "西" },
        ],
      };
    }

    // Question 3: Distance
    if (answers.length === 2) {
      return {
        id: "distance",
        title: "大約多遠？",
        options: [
          { value: "near", label: "很近（5米內）" },
          { value: "medium", label: "中等（5-20米）" },
          { value: "far", label: "較遠（20米以上）" },
        ],
      };
    }

    // Done!
    return null;
  };

  const handleComplete = (answers: Answer[]) => {
    // Extract the answers
    const location = answers.find(a => a.questionId === "location")?.value;
    const direction = answers.find(a => a.questionId === "direction")?.value;
    const distance = answers.find(a => a.questionId === "distance")?.value;

    console.log("Location determined:", { location, direction, distance });

    // Send to API
    fetch("/api/location/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, direction, distance }),
    });
  };

  return (
    <LocationDrawer
      triggerLabel="我在哪裡"
      initialQuestion={initialQuestion}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
    />
  );
}
```

---

## Key Concepts

### 1. Question Object
```tsx
{
  id: "unique-id",           // Must be unique
  title: "Question text",     // Shows in header
  description: "Optional",    // Shows below title
  options: [                  // Array of choices
    { value: "key", label: "Display text" }
  ]
}
```

### 2. Answer Object
```tsx
{
  questionId: "location",     // Which question
  value: "restaurant",        // Internal value
  label: "餐廳"               // Display text
}
```

### 3. Callback Pattern
```tsx
onAnswer: (answers: Answer[]) => Question | null
         └─ All answers so far
                              └─ Next question or null to end
```

---

## Common Patterns

### Pattern 1: Fixed Number of Questions
```tsx
const handleAnswer = (answers: Answer[]) => {
  if (answers.length === 1) return question2;
  if (answers.length === 2) return question3;
  return null; // Done after 3 questions
};
```

### Pattern 2: Conditional Questions
```tsx
const handleAnswer = (answers: Answer[]) => {
  if (answers.length === 1) {
    const choice = answers[0].value;
    if (choice === "a") return questionForA;
    if (choice === "b") return questionForB;
  }
  return null;
};
```

### Pattern 3: Loop Until Condition
```tsx
const handleAnswer = (answers: Answer[]) => {
  const lastAnswer = answers[answers.length - 1];

  if (lastAnswer.value === "more") {
    return moreDetailsQuestion;
  }

  return null; // Done when user doesn't choose "more"
};
```

---

## Tips

✅ **DO**:
- Keep question IDs unique
- Return `null` when flow is complete
- Handle the `onComplete` callback for final actions
- Make `onAnswer` return the same question for same inputs

❌ **DON'T**:
- Use random logic in `onAnswer` (breaks back button)
- Forget to handle the final state (when to return null)
- Put side effects in `onAnswer` (use `onComplete` instead)

---

## Next Steps

1. Check `LocationDrawerExample.tsx` for more advanced examples
2. Read `LocationDrawer.README.md` for full documentation
3. See `LocationDrawer.API.example.ts` for backend integration

Happy coding! 🚀
