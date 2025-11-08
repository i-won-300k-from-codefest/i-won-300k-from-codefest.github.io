"use client";

import { LocationDrawer, Question, Answer } from "./LocationDrawer";

// Example 1: Simple linear flow with predefined questions
export function SimpleLocationDrawerExample() {
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
    const lastAnswer = answers[answers.length - 1];

    // Based on the number of answers, return the next question
    if (answers.length === 1) {
      // After first question, ask for direction
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
    } else if (answers.length === 2) {
      // After second question, ask for distance
      return {
        id: "distance",
        title: "大約多遠？",
        options: [
          { value: "near", label: "很近（5米內）" },
          { value: "medium", label: "中等距離（5-20米）" },
          { value: "far", label: "較遠（20米以上）" },
        ],
      };
    }

    // No more questions - flow complete
    return null;
  };

  const handleComplete = (answers: Answer[]) => {
    console.log("Flow completed with answers:", answers);
    // Send to API, update state, etc.
  };

  return (
    <LocationDrawer
      initialQuestion={initialQuestion}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
    />
  );
}

// Example 2: Dynamic branching based on previous answers
export function BranchingLocationDrawerExample() {
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

  const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
    const lastAnswer = answers[answers.length - 1];
    const firstAnswer = answers[0];

    if (answers.length === 1) {
      // Different questions based on location type
      if (firstAnswer.value === "restaurant") {
        return {
          id: "restaurant-detail",
          title: "您在餐廳的哪個位置？",
          options: [
            { value: "inside", label: "餐廳內" },
            { value: "queue", label: "排隊區" },
            { value: "outside", label: "餐廳外" },
          ],
        };
      } else if (firstAnswer.value === "entrance") {
        return {
          id: "entrance-detail",
          title: "是哪個入口？",
          options: [
            { value: "main", label: "主要入口" },
            { value: "side", label: "側門" },
            { value: "emergency", label: "緊急出口" },
          ],
        };
      } else if (firstAnswer.value === "restroom") {
        return {
          id: "restroom-detail",
          title: "您在廁所的哪裡？",
          options: [
            { value: "mens", label: "男廁" },
            { value: "womens", label: "女廁" },
            { value: "accessible", label: "無障礙廁所" },
          ],
        };
      } else {
        // Shop
        return {
          id: "shop-detail",
          title: "您在商店的哪個位置？",
          options: [
            { value: "checkout", label: "結帳處" },
            { value: "browsing", label: "瀏覽區" },
            { value: "entrance", label: "商店入口" },
          ],
        };
      }
    } else if (answers.length === 2) {
      // Common final question for all paths
      return {
        id: "urgency",
        title: "緊急程度？",
        options: [
          { value: "urgent", label: "緊急" },
          { value: "normal", label: "一般" },
          { value: "low", label: "不急" },
        ],
      };
    }

    return null;
  };

  const handleComplete = (answers: Answer[]) => {
    console.log("Flow completed:", answers);
  };

  return (
    <LocationDrawer
      initialQuestion={initialQuestion}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
    />
  );
}

// Example 3: Async API calls to get dynamic questions
export function AsyncLocationDrawerExample() {
  const initialQuestion: Question = {
    id: "building",
    title: "您在哪棟建築？",
    options: [
      { value: "a", label: "A棟" },
      { value: "b", label: "B棟" },
      { value: "c", label: "C棟" },
    ],
  };

  const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
    // Simulate API call to get next question based on previous answers
    try {
      const response = await fetch("/api/location/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch next question");
      }

      const data = await response.json();
      return data.nextQuestion; // Should be Question | null
    } catch (error) {
      console.error("Error fetching next question:", error);
      // Return null to end the flow on error
      return null;
    }
  };

  const handleComplete = async (answers: Answer[]) => {
    console.log("Submitting final location data:", answers);

    try {
      await fetch("/api/location/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
    } catch (error) {
      console.error("Error submitting location:", error);
    }
  };

  return (
    <LocationDrawer
      triggerLabel="選擇位置"
      initialQuestion={initialQuestion}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
    />
  );
}

// Example 4: Conditional flow with validation
export function ValidatedLocationDrawerExample() {
  const initialQuestion: Question = {
    id: "floor",
    title: "您在幾樓？",
    description: "請選擇您目前所在的樓層",
    options: [
      { value: "1", label: "1樓" },
      { value: "2", label: "2樓" },
      { value: "3", label: "3樓" },
      { value: "4", label: "4樓" },
      { value: "5", label: "5樓" },
      { value: "b1", label: "B1樓" },
    ],
  };

  const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
    const lastAnswer = answers[answers.length - 1];

    if (answers.length === 1) {
      const floor = lastAnswer.value;

      // Different questions based on floor
      if (floor === "b1") {
        return {
          id: "b1-area",
          title: "B1有什麼標誌性位置？",
          options: [
            { value: "parking", label: "停車場" },
            { value: "storage", label: "倉庫" },
            { value: "mechanical", label: "機房" },
          ],
        };
      } else if (["1", "2"].includes(floor)) {
        return {
          id: "lower-section",
          title: "您在哪個區域？",
          options: [
            { value: "lobby", label: "大廳" },
            { value: "corridor", label: "走廊" },
            { value: "room", label: "房間" },
          ],
        };
      } else {
        return {
          id: "upper-section",
          title: "您在哪個區域？",
          options: [
            { value: "office", label: "辦公室" },
            { value: "meeting", label: "會議室" },
            { value: "corridor", label: "走廊" },
          ],
        };
      }
    } else if (answers.length === 2) {
      // Ask for nearby landmarks
      return {
        id: "landmark",
        title: "附近有什麼明顯標誌？",
        description: "選擇最接近的標誌物",
        options: [
          { value: "elevator", label: "電梯" },
          { value: "stairs", label: "樓梯" },
          { value: "exit", label: "安全出口" },
          { value: "fire-extinguisher", label: "滅火器" },
          { value: "sign", label: "指示牌" },
          { value: "none", label: "沒有明顯標誌" },
        ],
      };
    }

    return null;
  };

  const handleComplete = (answers: Answer[]) => {
    // Process the complete answer set
    const locationData = {
      floor: answers.find((a) => a.questionId === "floor")?.value,
      area: answers.find((a) =>
        ["b1-area", "lower-section", "upper-section"].includes(a.questionId)
      )?.value,
      landmark: answers.find((a) => a.questionId === "landmark")?.value,
    };

    console.log("Location determined:", locationData);
    // Send to backend, show on map, etc.
  };

  return (
    <LocationDrawer
      triggerLabel="我的位置"
      initialQuestion={initialQuestion}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
    />
  );
}
