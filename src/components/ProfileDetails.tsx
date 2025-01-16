import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Share2, BookmarkPlus, PenSquare, CheckCircle2, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileDetailsProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onWriteReview: () => void;
  onShare: () => void;
  onSave: () => void;
}

export const ProfileDetails = ({
  profile,
  isOpen,
  onClose,
  onWriteReview,
  onShare,
  onSave,
}: ProfileDetailsProps) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const roles = [];
  if (profile.role?.includes('Appraiser')) roles.push('Appraiser');
  if (profile.role?.includes('Umpire')) roles.push('Umpire');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-2xl font-bold">
                {profile.name || "Anonymous"}
              </SheetTitle>
              {profile.isClaimed && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Claimed
                </Badge>
              )}
            </div>
            
            <SheetDescription className="mt-2 space-y-2">
              {profile.company && (
                <div className="text-base font-medium text-gray-700">
                  {profile.company}
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
                  <span className="font-medium">{profile.rating?.toFixed(1) || "0.0"}</span>
                  <span className="text-gray-500 ml-1">
                    ({profile.reviewCount || 0} reviews)
                  </span>
                </div>
                <div className="flex gap-2">
                  {roles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </SheetDescription>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onWriteReview}
              className="flex-1 flex items-center justify-center"
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Write Review
            </Button>
            <Button
              onClick={onShare}
              variant="outline"
              className="flex items-center justify-center"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button
              onClick={onSave}
              variant="outline"
              className="flex items-center justify-center"
            >
              <BookmarkPlus className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Business</h2>
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                <AvatarFallback>{profile.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{profile.name}</h3>
                <p className="text-gray-600">{profile.title || "Business Owner"}</p>
              </div>
            </div>
            
            {profile.bio && (
              <div className="space-y-4">
                <p className={`text-gray-600 ${!isDescriptionExpanded ? "line-clamp-3" : ""}`}>
                  {profile.bio}
                </p>
                <Button
                  variant="ghost"
                  className="flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                >
                  {isDescriptionExpanded ? "Read less" : "Read more"}
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isDescriptionExpanded ? "rotate-180" : ""}`} />
                </Button>
              </div>
            )}
          </div>

          {/* Specialties */}
          {profile.specialties && profile.specialties.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {profile.specialties.map((specialty) => (
                  <Badge key={specialty} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {profile.certifications && profile.certifications.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map((cert) => (
                  <Badge key={cert} variant="outline">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Licenses */}
          {profile.licenses && profile.licenses.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">State Licenses</h3>
              <div className="flex flex-wrap gap-2">
                {profile.licenses.map((license) => (
                  <Badge key={license} variant="outline">
                    {license}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};