
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Sprout, Cloud, Users } from "lucide-react";
import { FEED_POSTS } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductionChart } from "./production-chart";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.user_metadata.fullName || user?.user_metadata.full_name;

  return (
    <div className="space-y-6">
      <div>
        {displayName ? (
          <h1 className="text-3xl font-bold font-headline">Bon retour, {displayName} !</h1>
        ) : (
          <Skeleton className="h-9 w-1/2" />
        )}
        <p className="text-muted-foreground">Voici un résumé de votre ferme et de l'activité de la communauté.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Prévisions Météo" value="28°C, Ensoleillé" icon={<Cloud />} description="Prochaines 24h à Dakar" />
        <StatCard title="Cultures Actives" value="3 Variétés" icon={<Sprout />} description="Mil, Sorgho, Arachide" />
        <StatCard title="Prix du Marché" value="+2.5% Mil" icon={<BarChart />} description="vs. la semaine dernière" />
        <StatCard title="Nouvelles Connexions" value="4 Agriculteurs" icon={<Users />} description="dans le fil communautaire" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProductionChart />
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente de la Communauté</CardTitle>
            <CardDescription>Derniers messages du fil communautaire.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {FEED_POSTS.slice(0, 3).map((post) => (
              <div key={post.id} className="flex items-start gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-semibold">{post.author.name}</p>
                  <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                </div>
              </div>
            ))}
             <Button variant="outline" className="w-full" asChild>
                <Link href="/feed">Voir tous les messages</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
