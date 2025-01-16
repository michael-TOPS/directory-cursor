"use client";

import { useState, useEffect } from "react";
import { Avatar } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";

interface Chat {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message: {
    content: string;
    created_at: string;
  } | null;
  participant: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  unread_count: number;
}

interface ChatListProps {
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
  currentUserId: string;
}

export const ChatList = ({ onChatSelect, selectedChatId, currentUserId }: ChatListProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Fetch conversations and join with profiles and messages
        const { data: conversations, error } = await supabase
          .from('conversations')
          .select(`
            *,
            last_message:messages!last_message_id(*),
            participant:profiles!participant2_id(*)
          `)
          .eq('participant1_id', currentUserId)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // Get unread message counts
        const unreadCounts = await Promise.all(
          conversations.map(async (chat) => {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', chat.id)
              .eq('recipient_id', currentUserId)
              .is('read_at', null);
            
            return {
              chatId: chat.id,
              count: count || 0
            };
          })
        );

        // Combine conversations with unread counts
        const chatsWithUnread = conversations.map(chat => ({
          ...chat,
          unread_count: unreadCounts.find(c => c.chatId === chat.id)?.count || 0
        }));

        setChats(chatsWithUnread);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();

    // Subscribe to new messages
    const subscription = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${currentUserId}`,
        },
        () => {
          fetchChats(); // Refresh the chat list
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserId]);

  const handleChatClick = (chatId: string) => {
    onChatSelect(chatId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="space-y-2 p-4">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            className={`w-full flex items-center space-x-4 p-4 rounded-lg transition-colors ${
              selectedChatId === chat.id
                ? "bg-gray-100 dark:bg-gray-800"
                : "hover:bg-gray-50 dark:hover:bg-gray-900"
            }`}
          >
            <Avatar className="h-12 w-12">
              {chat.participant.avatar_url ? (
                <img
                  src={chat.participant.avatar_url}
                  alt={chat.participant.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  {chat.participant.full_name.charAt(0)}
                </div>
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium truncate">
                  {chat.participant.full_name}
                </p>
                {chat.last_message?.created_at && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(chat.last_message.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 truncate">
                  {chat.last_message?.content || "No messages yet"}
                </p>
                {chat.unread_count > 0 && (
                  <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                    {chat.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}; 