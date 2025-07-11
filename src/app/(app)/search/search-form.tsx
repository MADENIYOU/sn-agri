"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  cropRecommendationSearch,
  type CropRecommendationSearchOutput,
} from "@/ai/flows/crop-recommendation-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SENEGAL_REGIONS, SOIL_TYPES } from "@/lib/constants";
import { Loader2, Sprout } from "lucide-react";

const formSchema = z.object({
  region: z.string().min(1, "Region is required."),
  soilType: z.string().min(1, "Soil type is required."),
  weatherConditions: z.string().min(1, "Weather conditions are required."),
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
      soilType: "",
      weatherConditions: "Hot and sunny with occasional rain",
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
      setError("An error occurred. Please try again.");
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>Farm Conditions</CardTitle>
            <CardDescription>Provide details about your location and environment.</CardDescription>
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
                      <FormLabel>Region in Senegal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a region" />
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
                      <FormLabel>Soil Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a soil type" />
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
                    <FormLabel>Current Weather Conditions</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Hot and dry, rainy season starting" {...field} />
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
                    <FormLabel>Preferences (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Drought resistance, high market demand" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Recommendations
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>Based on your input, here are our suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Recommended Crops</h3>
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
              <h3 className="font-semibold text-lg mb-2">Reasoning</h3>
              <p className="text-muted-foreground whitespace-pre-line">{result.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
      {error && <p className="text-destructive mt-4">{error}</p>}
    </>
  );
}
