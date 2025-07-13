
"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, updateUserAvatar } from "./actions";
import { useRouter } from "next/navigation";


export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for optimistic UI updates
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata.avatar_url || undefined);
  
  const getInitials = () => {
    if (!user) return "??";
    const name = user.user_metadata.fullName || user.user_metadata.full_name;
    if (name) return name.split(' ').map((n:string) => n[0]).join('');
    return user.email?.substring(0, 2).toUpperCase() || "??";
  };
  
  const handleFormSubmit = async (formData: FormData) => {
    if (!user) return;
    setLoading(true);

    const { success, error } = await updateProfile(user.id, formData);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error });
    } else {
      toast({ title: 'Succès', description: 'Profil mis à jour avec succès.' });
      await refreshUser(); // Refresh user data in auth context
      router.refresh();
    }
    setLoading(false);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const supabase = createClient();
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    
    setUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrl) throw new Error('Could not get public URL for avatar.');

      const { success, error: updateError } = await updateUserAvatar(user.id, publicUrl);

      if (updateError) throw new Error(updateError);
      
      setAvatarUrl(publicUrl); // Optimistic UI update
      await refreshUser(); // Refresh auth context

      toast({ title: 'Succès', description: 'Avatar mis à jour.' });

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message || 'Impossible de mettre à jour l\'avatar.' });
    } finally {
      setUploading(false);
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Votre Profil</h1>
        <p className="text-muted-foreground">
          Consultez et gérez les informations de votre compte.
        </p>
      </div>
      <form action={handleFormSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>Mettez à jour votre photo et vos informations personnelles ici.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />
                  <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()} disabled={uploading}>
                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Changer de photo
                  </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input name="fullName" id="fullName" defaultValue={user?.user_metadata.fullName || user?.user_metadata.full_name || ""} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="role">Rôle</Label>
                      <Input id="role" defaultValue="Agriculteur" disabled />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="region">Région</Label>
                      <Input name="region" id="region" defaultValue={user?.user_metadata.region || "Dakar"} />
                  </div>
              </div>
              <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer les modifications
                  </Button>
              </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
