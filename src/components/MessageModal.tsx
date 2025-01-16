"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
        </DialogHeader>
        <PublicMessageForm
          recipientId={recipientId}
          recipientName={recipientName}
        />
      </DialogContent>
    </Dialog>
  );
}; 