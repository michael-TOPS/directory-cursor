"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  conversation_id: string;
}

interface ChatConversationProps {
  chatId: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  currentUserId: string;
}

export const ChatConversation = ({
  chatId,
  participantId,
  participantName,
  participantAvatar,
  currentUserId,
}: ChatConversationProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', chatId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Mark messages as read
        const unreadMessages = data?.filter(
          msg => msg.recipient_id === currentUserId && !msg.read_at
        ) || [];

        if (unreadMessages.length > 0) {
          const { error: updateError } = await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', unreadMessages.map(msg => msg.id));

          if (updateError) console.error('Error marking messages as read:', updateError);
        }

        setMessages(data || []);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`conversation:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${chatId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          // If the message is for the current user, mark it as read
          if (newMessage.recipient_id === currentUserId) {
            const { error } = await supabase
              .from('messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMessage.id);

            if (error) console.error('Error marking message as read:', error);
          }

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, currentUserId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageToSend = {
      conversation_id: chatId,
      sender_id: currentUserId,
      recipient_id: participantId,
      content: newMessage,
    };

    setNewMessage("");

    try {
      const { error } = await supabase
        .from('messages')
        .insert([messageToSend]);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to send message:", error);
      // Could add a retry mechanism here
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center space-x-4 p-4 border-b">
        <Avatar className="h-10 w-10">
          {participantAvatar ? (
            <img
              src={participantAvatar}
              alt={participantName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              {participantName.charAt(0)}
            </div>
          )}
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{participantName}</h2>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isSentByMe = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isSentByMe
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-end space-x-2 mt-1">
                    <span className="text-xs opacity-70">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    {isSentByMe && (
                      <span className="text-xs">
                        {message.read_at ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}; 