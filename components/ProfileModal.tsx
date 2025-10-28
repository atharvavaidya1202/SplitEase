import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { COUNTRIES } from "../utils/currencies";
import { apiCall } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";
import { Loader2, Camera, User } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  country: string;
  currency: string;
  photoUrl?: string;
}

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  accessToken: string;
  onProfileUpdated: (user: User) => void;
}

export function ProfileModal({ open, onOpenChange, user, accessToken, onProfileUpdated }: ProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find((c) => c.name === user.country)?.code || "US"
  );
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || "");
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-9367668c/upload-photo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }

      const data = await response.json();
      setPhotoUrl(data.photoUrl);
      toast.success("Photo uploaded successfully!");
    } catch (error: any) {
      console.error("Photo upload error:", error);
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const country = COUNTRIES.find((c) => c.code === selectedCountry);
      if (!country) {
        toast.error("Please select a country");
        setLoading(false);
        return;
      }

      const updatedUser = await apiCall(
        "/user",
        {
          method: "PUT",
          body: JSON.stringify({
            name,
            country: country.name,
            currency: country.currency,
            photoUrl,
          }),
        },
        accessToken
      );

      toast.success("Profile updated successfully!");
      onProfileUpdated({
        ...user,
        name,
        country: country.name,
        currency: country.currency,
        photoUrl,
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const selectedCountryData = COUNTRIES.find((c) => c.code === selectedCountry);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={photoUrl} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl">
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {uploadingPhoto ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Click the camera icon to upload a photo
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-border bg-input-background"
              required
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              className="border-border bg-muted"
              disabled
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          {/* Country & Currency */}
          <div className="space-y-2">
            <Label htmlFor="country">Country & Currency</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="border-border bg-input-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span>{country.name}</span>
                      <span className="text-muted-foreground">
                        ({country.currency})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCountryData && (
              <p className="text-sm text-muted-foreground">
                Your default currency will be {selectedCountryData.currency} (
                {selectedCountryData.symbol})
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
              disabled={loading || uploadingPhoto}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
