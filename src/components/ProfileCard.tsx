"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";
import { MessageModal } from "./MessageModal";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  name: string;
  image_url?: string;
  location?: string;
  rating?: number;
  role?: string;
  specialties?: string[];
  bio?: string;
  certifications?: string[];
  licenses?: string[];
}

interface ProfileCardProps {
  profile: Profile;
  onClick: (profile: Profile) => void;
}

export const ProfileCard = ({ profile, onClick }: ProfileCardProps) => {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const navigate = useNavigate();

  // Check if user is authenticated
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUser({ id: session.user.id });
      // If authenticated, navigate to messages page
      navigate(`/messages?recipient=${profile.id}`);
    } else {
      // If not authenticated, show the public message form
      setIsMessageModalOpen(true);
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    checkAuth();
  };

  return (
    <>
      <Card
        onClick={() => onClick(profile)}
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="aspect-square relative">
          <img
            src={profile.image_url || "/placeholder.svg"}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
          {profile.rating && (
            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-sm font-medium">
              ⭐️ {profile.rating}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg">{profile.name}</h3>
              {profile.location && (
                <p className="text-sm text-gray-500">{profile.location}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMessageClick}
              className="mt-[-4px]"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>

          {profile.role && (
            <Badge variant="secondary" className="mb-2">
              {profile.role}
            </Badge>
          )}

          {profile.specialties && profile.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {profile.specialties.map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}

          {profile.bio && (
            <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
          )}
        </div>
      </Card>

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipientId={profile.id}
        recipientName={profile.name}
      />
    </>
  );
};