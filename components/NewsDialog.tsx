"use client";

import { Info, Newspaper, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NewsItem {
  id: number;
  title: string;
  category: string;
  content: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  source: string;
}

export function NewsDialog({
  isOpen,
  onOpenChange,
  news,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  news: NewsItem[];
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("zh-TW", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start h-12">
          <Info className="h-5 w-5 mr-3" />
          <span className="text-base">最新資訊</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            最新資訊
          </DialogTitle>
          <DialogDescription>緊急災害通知與最新消息</DialogDescription>
        </DialogHeader>

        {/* News List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {news.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityColor(
                        item.priority
                      )}`}
                    >
                      {item.category}
                    </span>
                    {item.priority === "high" && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <h3 className="font-semibold text-base mb-2">
                    {item.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {item.content}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Newspaper className="h-3 w-3" />
                  <span>{item.source}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimestamp(item.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}

          {news.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Newspaper className="h-12 w-12 mb-2 opacity-20" />
              <p>目前沒有最新消息</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { NewsItem };
