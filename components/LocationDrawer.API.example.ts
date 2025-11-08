/**
 * Example API Route for Dynamic Question Flow
 *
 * This file shows how to create a backend API that serves dynamic questions
 * to the LocationDrawer component.
 *
 * Place this in: app/api/location/next-question/route.ts (for Next.js App Router)
 */

import { NextRequest, NextResponse } from "next/server";
import { Answer, Question } from "@/components/LocationDrawer";

// Example: Question database or configuration
const QUESTION_TREE = {
  // First question - always shown
  initial: {
    id: "location",
    title: "您最靠近什麼地方？",
    description: "請選擇您最靠近的位置",
    options: [
      { value: "restaurant", label: "餐廳" },
      { value: "entrance", label: "入口" },
      { value: "restroom", label: "廁所" },
      { value: "shop", label: "店鋪" },
    ],
  } as Question,

  // Questions for restaurant path
  restaurant: {
    id: "restaurant-detail",
    title: "您在餐廳的哪個位置？",
    options: [
      { value: "inside", label: "餐廳內用餐區" },
      { value: "queue", label: "排隊等候區" },
      { value: "counter", label: "櫃檯/點餐區" },
      { value: "outside", label: "餐廳外" },
    ],
  } as Question,

  // Questions for entrance path
  entrance: {
    id: "entrance-type",
    title: "是哪個入口？",
    options: [
      { value: "main", label: "主要入口/大門" },
      { value: "side", label: "側門" },
      { value: "emergency", label: "緊急出口" },
      { value: "service", label: "服務入口" },
    ],
  } as Question,

  // Questions for restroom path
  restroom: {
    id: "restroom-detail",
    title: "您在廁所的哪裡？",
    options: [
      { value: "mens", label: "男廁" },
      { value: "womens", label: "女廁" },
      { value: "accessible", label: "無障礙廁所" },
      { value: "family", label: "親子廁所" },
    ],
  } as Question,

  // Questions for shop path
  shop: {
    id: "shop-detail",
    title: "您在商店的哪個位置？",
    options: [
      { value: "checkout", label: "結帳處" },
      { value: "browsing", label: "商品瀏覽區" },
      { value: "entrance", label: "商店入口" },
      { value: "fitting", label: "試衣間" },
    ],
  } as Question,

  // Final question - common to all paths
  final: {
    id: "urgency",
    title: "緊急程度？",
    description: "請選擇您的需求緊急程度",
    options: [
      { value: "urgent", label: "🔴 緊急（立即需要協助）" },
      { value: "normal", label: "🟡 一般（盡快協助）" },
      { value: "low", label: "🟢 不急（有空再來）" },
    ],
  } as Question,
};

export async function POST(request: NextRequest) {
  try {
    const { answers } = (await request.json()) as { answers: Answer[] };

    // Determine next question based on answers
    const nextQuestion = getNextQuestion(answers);

    return NextResponse.json({ nextQuestion });
  } catch (error) {
    console.error("Error processing next question:", error);
    return NextResponse.json(
      { error: "Failed to get next question" },
      { status: 500 }
    );
  }
}

function getNextQuestion(answers: Answer[]): Question | null {
  const answerCount = answers.length;

  // No answers yet - this shouldn't happen as initial question is client-side
  if (answerCount === 0) {
    return QUESTION_TREE.initial;
  }

  // First question answered - branch based on location type
  if (answerCount === 1) {
    const locationType = answers[0].value;

    switch (locationType) {
      case "restaurant":
        return QUESTION_TREE.restaurant;
      case "entrance":
        return QUESTION_TREE.entrance;
      case "restroom":
        return QUESTION_TREE.restroom;
      case "shop":
        return QUESTION_TREE.shop;
      default:
        // Unknown location type - end flow
        return null;
    }
  }

  // Second question answered - show final common question
  if (answerCount === 2) {
    return QUESTION_TREE.final;
  }

  // Three questions answered - flow complete
  return null;
}

/**
 * Alternative: Database-driven questions
 */

// Example with database queries
async function getNextQuestionFromDB(answers: Answer[]): Promise<Question | null> {
  // Example using Prisma or any ORM
  const lastAnswer = answers[answers.length - 1];

  // Fetch next question from database
  const nextQuestion = await prisma.question.findFirst({
    where: {
      parentQuestionId: lastAnswer?.questionId || null,
      parentAnswerValue: lastAnswer?.value || null,
      order: answers.length + 1,
    },
    include: {
      options: true,
    },
  });

  if (!nextQuestion) {
    return null;
  }

  // Transform to Question type
  return {
    id: nextQuestion.id,
    title: nextQuestion.title,
    description: nextQuestion.description || undefined,
    options: nextQuestion.options.map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
  };
}

/**
 * Alternative: External API integration
 */

async function getNextQuestionFromExternalAPI(
  answers: Answer[]
): Promise<Question | null> {
  const response = await fetch("https://your-api.com/questions/next", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_SECRET_KEY}`,
    },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch next question from external API");
  }

  const data = await response.json();
  return data.question || null;
}

/**
 * Alternative: Rule-based complex logic
 */

function getNextQuestionWithComplexRules(answers: Answer[]): Question | null {
  // Build context from all answers
  const context = answers.reduce(
    (acc, answer) => {
      acc[answer.questionId] = answer.value;
      return acc;
    },
    {} as Record<string, string>
  );

  // Complex branching logic
  if (answers.length === 1) {
    const location = context.location;

    // Special case: if restaurant and it's lunch time
    if (location === "restaurant" && isLunchTime()) {
      return {
        id: "restaurant-crowded",
        title: "餐廳是否很擁擠？",
        description: "午餐時間，幫助我們更好地定位您",
        options: [
          { value: "very", label: "非常擁擠" },
          { value: "moderate", label: "還可以" },
          { value: "empty", label: "人很少" },
        ],
      };
    }

    // Default branching
    return QUESTION_TREE[location as keyof typeof QUESTION_TREE] || null;
  }

  if (answers.length === 2) {
    // Check if we need additional clarification
    const location = context.location;
    const detail = context[`${location}-detail`] || context[`${location}-crowded`];

    // If user is in a specific high-traffic area, ask for more details
    if (
      (location === "restaurant" && detail === "queue") ||
      (location === "shop" && detail === "checkout")
    ) {
      return {
        id: "queue-position",
        title: "您在隊伍的哪個位置？",
        options: [
          { value: "front", label: "前面（1-3人）" },
          { value: "middle", label: "中間" },
          { value: "back", label: "後面" },
        ],
      };
    }

    // Default: show urgency question
    return QUESTION_TREE.final;
  }

  // Flow complete
  return null;
}

function isLunchTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 11 && hour <= 14;
}

/**
 * Example: Submit final location endpoint
 *
 * Place in: app/api/location/submit/route.ts
 */

export async function submitLocationExample(request: NextRequest) {
  try {
    const { answers } = (await request.json()) as { answers: Answer[] };

    // Process and save location data
    const locationData = processAnswers(answers);

    // Save to database
    // await prisma.userLocation.create({ data: locationData });

    // Or send to external service
    // await notifyLocationService(locationData);

    return NextResponse.json({
      success: true,
      location: locationData,
    });
  } catch (error) {
    console.error("Error submitting location:", error);
    return NextResponse.json(
      { error: "Failed to submit location" },
      { status: 500 }
    );
  }
}

function processAnswers(answers: Answer[]) {
  // Extract meaningful data from answers
  const location = answers.find((a) => a.questionId === "location")?.value;
  const detail = answers.find((a) => a.questionId.includes("detail"))?.value;
  const urgency = answers.find((a) => a.questionId === "urgency")?.value;

  return {
    locationType: location,
    locationDetail: detail,
    urgencyLevel: urgency,
    timestamp: new Date().toISOString(),
    rawAnswers: answers,
  };
}

/**
 * USAGE IN COMPONENT:
 *
 * const handleAnswer = async (answers: Answer[]): Promise<Question | null> => {
 *   const response = await fetch("/api/location/next-question", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ answers }),
 *   });
 *
 *   const data = await response.json();
 *   return data.nextQuestion;
 * };
 *
 * const handleComplete = async (answers: Answer[]) => {
 *   await fetch("/api/location/submit", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ answers }),
 *   });
 * };
 */

// TypeScript types for database schema (example)
interface QuestionDB {
  id: string;
  title: string;
  description: string | null;
  parentQuestionId: string | null;
  parentAnswerValue: string | null;
  order: number;
  options: QuestionOptionDB[];
}

interface QuestionOptionDB {
  id: string;
  questionId: string;
  value: string;
  label: string;
  order: number;
}

// Mock prisma for type reference
const prisma = {
  question: {
    findFirst: async (args: any): Promise<QuestionDB | null> => {
      return null;
    },
  },
  userLocation: {
    create: async (args: any): Promise<any> => {
      return null;
    },
  },
};
