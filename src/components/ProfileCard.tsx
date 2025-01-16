"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";
import { MessageModal } from "./MessageModal";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./ui/avatar";

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
  const navigate = useNavigate();

  const handleMessageClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // If authenticated, navigate to messages page
      navigate(`/messages/${profile.id}`);
    } else {
      // If not authenticated, show the public message form
      setIsMessageModalOpen(true);
    }
  };

  return (
    <>
      <Card
        onClick={() => onClick(profile)}
        className="hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="p-4 flex items-center gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16 flex-shrink-0">
            {profile.image_url ? (
              <img
                src={profile.image_url}
                alt={profile.name}
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-lg font-semibold">
                {profile.name.charAt(0)}
              </div>
            )}
          </Avatar>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="font-semibold text-lg truncate">{profile.name}</h3>
                {profile.location && (
                  <p className="text-sm text-gray-500 truncate">{profile.location}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {profile.rating && (
                  <span className="text-sm font-medium">⭐️ {profile.rating}</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMessageClick}
                  className="flex-shrink-0"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-1">
              {profile.role && (
                <Badge variant="secondary" className="text-xs">
                  {profile.role}
                </Badge>
              )}
              {profile.specialties?.slice(0, 3).map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {profile.specialties && profile.specialties.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{profile.specialties.length - 3} more
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-600 line-clamp-1">{profile.bio}</p>
            )}
          </div>
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