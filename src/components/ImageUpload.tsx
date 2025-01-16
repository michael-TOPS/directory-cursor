import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  name?: string;
}

export const ImageUpload = ({ value, onChange, name }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(value);
  const { toast } = useToast();

  useEffect(() => {
    setAvatarUrl(value);
  }, [value]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JPG or PNG image file.",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create a unique file name
      const fileExt = file.type === 'image/jpeg' ? 'jpg' : 'png';
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;  // Simplified path

      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true  // Changed to true to allow overwrites
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);  // Detailed error logging
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the local state immediately for UI feedback
      setAvatarUrl(publicUrl);
      
      // Call the onChange prop to update the parent form
      onChange(publicUrl);

      toast({
        title: "Photo uploaded",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? `Error: ${error.message}` : "There was an error uploading your photo. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onChange, toast]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="w-24 h-24">
        <AvatarImage src={avatarUrl} alt="Profile photo" />
        <AvatarFallback className="bg-gray-100">
          {name ? name.slice(0, 2).toUpperCase() : "UP"}
        </AvatarFallback>
      </Avatar>
      <div className="relative">
        <input
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          id="imageUpload"
          onChange={handleUpload}
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="outline"
          className="relative"
          disabled={isUploading}
          onClick={() => document.getElementById('imageUpload')?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Upload Photo (JPG/PNG)
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 