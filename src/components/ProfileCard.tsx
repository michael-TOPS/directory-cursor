import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileCardProps {
  profile: Profile;
  onClick: (profile: Profile) => void;
}

export const ProfileCard = ({ profile, onClick }: ProfileCardProps) => {
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow animate-fadeIn cursor-pointer"
      onClick={() => onClick(profile)}
    >
      <div className="aspect-square relative">
        <img
          src={profile.image_url || "/placeholder.svg"}
          alt={profile.name || "Profile"}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{profile.name || "Anonymous"}</h3>
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <span>{profile.location || "Location not specified"}</span>
          <span className="mx-2">•</span>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
            <span>{profile.rating?.toFixed(1) || "0.0"}</span>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="mb-3"
        >
          {profile.role || "Appraiser"}
        </Badge>
        <div className="flex flex-wrap gap-2">
          {(profile.specialties || []).map((specialty) => (
            <Badge
              key={specialty}
              variant="outline"
              className="text-xs"
            >
              {specialty}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};