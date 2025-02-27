"use client";

import { SearchBar } from "@/components/SearchBar";
import { ProfileCard } from "@/components/ProfileCard";
import { ProfilePanel } from "@/components/ProfilePanel";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageModal } from "@/components/MessageModal";

// Mock data for development
const MOCK_PROFILES = [
  {
    id: "1",
    name: "Sarah Johnson",
    location: "New York, NY",
    rating: 4.8,
    role: "Appraiser",
    specialties: ["Residential", "Commercial"],
    bio: "Experienced appraiser with over 10 years in the industry",
    certifications: ["Certified Residential Appraiser", "FHA Approved"],
    licenses: ["NY State License #12345", "NJ State License #67890"],
  },
  {
    id: "2",
    name: "Michael Chen",
    location: "San Francisco, CA",
    rating: 4.9,
    role: "Both",
    specialties: ["Real Estate", "Equipment"],
    bio: "Specializing in commercial and residential properties with expertise in the Bay Area market. Experienced in both appraisal and umpire roles for complex cases.",
    certifications: ["Certified General Appraiser", "Equipment Valuation Specialist"],
    licenses: ["CA State License #54321"],
  },
  {
    id: "3",
    name: "David Williams",
    location: "Chicago, IL",
    rating: 4.7,
    role: "Umpire",
    specialties: ["Insurance", "Property Damage"],
    bio: "Expert in insurance claim disputes with a background in property damage assessment. Specializing in fair and efficient dispute resolution.",
    certifications: ["Licensed Insurance Adjuster", "Certified Mediator"],
    licenses: ["IL State License #98765", "IN State License #45678"],
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<(typeof MOCK_PROFILES)[0] | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<(typeof MOCK_PROFILES)[0] | null>(null);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setProfiles(MOCK_PROFILES);
      return;
    }

    const filtered = MOCK_PROFILES.filter(profile => 
      Object.values(profile).some(value => 
        String(value).toLowerCase().includes(term.toLowerCase())
      )
    );
    setProfiles(filtered);
  };

  const handleProfileClick = (profile: any) => {
    setSelectedProfile(profile);
    setIsPanelOpen(true);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    // Optional: Clear selected profile after animation
    setTimeout(() => setSelectedProfile(null), 300);
  };

  const handleMessageClick = async (profile: any, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent card click event if event exists
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      navigate(`/messages/${profile.id}`);
    } else {
      setMessageRecipient(profile);
      setIsMessageModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with Login Button */}
      <div className="container max-w-3xl py-4">
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={handleLoginClick}
            className="font-semibold"
          >
            Login
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container max-w-3xl py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          Find Expert Appraisers & Umpires
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with qualified professionals for your appraisal and insurance needs
        </p>
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Directory List */}
      <div className="container max-w-3xl pb-16">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onClick={handleProfileClick}
                onMessageClick={(e) => handleMessageClick(profile, e)}
              />
            ))}
            {profiles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No profiles found. Try adjusting your search.
              </div>
            )}
          </div>
        )}
      </div>

      {selectedProfile && (
        <ProfilePanel
          profile={selectedProfile}
          isOpen={isPanelOpen}
          onClose={handlePanelClose}
          onMessageClick={handleMessageClick}
        />
      )}

      {messageRecipient && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => {
            setIsMessageModalOpen(false);
            setMessageRecipient(null);
          }}
          recipientId={messageRecipient.id}
          recipientName={messageRecipient.name}
        />
      )}
    </div>
  );
};

export default Index;