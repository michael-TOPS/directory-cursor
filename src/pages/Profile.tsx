"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { X } from "lucide-react";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  mobile_phone: z.string().optional(),
  business_phone: z.string().optional(),
  location: z.string().optional(),
  licenses: z.array(z.string()).optional().default([]),
  role: z.enum(["Appraiser", "Umpire", "Both", "Neither"]).optional(),
  image_url: z.string().optional(),
  specialties: z.array(z.string()).optional().default([]),
  certifications: z.array(z.string()).optional().default([]),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  company: z.string().optional(),
});

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
      mobile_phone: "",
      business_phone: "",
      location: "",
      licenses: [],
      role: "Appraiser",
      image_url: "",
      specialties: [],
      certifications: [],
      website: "",
      company: "",
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create a new one with default values
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                name: "",
                role: "Appraiser",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ])
            .select()
            .single();

          if (createError) throw createError;
          
          if (newProfile) {
            form.reset({
              name: "",
              bio: "",
              mobile_phone: "",
              business_phone: "",
              location: "",
              licenses: [],
              role: "Appraiser",
              image_url: "",
              specialties: [],
              certifications: [],
              website: "",
              company: "",
            });
          }
        } else if (error) {
          throw error;
        } else if (profile) {
          form.reset({
            name: profile.name || "",
            bio: profile.bio || "",
            mobile_phone: profile.mobile_phone || "",
            business_phone: profile.business_phone || "",
            location: profile.location || "",
            licenses: profile.licenses || [],
            role: profile.role || "Appraiser",
            image_url: profile.image_url || "",
            specialties: profile.specialties || [],
            certifications: profile.certifications || [],
            website: profile.website || "",
            company: profile.company || "",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate, form, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: values.name,
          bio: values.bio,
          mobile_phone: values.mobile_phone,
          business_phone: values.business_phone,
          location: values.location,
          licenses: values.licenses,
          role: values.role,
          image_url: values.image_url,
          specialties: values.specialties,
          certifications: values.certifications,
          website: values.website,
          company: values.company,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error updating profile",
          description: error.message,
        });
        console.error("Error updating profile:", error);
        return;
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      navigate('/');
    } catch (error) {
      console.error("Error in profile update:", error);
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={() => navigate('/')}
          >
            <X className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Edit Your Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Update your profile information and settings.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 rounded-lg shadow">
            <div className="flex justify-center mb-6">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        name={form.getValues("name")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Show On Your Directory Profile)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your experience and expertise..."
                      className="h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-website.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="mobile_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Phone (Kept Private)</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 555-5555" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Phone (Made Public In Directory)</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 555-5555" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State You Are Located In</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State(s) You Are Licensed In</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        const newValues = currentValues.includes(value)
                          ? currentValues.filter((v) => v !== value)
                          : [...currentValues, value];
                        field.onChange(newValues);
                      }}
                      defaultValue={field.value?.[0]}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select states" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {field.value?.map((state) => (
                        <Badge
                          key={state}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            field.onChange(field.value?.filter((s) => s !== state));
                          }}
                        >
                          {state} ×
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Select your role</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="Appraiser" id="appraiser" />
                        <Label htmlFor="appraiser">Appraiser</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="Umpire" id="umpire" />
                        <Label htmlFor="umpire">Umpire</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="Both" id="both" />
                        <Label htmlFor="both">Both</Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="Neither" id="neither" />
                        <Label htmlFor="neither">Neither</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Profile;