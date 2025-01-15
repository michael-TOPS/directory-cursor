import { SearchBar } from "@/components/SearchBar";
import { ProfileCard } from "@/components/ProfileCard";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Mock data for initial display
const MOCK_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    image_url: "/placeholder.svg",
    location: "New York, NY",
    rating: 4.8,
    role: "Appraiser",
    specialties: ["Residential", "Commercial", "Industrial"],
    bio: "Experienced appraiser with over 10 years in the industry",
    certifications: ["CRA", "SRA"],
    licenses: ["NY-123456", "NJ-789012"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Michael Chen",
    image_url: "/placeholder.svg",
    location: "San Francisco, CA",
    rating: 4.9,
    role: "Both",
    specialties: ["Real Estate", "Equipment", "Business Valuation"],
    bio: "Specializing in commercial and residential properties",
    certifications: ["MAI", "AI-GRS"],
    licenses: ["CA-456789", "OR-234567"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "David Williams",
    image_url: "/placeholder.svg",
    location: "Chicago, IL",
    rating: 4.7,
    role: "Umpire",
    specialties: ["Insurance", "Property Damage", "Liability"],
    bio: "Expert in insurance claim disputes and property damage assessment",
    certifications: ["CPCU", "AIC"],
    licenses: ["IL-345678", "WI-901234"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    image_url: "/placeholder.svg",
    location: "Miami, FL",
    rating: 4.9,
    role: "Appraiser",
    specialties: ["Residential", "Luxury Properties"],
    bio: "Luxury property specialist with extensive market knowledge",
    certifications: ["CRA", "CREA"],
    licenses: ["FL-567890"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const Index = () => {
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const { toast } = useToast();

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setProfiles(MOCK_PROFILES);
      return;
    }

    const filtered = MOCK_PROFILES.filter((profile) =>
      Object.values(profile).some((value) =>
        String(value).toLowerCase().includes(term.toLowerCase())
      )
    );
    setProfiles(filtered);
  };

  const handleProfileClick = (profile: Profile) => {
    toast({
      title: "Coming Soon",
      description: "Profile details will be available soon!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          Find Expert Appraisers & Umpires
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with qualified professionals for your appraisal and insurance needs
        </p>
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Directory Grid */}
      <div className="container pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onClick={handleProfileClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;