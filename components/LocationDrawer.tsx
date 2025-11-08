"use client";

import { useState } from "react";
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

type LocationType = "店鋪" | "出入口" | "廁所" | "餐廳";

const LOCATION_OPTIONS: LocationType[] = ["店鋪", "出入口", "廁所", "餐廳"];

export function LocationDrawer() {
  const [step, setStep] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(
    null,
  );
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [isInitial, setIsInitial] = useState(true);

  const handleLocationSelect = (location: LocationType) => {
    setSelectedLocation(location);
    setDirection(1);
    setIsInitial(false);
    setStep(1);
  };

  const handleBack = () => {
    setDirection(-1);
    setIsInitial(false);
    setStep(0);
  };

  const handleReset = () => {
    setStep(0);
    setSelectedLocation(null);
    setDirection(1);
    setIsInitial(true);
  };

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
    <Drawer onOpenChange={(open) => !open && handleReset()}>
      <DrawerTrigger asChild>
        <Button className="w-full">我在哪裡</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {step === 0 ? "您最靠近什麼地方？" : "接下來的問題"}
          </DrawerTitle>
          <DrawerDescription>
            {step === 0
              ? "請選擇您最靠近的位置"
              : `您選擇了：${selectedLocation}`}
          </DrawerDescription>
        </DrawerHeader>

        <div className="relative overflow-hidden p-4">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="step-0"
                custom={direction}
                variants={slideVariants}
                initial={isInitial ? "center" : "enter"}
                animate="center"
                exit="exit"
                transition={transition}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {LOCATION_OPTIONS.map((location) => (
                      <Button
                        key={location}
                        className="w-full "
                        variant="outline"
                        onClick={() => handleLocationSelect(location)}
                      >
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className="absolute inset-0 px-4"
              >
                <div className="space-y-4">
                  <p className="text-muted-foreground mb-4">
                    接下來的問題將會出現在這裡
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" className="w-full h-16">
                      選項 1
                    </Button>
                    <Button variant="outline" className="w-full h-16">
                      選項 2
                    </Button>
                    <Button variant="outline" className="w-full h-16">
                      選項 3
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={handleBack}
                  >
                    ← 返回上一步
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              取消
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
