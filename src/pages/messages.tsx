"use client";

import { useState, useEffect } from "react";
import { ChatList } from "@/components/ChatList";
import { ChatConversation } from "@/components/ChatConversation";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<{
    participantId: string;
    participantName: string;
    participantAvatar?: string;
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email?: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setCurrentUser({
        id: session.user.id,
        email: session.user.email,
      });
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
        return;
      }
      setCurrentUser({
        id: session.user.id,
        email: session.user.email,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleChatSelect = async (chatId: string) => {
    setSelectedChatId(chatId);
    
    try {
      // Fetch chat details
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant:profiles!participant2_id(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', chatId)
        .single();

      if (error) throw error;

      if (conversation) {
        setSelectedChat({
          participantId: conversation.participant.id,
          participantName: conversation.participant.full_name,
          participantAvatar: conversation.participant.avatar_url,
        });
      }
    } catch (error) {
      console.error('Error fetching chat details:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <ChatList
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChatId || undefined}
          currentUserId={currentUser.id}
        />
      </div>

      {/* Chat Conversation or Empty State */}
      <div className="flex-1">
        {selectedChat ? (
          <ChatConversation
            chatId={selectedChatId!}
            participantId={selectedChat.participantId}
            participantName={selectedChat.participantName}
            participantAvatar={selectedChat.participantAvatar}
            currentUserId={currentUser.id}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
} 