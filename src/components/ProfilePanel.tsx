"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Star, MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useState } from "react";
import { MessageModal } from "@/components/MessageModal";
import { supabase } from "@/lib/supabase";

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

interface ProfilePanelProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onMessageClick: (profile: Profile) => void;
}

export const ProfilePanel = ({
  profile,
  isOpen,
  onClose,
  onMessageClick,
}: ProfilePanelProps) => {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  if (!profile) return null;

  const handleMessageClick = async () => {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // If authenticated, use the parent's message click handler
      onMessageClick(profile);
    } else {
      // If not authenticated, show the message modal
      setIsMessageModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsMessageModalOpen(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="space-y-4 pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {profile.image_url ? (
                  <img
                    src={profile.image_url}
                    alt={profile.name}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-2xl font-semibold">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </Avatar>
              <div className="flex-1">
                <SheetTitle className="text-2xl">{profile.name}</SheetTitle>
                {profile.location && (
                  <div className="flex items-center gap-1 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
              {profile.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{profile.rating}</span>
                </div>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Role and Specialties */}
            <div className="space-y-2">
              {profile.role && (
                <Badge variant="secondary" className="mr-2">
                  {profile.role}
                </Badge>
              )}
              {profile.specialties?.map((specialty) => (
                <Badge key={specialty} variant="outline" className="mr-2">
                  {specialty}
                </Badge>
              ))}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="space-y-2">
                <h3 className="font-semibold">About</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Certifications</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {profile.certifications.map((cert) => (
                    <li key={cert}>{cert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Licenses */}
            {profile.licenses && profile.licenses.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Licenses</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {profile.licenses.map((license) => (
                    <li key={license}>{license}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Message Button */}
            <Button
              className="w-full mt-6"
              onClick={handleMessageClick}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Message {profile.name.split(' ')[0]}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={handleModalClose}
        recipientId={profile.id}
        recipientName={profile.name}
      />
    </>
  );
}; 