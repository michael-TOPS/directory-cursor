import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCard } from "@/components/ProfileCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel, FilterValues } from "@/components/FilterPanel";
import { ProfileDetails } from "@/components/ProfileDetails";
import { ProfileEdit } from "@/components/ProfileEdit";
import { UserMenu } from "@/components/UserMenu";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const DUMMY_PROFILES: Profile[] = [
  {
    id: 'dummy1',
    name: 'Sarah Johnson',
    role: 'Both',
    location: 'CA',
    image_url: '',
    rating: 4.8,
    specialties: ['Commercial', 'Residential'],
    licenses: ['CA', 'NV', 'OR'],
    bio: 'Experienced appraiser with 15+ years in commercial and residential properties.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    certifications: ['CRP', 'SRA'],
  },
  {
    id: 'dummy2',
    name: 'Michael Chen',
    role: 'Appraiser',
    location: 'WA',
    image_url: '',
    rating: 4.9,
    specialties: ['Luxury Homes', 'Waterfront'],
    licenses: ['WA', 'OR'],
    bio: 'Specializing in luxury and waterfront properties in the Pacific Northwest.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    certifications: ['CRP'],
  },
  {
    id: 'dummy3',
    name: 'Emily Rodriguez',
    role: 'Umpire',
    location: 'TX',
    image_url: '',
    rating: 4.7,
    specialties: ['Dispute Resolution', 'Commercial'],
    licenses: ['TX', 'NM', 'AZ'],
    bio: 'Expert in resolving complex property disputes and commercial valuations.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    certifications: ['CPPA'],
  },
  {
    id: 'dummy4',
    name: 'David Thompson',
    role: 'Both',
    location: 'FL',
    image_url: '',
    rating: 4.6,
    specialties: ['Hurricane Damage', 'Coastal Properties'],
    licenses: ['FL', 'GA', 'SC'],
    bio: 'Specialized experience in hurricane damage assessment and coastal properties.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    certifications: ['CRP', 'CPPA'],
  },
  {
    id: 'dummy5',
    name: 'Lisa Martinez',
    role: 'Appraiser',
    location: 'AZ',
    image_url: '',
    rating: 4.9,
    specialties: ['Desert Properties', 'New Construction'],
    licenses: ['AZ', 'NV'],
    bio: 'Expert in desert property valuation and new construction assessment.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    certifications: ['SRA'],
  },
  {
    id: 'dummy6',
    name: 'James Wilson',
    role: 'Both',
    location: 'NY',
    image_url: '',
    rating: 4.8,
    specialties: ['Urban Properties', 'Historic Buildings'],
    licenses: ['NY', 'NJ', 'CT'],
    bio: 'Specializing in urban property valuation and historic building assessment.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    certifications: ['CRP', 'SRA'],
  },
  {
    id: 'dummy7',
    name: 'Patricia Brown',
    role: 'Umpire',
    location: 'IL',
    image_url: '',
    rating: 4.7,
    specialties: ['Dispute Resolution', 'Commercial'],
    licenses: ['IL', 'IN', 'WI'],
    bio: 'Experienced in mediating complex property disputes in the Midwest.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    certifications: ['CPPA'],
  },
  {
    id: 'dummy8',
    name: 'Robert Kim',
    role: 'Appraiser',
    location: 'MA',
    image_url: '',
    rating: 4.9,
    specialties: ['Historic Homes', 'Coastal'],
    licenses: ['MA', 'RI', 'NH'],
    bio: 'Expert in New England historic homes and coastal property valuation.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    certifications: ['CRP'],
  },
  {
    id: 'dummy9',
    name: 'Jennifer Taylor',
    role: 'Both',
    location: 'CO',
    image_url: '',
    rating: 4.8,
    specialties: ['Mountain Properties', 'Luxury Homes'],
    licenses: ['CO', 'UT', 'WY'],
    bio: 'Specialized in mountain property and luxury home valuations.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    certifications: ['CRP', 'CPPA'],
  },
  {
    id: 'dummy10',
    name: 'William Garcia',
    role: 'Appraiser',
    location: 'NV',
    image_url: '',
    rating: 4.6,
    specialties: ['Commercial', 'Land'],
    licenses: ['NV', 'UT'],
    bio: 'Expert in commercial property and land valuations in the Mountain West.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    certifications: ['SRA'],
  },
  {
    id: 'dummy11',
    name: 'Amanda White',
    role: 'Both',
    location: 'SC',
    image_url: '',
    rating: 4.7,
    specialties: ['Coastal', 'Resort Properties'],
    licenses: ['SC', 'NC', 'GA'],
    bio: 'Specializing in coastal and resort property valuations.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    certifications: ['CRP', 'SRA'],
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterValues>({
    role: null,
    statesLocated: [],
    statesLicensed: [],
  });
  const [isResizeComplete, setIsResizeComplete] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch current user's profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
      } else {
        setCurrentUser(profile);
      }
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    const fetchProfiles = async () => {
      // For testing, we'll use dummy data
      setProfiles(DUMMY_PROFILES);
      setFilteredProfiles(DUMMY_PROFILES);
      setLoading(false);
      setIsResizeComplete(true);
    };

    fetchProfiles();
  }, []);

  useEffect(() => {
    let result = [...profiles];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((profile) =>
        profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.specialties?.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply role filter
    if (filters.role) {
      // Handle "Both" role in filtering
      if (filters.role === "Both") {
        result = result.filter((profile) => profile.role === "Both");
      } else {
        result = result.filter((profile) => 
          profile.role === filters.role || profile.role === "Both"
        );
      }
    }

    // Apply states located filter
    if (filters.statesLocated.length > 0) {
      result = result.filter((profile) =>
        profile.location && filters.statesLocated.includes(profile.location)
      );
    }

    // Apply states licensed filter
    if (filters.statesLicensed.length > 0) {
      result = result.filter((profile) =>
        profile.licenses?.some(license => 
          filters.statesLicensed.includes(license)
        )
      );
    }

    setFilteredProfiles(result);
  }, [searchTerm, filters, profiles]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleProfileClick = (profile: Profile) => {
    setSelectedProfile(profile);
  };

  const handleCloseProfile = () => {
    setSelectedProfile(null);
  };

  const handleWriteReview = () => {
    // If user is not logged in, prompt to create account
    if (!currentUser) {
      toast({
        title: "Sign In Required",
        description: "Please sign in or create an account to write a review.",
      });
      return;
    }
    // TODO: Implement review writing functionality
    toast({
      title: "Coming Soon",
      description: "The review feature will be available soon!",
    });
  };

  const handleShare = async () => {
    if (selectedProfile) {
      try {
        await navigator.share({
          title: `${selectedProfile.name} - Insurance Appraiser Profile`,
          text: `Check out ${selectedProfile.name}'s profile on Insurance Appraiser Directory`,
          url: `${window.location.origin}/profile/${selectedProfile.id}`,
        });
      } catch (error) {
        // Fallback for browsers that don't support share API
        toast({
          title: "Profile Link Copied",
          description: "The profile link has been copied to your clipboard.",
        });
      }
    }
  };

  const handleSave = () => {
    // If user is not logged in, prompt to create account
    if (!currentUser) {
      toast({
        title: "Sign In Required",
        description: "Please sign in or create an account to save profiles.",
      });
      return;
    }
    // TODO: Implement save profile functionality
    toast({
      title: "Coming Soon",
      description: "The save profile feature will be available soon!",
    });
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const handleProfileUpdate = async () => {
    // Refresh profiles list
    const { data, error } = await supabase
      .from("profiles")
      .select("*");

    if (error) {
      console.error("Error fetching profiles:", error);
    } else {
      setProfiles(data || []);
      setFilteredProfiles(data || []);
    }

    // Update current user profile
    if (currentUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (profile) {
        setCurrentUser(profile);
      }
    }
  };

  // Only render content when resize is complete
  if (!isResizeComplete) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white text-center">
            Insurance Appraiser Directory
          </h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="ml-4">
              <UserMenu />
            </div>
          </div>
        </div>
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-200px)] rounded-lg border bg-background"
        >
          <ResizablePanel
            defaultSize={25}
            minSize={20}
            maxSize={30}
            className="bg-card"
          >
            <FilterPanel onFilterChange={handleFilterChange} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <div className="p-6 bg-card">
              {loading ? (
                <div className="text-center">Loading profiles...</div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredProfiles.map((profile) => (
                    <div key={profile.id} className="py-4 first:pt-0 last:pb-0">
                      <ProfileCard
                        profile={profile}
                        onClick={handleProfileClick}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {selectedProfile && (
        <ProfileDetails
          profile={selectedProfile}
          isOpen={!!selectedProfile}
          onClose={handleCloseProfile}
          onWriteReview={handleWriteReview}
          onShare={handleShare}
          onSave={handleSave}
        />
      )}

      <Sheet open={isEditing} onOpenChange={handleCloseEdit}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Profile</SheetTitle>
          </SheetHeader>
          {currentUser && (
            <ProfileEdit
              profile={currentUser}
              onClose={handleCloseEdit}
              onUpdate={handleProfileUpdate}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Dashboard;