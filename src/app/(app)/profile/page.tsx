
"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { updateUserAvatar } from "./actions";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SENEGAL_REGIONS } from "@/lib/constants";


export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [updatingRegion, setUpdatingRegion] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for optimistic UI updates
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata.avatar_url || undefined);
  const [region, setRegion] = useState(user?.user_metadata.region || "");
  
  const getInitials = () => {
    if (!user) return "??";
    const name = user.user_metadata.fullName || user.user_metadata.full_name;
    if (name) return name.split(' ').map((n:string) => n[0]).join('');
    return user.email?.substring(0, 2).toUpperCase() || "??";
  };
  
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const supabase = createClient();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${user.id}/${Date.now()}_${sanitizedFileName}`;
    
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

      const { error: updateError } = await updateUserAvatar(user.id, publicUrl);

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

  const handleRegionUpdate = async () => {
    if (!user || !region) {
      toast({variant: 'destructive', description: "Veuillez sélectionner une région."});
      return;
    }
    setUpdatingRegion(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { region: region }
    })
    
    if (error) {
      toast({variant: 'destructive', title: "Erreur", description: "Impossible de mettre à jour la région."})
    } else {
      await refreshUser();
      toast({title: "Succès", description: "Région mise à jour."})
    }
    setUpdatingRegion(false);
  }
  
  const displayName = user?.user_metadata.fullName || user?.user_metadata.full_name || user?.email;
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Votre Profil</h1>
        <p className="text-muted-foreground">
          Consultez et gérez vos informations et votre photo de profil.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informations Personnelles</CardTitle>
          <CardDescription>Mettez à jour votre photo et votre région ici.</CardDescription>
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

            <div className="space-y-4">
              <div className="space-y-1">
                  <Label>Nom complet</Label>
                  <p className="text-muted-foreground">{displayName}</p>
              </div>
              <div className="space-y-1">
                  <Label>Email</Label>
                  <p className="text-muted-foreground">{user?.email}</p>
              </div>
               <div className="space-y-1">
                  <Label>Rôle</Label>
                  <p className="text-muted-foreground">Agriculteur</p>
              </div>
              <div className="space-y-2">
                  <Label>Région</Label>
                  <div className="flex items-center gap-2">
                     <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre région" />
                      </SelectTrigger>
                      <SelectContent>
                        {SENEGAL_REGIONS.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleRegionUpdate} disabled={updatingRegion || region === user?.user_metadata.region}>
                       {updatingRegion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Mettre à jour
                    </Button>
                  </div>
                   <p className="text-xs text-muted-foreground">Votre région est utilisée pour personnaliser les prévisions météo.</p>
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
