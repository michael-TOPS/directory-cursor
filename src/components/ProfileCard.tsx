import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileCardProps {
  profile: Profile;
  onClick: (profile: Profile) => void;
}

export const ProfileCard = ({ profile, onClick }: ProfileCardProps) => {
  const displayRole = profile.role === "Both" ? "Appraiser | Umpire" : profile.role || "Appraiser";
  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "AN";

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fadeIn cursor-pointer bg-white hover:bg-gray-50/50"
      onClick={() => onClick(profile)}
    >
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
            <AvatarImage src={profile.image_url} alt={profile.name || "Profile"} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base text-gray-900 truncate">
              {profile.name || "Anonymous"}
            </h3>
            {profile.company && (
              <div className="text-sm text-gray-600 truncate mt-0.5 mb-1.5">
                {profile.company}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="truncate max-w-[100px]">{profile.location || "Location not specified"}</span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center shrink-0">
                <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
                <span className="font-medium">{profile.rating?.toFixed(1) || "0.0"}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="text-xs px-2.5 py-0.5 font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {displayRole}
          </Badge>
          {(profile.specialties || []).slice(0, 2).map((specialty) => (
            <Badge
              key={specialty}
              variant="outline"
              className="text-xs px-2.5 py-0.5 bg-white"
            >
              {specialty}
            </Badge>
          ))}
          {(profile.specialties || []).length > 2 && (
            <Badge
              variant="outline"
              className="text-xs px-2.5 py-0.5 bg-white"
            >
              +{(profile.specialties || []).length - 2} more
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};