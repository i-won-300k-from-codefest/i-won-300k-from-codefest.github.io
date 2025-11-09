"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useFamily } from "@/contexts/FamilyContext";

export default function AddMemberDrawer() {
  const { addMember } = useFamily();
  const [isOpen, setIsOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    relation: "",
    phone: "",
    avatar: "",
    coordinates: [121.4685, 25.0458] as [number, number], // Default coordinates (New Taipei City center)
  });

  const handleSubmit = () => {
    if (!newMember.name || !newMember.phone || !newMember.relation) {
      alert("請填寫必要欄位：姓名、關係、電話");
      return;
    }

    addMember({
      name: newMember.name,
      relation: newMember.relation,
      phone: newMember.phone,
      avatar: newMember.avatar || "/avatar/user.png",
      coordinates: newMember.coordinates,
    });

    // Close drawer and reset form
    setIsOpen(false);
    setNewMember({
      name: "",
      relation: "",
      phone: "",
      avatar: "",
      coordinates: [121.4685, 25.0458],
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="cursor-pointer">新增成員</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>新增家庭成員</DrawerTitle>
          <DrawerDescription>請填寫新成員的資訊</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              placeholder="請輸入姓名"
              value={newMember.name}
              onChange={(e) =>
                setNewMember({ ...newMember, name: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="relation">關係</Label>
            <Input
              id="relation"
              placeholder="例如：父親、母親、子女"
              value={newMember.relation}
              onChange={(e) =>
                setNewMember({ ...newMember, relation: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">電話</Label>
            <Input
              id="phone"
              placeholder="請輸入電話號碼"
              value={newMember.phone}
              onChange={(e) =>
                setNewMember({ ...newMember, phone: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="avatar">頭像網址 (選填)</Label>
            <Input
              id="avatar"
              placeholder="請輸入頭像圖片網址"
              value={newMember.avatar}
              onChange={(e) =>
                setNewMember({ ...newMember, avatar: e.target.value })
              }
            />
          </div>
        </div>

        <DrawerFooter>
          <Button onClick={handleSubmit} className="cursor-pointer">
            確認新增
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="cursor-pointer">
              取消
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
