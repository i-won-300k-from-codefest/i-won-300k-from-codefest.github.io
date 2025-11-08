# LocationDrawer Cheat Sheet

## 🚀 Quick Setup (Copy & Paste)

```tsx
import { LocationDrawer, Question, Answer } from "@/components/LocationDrawer";

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
  // Add delay to show loading (optional)
  await new Promise(resolve => setTimeout(resolve, 300));

  if (answers.length === 1) {
    return { id: "q2", title: "Next?", options: [...] };
  }
  return null; // Done
};

<LocationDrawer
  triggerLabel="我在哪裡"
  initialQuestion={initialQuestion}
  onAnswer={handleAnswer}
  onComplete={(answers) => console.log(answers)}
/>
```

---

## 📋 Type Definitions

```typescript
// Question
{
  id: string;              // Unique ID
  title: string;           // Question text
  description?: string;    // Optional subtitle
  options: QuestionOption[];
}

// Option
{
  value: string;  // Internal value
  label: string;  // Display text
}

// Answer
{
  questionId: string;
  value: string;
  label: string;
}

// Callback
(answers: Answer[]) => Promise<Question | null> | Question | null
```

---

## 🎯 Common Patterns

### Linear Flow
```tsx
if (answers.length === 1) return question2;
if (answers.length === 2) return question3;
return null;
```

### Branching
```tsx
const first = answers[0].value;
if (first === "a") return questionA;
if (first === "b") return questionB;
return null;
```

### Map Data Query
```tsx
const floor = answers.find(a => a.questionId === "floor")?.value;
const locations = mapData.locations.filter(loc => loc.floor === floor);
return {
  id: "location",
  options: locations.map(l => ({ value: l.id, label: l.name }))
};
```

### Get Specific Answer
```tsx
const floor = answers.find(a => a.questionId === "floor")?.value;
const type = answers.find(a => a.questionId === "type")?.label;
```

---

## 🎨 Loading Indicator

**Automatic!** Just add delay in `onAnswer`:

```tsx
const handleAnswer = async (answers) => {
  await new Promise(r => setTimeout(r, 300)); // Show loading
  return nextQuestion;
};
```

- Loading shows for **minimum 500ms**
- Beautiful spinner popout
- Prevents flickering

---

## 🗺️ Map Integration

### 1. Load Data
```tsx
const [mapData, setMapData] = useState(null);

useEffect(() => {
  fetch("/data/map.json").then(r => r.json()).then(setMapData);
}, []);
```

### 2. Query in onAnswer
```tsx
const handleAnswer = async (answers) => {
  const floor = answers[0].value;
  const locs = mapData.locations.filter(l => l.floor === floor);

  return {
    id: "location",
    title: "選擇地點",
    options: locs.map(l => ({ value: l.id, label: l.name }))
  };
};
```

### 3. Use in onComplete
```tsx
const handleComplete = (answers) => {
  const locId = answers.find(a => a.questionId === "location")?.value;
  const location = mapData.locations.find(l => l.id === locId);

  showOnMap(location.coordinates);
};
```

---

## ⚡ Props Reference

| Prop | Type | Default | Required |
|------|------|---------|----------|
| `initialQuestion` | Question | - | ✅ |
| `onAnswer` | Function | - | ✅ |
| `onComplete` | Function | - | ❌ |
| `triggerLabel` | string | "我在哪裡" | ❌ |

---

## ✅ Best Practices

```tsx
// ✅ Good - Deterministic
const handleAnswer = (answers) => {
  if (answers.length === 1) return q2;
  return null;
};

// ❌ Bad - Random
const handleAnswer = (answers) => {
  if (Math.random() > 0.5) return q2;
  return q3;
};
```

```tsx
// ✅ Good - Unique IDs
{ id: "floor-1", ... }
{ id: "location-2", ... }

// ❌ Bad - Duplicate IDs
{ id: "question", ... }
{ id: "question", ... }
```

```tsx
// ✅ Good - Use onComplete for side effects
const handleComplete = (answers) => {
  saveToLocalStorage(answers);
  updateMap(answers);
};

// ❌ Bad - Side effects in onAnswer
const handleAnswer = (answers) => {
  saveToLocalStorage(answers); // Don't do this!
  return nextQ;
};
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Loading too fast | Add `await new Promise(r => setTimeout(r, 300))` |
| Questions not sliding | Ensure unique `id` on each question |
| Back button broken | Make `onAnswer` deterministic |
| Layout jumps | Normal with animations, see README for height solutions |

---

## 📚 Files Reference

- **QUICKSTART.md** - 5-min getting started
- **README.md** - Complete API docs
- **MAP-GUIDE.md** - Map integration guide
- **MapExample.tsx** - Full map example
- **DEMO.md** - Quick test setup
- **SUMMARY.md** - Overview & concepts

---

## 🎓 Example: 3-Question Flow

```tsx
const handleAnswer = async (answers: Answer[]) => {
  await new Promise(r => setTimeout(r, 300));

  // Q1 → Q2
  if (answers.length === 1) {
    return {
      id: "type",
      title: "類型？",
      options: [
        { value: "a", label: "選項A" },
        { value: "b", label: "選項B" },
      ],
    };
  }

  // Q2 → Q3
  if (answers.length === 2) {
    return {
      id: "confirm",
      title: "確定？",
      options: [
        { value: "yes", label: "是" },
        { value: "no", label: "否" },
      ],
    };
  }

  // Q3 → Done
  return null;
};

const handleComplete = (answers: Answer[]) => {
  console.log("Done!", answers);
  // Do something with answers
};
```

---

## 💡 Quick Tips

1. **Loading shows minimum 500ms** - Add delays in `onAnswer` to make it visible
2. **Grid auto-adjusts** - ≤4 options = 2 cols, >4 = 1 col
3. **Back button free** - Automatically handled
4. **No backend needed** - Pure frontend with map data
5. **TypeScript ready** - Full type safety

---

## 🚀 Get Started

```bash
# 1. Check the demo
# Create app/demo/page.tsx (see DEMO.md)
npm run dev

# 2. Test it
# Visit http://localhost:3000/demo

# 3. Build your flow
# See QUICKSTART.md or MAP-GUIDE.md
```

**Happy coding! 🎉**
