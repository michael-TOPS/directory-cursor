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
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        console.error("Error fetching profiles:", error);
      } else {
        setProfiles(data || []);
        setFilteredProfiles(data || []);
      }
      setLoading(false);
      // Set resize complete after initial load
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
      result = result.filter((profile) => profile.role === filters.role);
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

  const handleMessageClick = () => {
    toast({
      title: "Coming Soon",
      description: "The messaging feature will be available soon!",
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex justify-between items-center">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
          <div className="ml-4">
            <UserMenu />
          </div>
        </div>
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-200px)] rounded-lg border"
        >
          <ResizablePanel
            defaultSize={25}
            minSize={20}
            maxSize={30}
            className="bg-white"
          >
            <FilterPanel onFilterChange={handleFilterChange} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <div className="p-6 bg-white">
              {loading ? (
                <div className="text-center">Loading profiles...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredProfiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      onClick={handleProfileClick}
                    />
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
          onMessageClick={handleMessageClick}
          onEditClick={currentUser?.id === selectedProfile.id ? handleEditProfile : undefined}
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