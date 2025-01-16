"use client";

import { SearchBar } from "@/components/SearchBar";
import { ProfileCard } from "@/components/ProfileCard";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

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

const Index = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProfiles(data || []);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: "Error",
          description: "Failed to load profiles. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [toast]);

  const handleSearch = async (term: string) => {
    setIsLoading(true);
    try {
      let query = supabase.from('profiles').select('*');

      if (term) {
        query = query.or(
          `name.ilike.%${term}%,` +
          `location.ilike.%${term}%,` +
          `role.ilike.%${term}%,` +
          `specialties.cs.{${term}},` +
          `bio.ilike.%${term}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error searching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to search profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileClick = (profile: Profile) => {
    navigate(`/profile/${profile.id}`);
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
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onClick={handleProfileClick}
              />
            ))}
            {profiles.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No profiles found. Try adjusting your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;