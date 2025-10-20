'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cropRecommendationSearch } from "@/ai/flows/crop-recommendation-search";
import type { CropRecommendationSearchOutput } from "@/ai/flows/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SENEGAL_REGIONS, SOIL_TYPES } from "@/lib/constants";
import { formatText } from "@/lib/utils";
import { Loader2, Sprout } from "lucide-react";

const formSchema = z.object({
  region: z.string().min(1, "La région est requise."),
  soilType: z.string().min(1, "Le type de sol est requis."),
  weatherConditions: z.string().min(1, "Les conditions météorologiques sont requises."),
  preferences: z.string().optional(),
});

export function SearchForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropRecommendationSearchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "",
      soilType: "Tout type de sol",
      weatherConditions: "Chaud et ensoleillé avec des pluies occasionnelles",
      preferences: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await cropRecommendationSearch(values);
      setResult(response);
    } catch (e: any) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>Conditions de la Ferme</CardTitle>
            <CardDescription>Fournissez des détails sur votre emplacement et votre environnement.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Région au Sénégal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une région" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SENEGAL_REGIONS.map((region) => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="soilType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de sol</FormLabel>
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
              </div>
              <FormField
                control={form.control}
                name="weatherConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conditions Météorologiques Actuelles</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Chaud et sec, saison des pluies commençant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Préférences (Optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Résistance à la sécheresse, forte demande du marché" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Obtenir des recommandations
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recommandations de l'IA</CardTitle>
            <CardDescription>En fonction de vos informations, voici nos suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Cultures Recommandées</h3>
              <div className="flex flex-wrap gap-2">
                {result.crops.map((crop) => (
                  <div key={crop} className="flex items-center gap-2 bg-accent/50 text-accent-foreground rounded-full px-3 py-1 text-sm">
                    <Sprout className="h-4 w-4" />
                    <span>{crop}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Raisonnement</h3>
              <p className="text-muted-foreground">{formatText(result.reasoning)}</p>
            </div>
          </CardContent>
        </Card>
      )}
      {error && <p className="text-destructive mt-4">{error}</p>}
    </>
  );
}