"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  summarizeAgriculturalInsights,
  type AgriculturalInsightsSummaryOutput,
} from "@/ai/flows/agricultural-insights-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  articles: z.string().min(50, "Veuillez fournir au moins 50 caractères de texte à résumer."),
});

export function InsightsForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgriculturalInsightsSummaryOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      articles: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await summarizeAgriculturalInsights({ articles: [values.articles] });
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
            <CardTitle>Articles & Rapports</CardTitle>
            <CardDescription>Collez le contenu que vous souhaitez résumer ci-dessous.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="articles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu à résumer</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Collez ici des articles de presse, des rapports de marché ou d'autres textes agricoles..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Générer un résumé
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Résumé Généré par l'IA</CardTitle>
            <CardDescription>Tendances et défis clés du texte fourni.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">{result.summary}</p>
          </CardContent>
        </Card>
      )}
      {error && <p className="text-destructive mt-4">{error}</p>}
    </>
  );
}
