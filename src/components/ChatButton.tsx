"use client";

import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";

interface ChatButtonProps {
  onClick: () => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export const ChatButton = ({
  onClick,
  className = "",
  variant = "default",
  size = "default",
}: ChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      className={`flex items-center space-x-2 ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      <span>Chat</span>
    </Button>
  );
}; 