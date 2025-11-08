"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerDescription,
  DrawerClose,
  DrawerTitle,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

// Types for the dynamic question flow
export type Answer = {
  questionId: string;
  value: string;
  label: string;
};

export type QuestionOption = {
  value: string;
  label: string;
};

export type Question = {
  id: string;
  title: string;
  description?: string;
  options: QuestionOption[];
};

export type OnAnswerCallback = (
  answers: Answer[],
) => Promise<Question | null> | Question | null;

interface LocationDrawerProps {
  triggerLabel?: string;
  initialQuestion: Question;
  onAnswer: OnAnswerCallback;
  onComplete?: (answers: Answer[]) => void;
}

export function LocationDrawer({
  triggerLabel = "我在哪裡",
  initialQuestion,
  onAnswer,
  onComplete,
}: LocationDrawerProps) {
  const [open, setOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] =
    useState<Question>(initialQuestion);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [isInitial, setIsInitial] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingPopout, setShowLoadingPopout] = useState(false);

  // Ensure loading popout shows for at least 500ms
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      setShowLoadingPopout(true);
    } else if (showLoadingPopout) {
      // Keep showing for at least 500ms after loading completes
      timer = setTimeout(() => {
        setShowLoadingPopout(false);
      }, 500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, showLoadingPopout]);

  const handleOptionSelect = useCallback(
    async (option: QuestionOption) => {
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        value: option.value,
        label: option.label,
      };

      const newAnswers = [...answers, newAnswer];
      setAnswers(newAnswers);
      setDirection(1);
      setIsInitial(false);

      const startTime = Date.now();
      setIsLoading(true);

      try {
        // Call the callback to get the next question
        const nextQuestion = await onAnswer(newAnswers);

        // Ensure minimum 500ms loading time
        const elapsed = Date.now() - startTime;
        if (elapsed < 500) {
          await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
        }

        if (nextQuestion) {
          setCurrentQuestion(nextQuestion);
        } else {
          // No more questions - flow complete
          onComplete?.(newAnswers);
          // Close the drawer and reset will happen in onOpenChange
          setOpen(false);
        }
      } catch (error) {
        console.error("Error getting next question:", error);
        // Handle error appropriately
      } finally {
        setIsLoading(false);
      }
    },
    [currentQuestion, answers, onAnswer, onComplete],
  );

  const handleBack = useCallback(async () => {
    if (answers.length === 0) return;

    const newAnswers = answers.slice(0, -1);
    setAnswers(newAnswers);
    setDirection(-1);
    setIsInitial(false);

    const startTime = Date.now();
    setIsLoading(true);

    try {
      if (newAnswers.length === 0) {
        // Back to initial question
        setCurrentQuestion(initialQuestion);
      } else {
        // Get the question for the previous state
        const previousQuestion = await onAnswer(newAnswers);
        if (previousQuestion) {
          setCurrentQuestion(previousQuestion);
        }
      }

      // Ensure minimum 500ms loading time
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
      }
    } catch (error) {
      console.error("Error going back:", error);
    } finally {
      setIsLoading(false);
    }
  }, [answers, initialQuestion, onAnswer]);

  const handleReset = useCallback(() => {
    setCurrentQuestion(initialQuestion);
    setAnswers([]);
    setDirection(1);
    setIsInitial(true);
    setIsLoading(false);
    setShowLoadingPopout(false);
  }, [initialQuestion]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        // Reset state when drawer opens (to start fresh)
        if (isOpen) {
          handleReset();
        }
      }}
    >
      <DrawerTrigger asChild>
        <Button className="w-full">{triggerLabel}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{currentQuestion.title}</DrawerTitle>
          <DrawerDescription>
            {currentQuestion.description ||
              (answers.length > 0
                ? `已選擇：${answers[answers.length - 1].label}`
                : "請選擇一個選項")}
          </DrawerDescription>
        </DrawerHeader>

        <div className="relative overflow-hidden p-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={slideVariants}
              initial={isInitial ? "center" : "enter"}
              animate="center"
              exit="exit"
              transition={transition}
            >
              <div className="space-y-4">
                <div
                  className={`grid gap-3 ${
                    currentQuestion.options.length <= 4
                      ? "grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {currentQuestion.options.map((option) => (
                    <Button
                      key={option.value}
                      variant="outline"
                      className={`w-full ${
                        currentQuestion.options.length <= 4
                          ? "h-24 text-lg"
                          : "h-16"
                      }`}
                      onClick={() => handleOptionSelect(option)}
                      disabled={isLoading}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <Separator />

        <DrawerFooter>
          <div className="flex w-full">
            <AnimatePresence mode="wait">
              {answers.length > 0 && (
                <motion.div
                  initial={{ width: 0, opacity: 0, marginRight: 0 }}
                  animate={{ width: "50%", opacity: 1, marginRight: "0.5rem" }}
                  exit={{ width: 0, opacity: 0, marginRight: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <Button
                    className="w-full"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    ← 上一步
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: answers.length > 0 ? "50%" : "100%" }}
              transition={
                isInitial
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }
              }
            >
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  取消
                </Button>
              </DrawerClose>
            </motion.div>
          </div>
        </DrawerFooter>
      </DrawerContent>

      {/* Loading Popout - Minimum 500ms display */}
      <AnimatePresence>
        {showLoadingPopout && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
              style={{ pointerEvents: "auto" }}
            >
              {/* Loading Card */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-background rounded-lg shadow-lg p-8 flex flex-col items-center gap-4 min-w-[200px]"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">載入中...</p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Drawer>
  );
}
