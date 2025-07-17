
"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cloud, Sprout, Users, Loader2, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductionChart } from "./production-chart";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardData, upsertProductionDetails } from "./actions";
import type { Post, ProductionDetails, ProductionRecord } from "@/lib/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CROP_DATA, SOIL_TYPES } from "@/lib/constants";


const productionFormSchema = z.object({
  crop_name: z.string().min(1, "Le nom de la culture est requis."),
  soil_type: z.string().min(1, "Le type de sol est requis."),
  surface_area: z.coerce.number().min(0.1, "La surface doit être supérieure à 0."),
});

type ProductionFormValues = z.infer<typeof productionFormSchema>;


function ProductionDetailsDialog({ details, onUpdate }: { details: ProductionDetails | null, onUpdate: (newDetails: ProductionDetails) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<ProductionFormValues>({
    resolver: zodResolver(productionFormSchema),
    defaultValues: {
      crop_name: details?.crop_name || "",
      soil_type: details?.soil_type || "",
      surface_area: details?.surface_area || 0,
    },
  });

  useEffect(() => {
    form.reset({
      crop_name: details?.crop_name || "",
      soil_type: details?.soil_type || "",
      surface_area: details?.surface_area || 0,
    });
  }, [details, form]);

  const onSubmit = (values: ProductionFormValues) => {
    startTransition(async () => {
      const { data, error } = await upsertProductionDetails(values);
      if (error) {
        toast({ variant: 'destructive', title: 'Erreur', description: error });
      } else {
        toast({ title: 'Succès', description: 'Informations de production mises à jour.' });
        if(data) onUpdate(data as ProductionDetails);
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-2 right-2">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la Zone de Production</DialogTitle>
          <DialogDescription>Mettez à jour les informations sur votre culture active.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="crop_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Culture Principale</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une culture" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CROP_DATA.map((crop) => (
                            <SelectItem key={crop.slug} value={crop.name}>{crop.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="soil_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de Sol</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type de sol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SOIL_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surface_area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Surface (en hectares)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


function DashboardPageContent({ initialData, onDataRefresh }: { initialData: Awaited<ReturnType<typeof getDashboardData>>, onDataRefresh: () => void }) {
  const { user } = useAuth();
  const displayName = user?.user_metadata.fullName || user?.user_metadata.full_name;
  
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleProductionUpdate = (newDetails: ProductionDetails) => {
    setData(prev => ({...prev, productionDetails: newDetails}));
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Bon retour, {displayName} !</h1>
        <p className="text-muted-foreground">Voici un résumé de votre ferme et de l'activité de la communauté.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prévisions Météo</CardTitle>
            <Cloud className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {data.weatherData ? (
              <>
                <div className="text-2xl font-bold">{data.weatherData.temperature}°C</div>
                <p className="text-xs text-muted-foreground capitalize">{data.weatherData.description} à {user?.user_metadata.region}</p>
              </>
            ) : (
               <p className="text-sm text-muted-foreground pt-2">Météo non disponible. Mettez à jour votre région dans le profil.</p>
            )}
          </CardContent>
        </Card>

        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Zone de Production</CardTitle>
          </CardHeader>
          <CardContent>
            {data.productionDetails ? (
              <>
                <div className="text-2xl font-bold">{data.productionDetails.crop_name}</div>
                <p className="text-xs text-muted-foreground">
                  {data.productionDetails.surface_area} hectares sur sol {data.productionDetails.soil_type}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground pt-2">
                Aucune information. Ajoutez vos détails de production.
              </p>
            )}
          </CardContent>
          <ProductionDetailsDialog details={data.productionDetails} onUpdate={handleProductionUpdate} />
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communauté</CardTitle>
            <Users className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.profilesCount} Agriculteurs</div>
            <p className="text-xs text-muted-foreground">Connectés sur la plateforme.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProductionChart productionRecords={data.productionRecords} onUpdate={onDataRefresh} />
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente de la Communauté</CardTitle>
            <CardDescription>Derniers messages du fil communautaire.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.posts.length > 0 ? (
                data.posts.map((post) => (
                  <div key={post.id} className="flex items-start gap-4">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-semibold">{post.author.name}</p>
                      <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                ))
            ) : (
                <p className="text-sm text-center text-muted-foreground p-4">Aucune activité récente.</p>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/feed">Voir tous les messages</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
     <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[108px]" />
        <Skeleton className="h-[108px]" />
        <Skeleton className="h-[108px]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboardData>> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
        setLoading(true);
        const dashboardData = await getDashboardData();
        setData(dashboardData);
    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  return <DashboardPageContent initialData={data} onDataRefresh={fetchData} />;
}
