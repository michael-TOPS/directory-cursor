import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileEditProps {
  profile: Profile;
  onClose: () => void;
  onUpdate: () => void;
}

export const ProfileEdit = ({ profile, onClose, onUpdate }: ProfileEditProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [location, setLocation] = useState(profile.location || "");
  const [role, setRole] = useState(profile.role || "");
  const [specialties, setSpecialties] = useState(profile.specialties?.join(", ") || "");
  const [certifications, setCertifications] = useState(profile.certifications?.join(", ") || "");
  const [licenses, setLicenses] = useState(profile.licenses?.join(", ") || "");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let image_url = profile.image_url;

      // Upload new image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${profile.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          bio,
          location,
          role,
          image_url,
          specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
          certifications: certifications.split(',').map(s => s.trim()).filter(Boolean),
          licenses: licenses.split(',').map(s => s.trim()).filter(Boolean),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="avatar">Profile Picture</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Input
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="specialties">Specialties (comma-separated)</Label>
          <Input
            id="specialties"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="certifications">Certifications (comma-separated)</Label>
          <Input
            id="certifications"
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="licenses">Licenses (comma-separated)</Label>
          <Input
            id="licenses"
            value={licenses}
            onChange={(e) => setLicenses(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};