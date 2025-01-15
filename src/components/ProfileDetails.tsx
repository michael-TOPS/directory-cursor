import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle, Pencil } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileDetailsProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onMessageClick: () => void;
  onEditClick?: () => void;
}

export const ProfileDetails = ({
  profile,
  isOpen,
  onClose,
  onMessageClick,
  onEditClick,
}: ProfileDetailsProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-2xl font-bold">
                {profile.name || "Anonymous"}
              </SheetTitle>
              <SheetDescription className="flex items-center mt-1">
                <span className="text-gray-600">{profile.location}</span>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
                  <span>{profile.rating?.toFixed(1) || "0.0"}</span>
                </div>
              </SheetDescription>
            </div>
            <div className="flex gap-2">
              {onEditClick && (
                <Button onClick={onEditClick} variant="outline" className="flex items-center">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button onClick={onMessageClick} className="flex items-center">
                <MessageCircle className="mr-2" />
                Message
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Role */}
          <div>
            <h3 className="font-semibold mb-2">Role</h3>
            <Badge variant="secondary">{profile.role}</Badge>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-gray-600">{profile.bio}</p>
            </div>
          )}

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