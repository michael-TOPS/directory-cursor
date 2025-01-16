"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  if (!profile) return null;

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            recipient_id: profile.id,
            sender_name: senderName,
            sender_email: senderEmail,
            sender_phone: senderPhone,
            content: message,
            is_public: true,
            status: 'unread',
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: `Your message has been sent to ${profile.name}. They will contact you via email.`,
      });

      // Reset form
      setSenderName("");
      setSenderEmail("");
      setSenderPhone("");
      setMessage("");
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

          {/* Message Button or Form */}
          {isAuthenticated ? (
            <Button
              className="w-full mt-6"
              onClick={() => onMessageClick(profile)}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Message {profile.name.split(' ')[0]}
            </Button>
          ) : (
            <div className="mt-6">
              <h3 className="font-semibold mb-4">Send Message to {profile.name}</h3>
              <form onSubmit={handleSubmitMessage} className="space-y-4">
                <div>
                  <Input
                    placeholder="Your name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="tel"
                    placeholder="Your phone number"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="min-h-[100px]"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}; 