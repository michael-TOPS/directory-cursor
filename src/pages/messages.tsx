"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

interface Profile {
  id: string;
  name: string;
  image_url?: string;
}

export default function Messages() {
  const { id: recipientId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const { toast } = useToast();

  // Fetch recipient profile
  useEffect(() => {
    const fetchRecipient = async () => {
      if (!recipientId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, image_url')
        .eq('id', recipientId)
        .single();

      if (error) {
        console.error('Error fetching recipient:', error);
        return;
      }

      setRecipient(data);
    };

    fetchRecipient();
  }, [recipientId]);

  // Fetch current user profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, image_url')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching current user:', error);
        return;
      }

      setCurrentUser(data);
    };

    fetchCurrentUser();
  }, []);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!recipientId || !currentUser) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (
            (newMessage.sender_id === currentUser?.id && newMessage.recipient_id === recipientId) ||
            (newMessage.sender_id === recipientId && newMessage.recipient_id === currentUser?.id)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recipientId, currentUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !recipientId) return;

    try {
      const { error } = await supabase.from('messages').insert([
        {
          sender_id: currentUser.id,
          recipient_id: recipientId,
          content: newMessage,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!recipient || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {recipient.image_url ? (
            <img
              src={recipient.image_url}
              alt={recipient.name}
              className="h-full w-full object-cover rounded-full"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-lg font-semibold">
              {recipient.name.charAt(0)}
            </div>
          )}
        </Avatar>
        <div>
          <h2 className="font-semibold">{recipient.name}</h2>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUser.id;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className={`text-xs mt-1 block ${
                    isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
} 