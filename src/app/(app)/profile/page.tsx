
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Pencil } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  // Helper to get initials from email
  const getInitials = (email: string | null | undefined) => {
    if (!email) return "??";
    return email.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">Votre Profil</h1>
        <p className="text-muted-foreground">
          Consultez et gérez les informations de votre compte.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Informations Personnelles</CardTitle>
                <CardDescription>Mettez à jour votre photo et vos informations personnelles ici.</CardDescription>
            </div>
            <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Modifier le profil</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                </Avatar>
                <Button variant="outline">Changer de photo</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" defaultValue={user?.displayName || "Moussa Faye"} />
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
                    <Input id="region" defaultValue="Dakar" />
                </div>
            </div>
            <div className="flex justify-end">
                <Button>Enregistrer les modifications</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
