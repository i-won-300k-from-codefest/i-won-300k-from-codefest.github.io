"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  User,
  AlertCircle,
  Info,
  Phone,
  Mail,
  MapPin,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
        <Button variant="outline" className="w-full justify-start h-12">
          <User className="h-5 w-5 mr-3" />
          <span className="text-base">我的狀態</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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

function UserDrawer({ userData }: { userData: UserData | null }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />

          <Button variant="outline" className="w-full justify-start h-12">
            <AlertCircle className="h-5 w-5 mr-3" />
            <span className="text-base">狀態回報</span>
          </Button>
          <Button variant="outline" className="w-full justify-start h-12">
            <Info className="h-5 w-5 mr-3" />
            <span className="text-base">最新資訊</span>
          </Button>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">關閉</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default function HamburgerMenu() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    fetch("/current-user.json")
      .then((res) => res.json())
      .then((data) => setUserData(data))
      .catch((err) => console.error("Failed to load user data:", err));
  }, []);

  return <UserDrawer userData={userData} />;
}
