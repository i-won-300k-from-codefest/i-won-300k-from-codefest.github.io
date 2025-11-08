# LocationDrawer Demo - Quick Test

This is a simple demo you can use to test the LocationDrawer component immediately.

## Demo Component

Create this file: `app/demo/page.tsx`

```tsx
"use client";

import { LocationDrawer, Question, Answer } from "@/components/LocationDrawer";

export default function DemoPage() {
  // Simple demo with 3 questions
  const initialQuestion: Question = {
    id: "floor",
    title: "您在哪一樓？",
    description: "請選擇您目前所在的樓層",
    options: [
      { value: "1", label: "1樓" },
      { value: "2", label: "2樓" },
      { value: "3", label: "3樓" },
      { value: "b1", label: "B1" },
    ],
  };

  const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
    console.log("Current answers:", answers);

    // Simulate some processing time to show the loading indicator
    // (Remove this in production or adjust as needed)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lastAnswer = answers[answers.length - 1];

    // Question 2: Location Type
    if (answers.length === 1) {
      return {
        id: "location-type",
        title: "您靠近什麼地方？",
        description: `您選擇了：${lastAnswer.label}`,
        options: [
          { value: "restaurant", label: "餐廳" },
          { value: "entrance", label: "入口" },
          { value: "restroom", label: "廁所" },
          { value: "shop", label: "商店" },
        ],
      };
    }

    // Question 3: Direction
    if (answers.length === 2) {
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

    // Question 4: Distance
    if (answers.length === 3) {
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
    console.log("✅ Flow completed!");
    console.log("Final answers:", answers);

    // Extract individual answers
    const floor = answers.find((a) => a.questionId === "floor")?.label;
    const locationType = answers.find((a) => a.questionId === "location-type")?.label;
    const direction = answers.find((a) => a.questionId === "direction")?.label;
    const distance = answers.find((a) => a.questionId === "distance")?.label;

    alert(`位置確定！\n\n樓層: ${floor}\n地點: ${locationType}\n方向: ${direction}\n距離: ${distance}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">LocationDrawer Demo</h1>
          <p className="text-muted-foreground mb-8">
            Test the dynamic question flow
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <LocationDrawer
            triggerLabel="開始定位"
            initialQuestion={initialQuestion}
            onAnswer={handleAnswer}
            onComplete={handleComplete}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-sm">
          <h2 className="font-semibold mb-3">Features to test:</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>✅ Click button to open drawer</li>
            <li>✅ Select options (watch console logs)</li>
            <li>✅ See loading indicator (min 500ms)</li>
            <li>✅ Use back button to go back</li>
            <li>✅ Complete flow to see alert</li>
            <li>✅ Close and reopen to reset</li>
          </ul>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Open browser console to see logs 📝
        </div>
      </div>
    </div>
  );
}
```

## Usage

1. Create the file above at `app/demo/page.tsx`
2. Start your dev server: `npm run dev` or `bun dev`
3. Visit: `http://localhost:3000/demo`
4. Click "開始定位" and test the flow!

## What to Test

### 1. Loading Indicator
- Click any option
- You should see a popout with spinner for at least 500ms
- Even if processing is faster, it stays visible

### 2. Back Button
- Answer a few questions
- Click "← 上一步"
- Should go back to previous question
- Loading indicator appears during back navigation too

### 3. Smooth Animations
- Questions slide from right when going forward
- Questions slide from left when going back
- No animation on first open

### 4. Console Logs
- Open browser DevTools (F12)
- Watch console for:
  - "Current answers:" after each selection
  - "✅ Flow completed!" when done
  - "Final answers:" at the end

### 5. Complete Flow
- Answer all 4 questions
- Alert popup shows your selections
- Can close and start over

## Expected Behavior

```
1. User clicks "開始定位"
   → Drawer opens with floor selection

2. User selects "3樓"
   → Loading popout appears (500ms min)
   → Slides to location type question

3. User selects "餐廳"
   → Loading popout appears
   → Slides to direction question

4. User selects "北"
   → Loading popout appears
   → Slides to distance question

5. User selects "很近（5米內）"
   → Loading popout appears
   → onComplete fires
   → Alert shows all selections
   → Drawer can be closed

Back button:
   → Click "← 上一步" anytime
   → Loading appears
   → Slides back to previous question
   → Can go all the way back to floor
```

## Customization

### Change Loading Time

In `handleAnswer`, adjust the delay:

```tsx
// Longer delay (1 second)
await new Promise(resolve => setTimeout(resolve, 1000));

// Shorter delay (200ms)
await new Promise(resolve => setTimeout(resolve, 200));

// No delay (just minimum 500ms from component)
// Remove the await line completely
```

### Add More Questions

```tsx
if (answers.length === 4) {
  return {
    id: "confidence",
    title: "您確定嗎？",
    options: [
      { value: "yes", label: "確定" },
      { value: "no", label: "不確定" },
    ],
  };
}
```

### Change Grid Layout

The component automatically:
- Uses 2 columns if ≤ 4 options
- Uses 1 column if > 4 options

Add more options to see it change:

```tsx
options: [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
  { value: "5", label: "Option 5" }, // Now shows as 1 column
]
```

## Next Steps

After testing the demo:

1. ✅ Check `LocationDrawer.MAP-GUIDE.md` for map integration
2. ✅ See `LocationDrawer.MapExample.tsx` for full map example
3. ✅ Read `LocationDrawer.README.md` for complete API docs
4. ✅ Review `LocationDrawer.QUICKSTART.md` for quick start

Enjoy! 🚀
