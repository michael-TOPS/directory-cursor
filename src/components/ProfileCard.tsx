import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronRight } from "lucide-react";
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
      className="hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onClick(profile)}
    >
      <div className="p-4 flex items-center justify-between gap-4">
        {/* Left side - Avatar and main info */}
        <div className="flex items-center gap-4 min-w-0">
          <Avatar className="w-16 h-16 border-2 border-background shadow-sm flex-shrink-0">
            <AvatarImage src={profile.image_url} alt={profile.name || "Profile"} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary font-medium">
                ({profile.rating?.toFixed(1) || "0.0"})
              </span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(profile.rating || 0)
                        ? "fill-yellow-400 stroke-yellow-400"
                        : "fill-muted stroke-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-foreground truncate mb-1">
              {profile.name || "Anonymous"}
            </h3>
            
            <div className="text-sm text-muted-foreground truncate">
              {profile.company || "Independent Professional"}
            </div>
          </div>
        </div>

        {/* Right side - Role and state info */}
        <div className="flex-shrink-0 text-sm space-y-1 text-right">
          <div className="font-medium text-foreground">
            {displayRole}
          </div>
          <div className="text-muted-foreground">
            State Located: {profile.location || "N/A"}
          </div>
          <div className="text-muted-foreground">
            State(s) Licensed: {profile.licenses?.join(", ") || "N/A"}
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
      </div>
    </Card>
  );
};