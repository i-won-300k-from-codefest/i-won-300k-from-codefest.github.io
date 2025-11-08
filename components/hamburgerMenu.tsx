"use client";

import { useState, useEffect, useRef } from "react";
import {
  Menu,
  User,
  AlertCircle,
  Info,
  Mail,
  MapPin,
  UserCircle,
  Send,
  Newspaper,
  Clock,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserData {
  name: string;
  avatar: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
}

interface EmergencyContact {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  relation: string;
  coordinates: [number, number];
}

interface ChatMessage {
  id: number;
  senderId: number | "me";
  senderName: string;
  senderAvatar: string;
  message: string;
  timestamp: string;
}

interface NewsItem {
  id: number;
  title: string;
  category: string;
  content: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  source: string;
}

function UserStatusDialog({
  userData,
  isOpen,
  onOpenChange,
}: {
  userData: UserData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start h-12 cursor-pointer"
        >
          <User className="h-5 w-5 mr-3" />
          <span className="text-base">我的狀態</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>我的狀態</DialogTitle>
          <DialogDescription>您的個人資訊與聯絡方式</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* User Profile Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={userData?.avatar || "/avatar/user.png"}
                alt="使用者頭像"
              />
              <AvatarFallback>{userData?.name || "使用者"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-lg">
                {userData?.name || "載入中..."}
              </h3>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">電子信箱</span>
                <span className="text-sm text-muted-foreground">
                  {userData?.email || "載入中..."}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">聯絡電話</span>
                <span className="text-sm text-muted-foreground">
                  {userData?.phone || "載入中..."}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">地址</span>
                <span className="text-sm text-muted-foreground">
                  {userData?.address || "載入中..."}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <UserCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">緊急聯絡人</span>
                <span className="text-sm text-muted-foreground">
                  {userData?.emergencyContact.name || "載入中..."}
                </span>
                <span className="text-sm text-muted-foreground">
                  {userData?.emergencyContact.phone || "載入中..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusReportDialog({
  isOpen,
  onOpenChange,
  emergencyContacts,
  currentUser,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  emergencyContacts: EmergencyContact[];
  currentUser: UserData | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prefill chat history
    const initialMessages: ChatMessage[] = [
      {
        id: 1,
        senderId: 1,
        senderName: emergencyContacts[0]?.name || "李其睿",
        senderAvatar: emergencyContacts[0]?.avatar || "/avatar/1.png",
        message: "大家都還好嗎？剛才地震很大",
        timestamp: "10:23",
      },
      {
        id: 2,
        senderId: "me",
        senderName: currentUser?.name || "我",
        senderAvatar: currentUser?.avatar || "/avatar/user.png",
        message: "我這邊還好，有點晃但沒事",
        timestamp: "10:24",
      },
      {
        id: 3,
        senderId: 2,
        senderName: emergencyContacts[1]?.name || "董教授",
        senderAvatar: emergencyContacts[1]?.avatar || "/avatar/2.png",
        message: "我在家裡，東西掉了一些，人沒事",
        timestamp: "10:25",
      },
      {
        id: 4,
        senderId: 3,
        senderName: emergencyContacts[2]?.name || "優路扣特",
        senderAvatar: emergencyContacts[2]?.avatar || "/avatar/3.png",
        message: "剛從辦公室跑出來，有點嚇到",
        timestamp: "10:26",
      },
      {
        id: 5,
        senderId: 4,
        senderName: emergencyContacts[3]?.name || "薩摩耶",
        senderAvatar: emergencyContacts[3]?.avatar || "/avatar/4.png",
        message: "家裡的書櫃倒了，正在整理",
        timestamp: "10:27",
      },
    ];
    setMessages(initialMessages);
  }, [emergencyContacts, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: messages.length + 1,
      senderId: "me",
      senderName: currentUser?.name || "我",
      senderAvatar: currentUser?.avatar || "/avatar/user.png",
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start h-12 cursor-pointer"
        >
          <AlertCircle className="h-5 w-5 mr-3" />
          <span className="text-base">狀態回報</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>狀態回報</DialogTitle>
          <DialogDescription>與緊急聯絡人群組對話</DialogDescription>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.senderId === "me" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={msg.senderAvatar} alt={msg.senderName} />
                <AvatarFallback>{msg.senderName[0]}</AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col gap-1 ${
                  msg.senderId === "me" ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {msg.senderName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {msg.timestamp}
                  </span>
                </div>
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs ${
                    msg.senderId === "me"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2 place-items-center">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="輸入訊息..."
              className="flex-1"
            />
            <Button size="icon" variant="ghost" onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
              <span className="sr-only">發送</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NewsDialog({
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
        <Button
          variant="outline"
          className="w-full justify-start h-12 cursor-pointer"
        >
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
                        item.priority,
                      )}`}
                    >
                      {item.category}
                    </span>
                    {item.priority === "high" && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <h3 className="font-semibold text-base mb-2">{item.title}</h3>
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

function UserDrawer({
  userData,
  emergencyContacts,
  news,
}: {
  userData: UserData | null;
  emergencyContacts: EmergencyContact[];
  news: NewsItem[];
}) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 right-4 z-10"
        >
          <Menu />
          <span className="sr-only">開啟選單</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex-1 overflow-y-auto">
            {/* User Profile Section */}
            <div className="px-4 py-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={userData?.avatar || "/avatar/user.png"}
                    alt="使用者頭像"
                  />
                  <AvatarFallback>{userData?.name || "使用者"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-lg">
                    {userData?.name || "載入中..."}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </DrawerHeader>

        <Separator />

        <div className="flex flex-col gap-2 p-4">
          <UserStatusDialog
            userData={userData}
            isOpen={isStatusDialogOpen}
            onOpenChange={setIsStatusDialogOpen}
          />

          <StatusReportDialog
            isOpen={isReportDialogOpen}
            onOpenChange={setIsReportDialogOpen}
            emergencyContacts={emergencyContacts}
            currentUser={userData}
          />

          <NewsDialog
            isOpen={isNewsDialogOpen}
            onOpenChange={setIsNewsDialogOpen}
            news={news}
          />
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="destructive" className="cursor-pointer">
              登出
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default function HamburgerMenu() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch("/current-user.json")
      .then((res) => res.json())
      .then((data) => setUserData(data))
      .catch((err) => console.error("Failed to load user data:", err));

    fetch("/emergency-contacts.json")
      .then((res) => res.json())
      .then((data) => setEmergencyContacts(data.contacts || []))
      .catch((err) => console.error("Failed to load emergency contacts:", err));

    fetch("/news.json")
      .then((res) => res.json())
      .then((data) => setNews(data.news || []))
      .catch((err) => console.error("Failed to load news:", err));
  }, []);

  return (
    <UserDrawer
      userData={userData}
      emergencyContacts={emergencyContacts}
      news={news}
    />
  );
}
