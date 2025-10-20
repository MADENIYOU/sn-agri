"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "./actions";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SENEGAL_REGIONS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { toast } = useToast();
  const [updatingRegion, setUpdatingRegion] = useState(false);
  const [region, setRegion] = useState("");

  useEffect(() => {
    if (user) {
      setRegion(user.region || "");
    }
  }, [user]);

  const getInitials = () => {
    if (!user) return "";
    const name = user.fullName;
    if (name) return name.split(' ').map((n: string) => n[0]).join('');
    return user.email?.substring(0, 2).toUpperCase() || "";
  };

  const handleRegionUpdate = async () => {
    if (!user || !region) {
      toast({ variant: 'destructive', description: "Veuillez sélectionner une région." });
      return;
    }
    setUpdatingRegion(true);
    const { error } = await updateProfile({ region: region });

    if (error) {
      toast({ variant: 'destructive', title: "Erreur", description: "Impossible de mettre à jour la région." });
    } else {
      await refreshUser();
      toast({ title: "Succès", description: "Région mise à jour." });
    }
    setUpdatingRegion(false);
  };

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-1" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <p>Veuillez vous connecter pour voir votre profil.</p>;
  }

  const displayName = user.fullName || user.email;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Votre Profil</h1>
        <p className="text-muted-foreground">
          Consultez et gérez vos informations et votre région.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Informations Personnelles</CardTitle>
          <CardDescription>Mettez à jour votre région ici.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button type="button" variant="outline" disabled={true}>
                      Changer de photo
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fonctionnalité de téléversement désactivée.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Nom complet</Label>
              <p className="text-muted-foreground">{displayName}</p>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <p className="text-muted-foreground">{user.email}</p>
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
                <Button onClick={handleRegionUpdate} disabled={updatingRegion || region === user.region}>
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