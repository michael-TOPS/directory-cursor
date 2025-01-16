"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PublicMessageForm } from "./PublicMessageForm";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
}

export const MessageModal = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
}: MessageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <PublicMessageForm
            recipientId={recipientId}
            recipientName={recipientName}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}; 