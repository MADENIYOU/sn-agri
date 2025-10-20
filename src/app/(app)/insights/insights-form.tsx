"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { summarizeAgriculturalInsights } from "@/ai/flows/agricultural-insights-summary";
import type { AgriculturalInsightsSummaryOutput } from "@/ai/flows/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatText } from "@/lib/utils";
import { Loader2 } from "lucide-react";
// use the legacy build which is available for bundlers and has the expected entry point
//@ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import mammoth from "mammoth";

// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (file.type === "text/plain") {
        const text = await file.text();
        form.setValue("articles", text);
      } else if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let content = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          // @ts-ignore
          content += textContent.items.map((item) => item.str).join(' ');
        }
        form.setValue("articles", content);
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        form.setValue("articles", result.value);
      } else {
        setError("Type de fichier non pris en charge.");
      }
    } catch (e) {
      setError("Erreur lors de la lecture du fichier.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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

              <FormItem>
                <FormLabel>Ou téléchargez un fichier</FormLabel>
                <FormControl>
                  <Input type="file" accept=".txt,.pdf,.docx" onChange={handleFileChange} />
                </FormControl>
              </FormItem>
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
            <p className="text-muted-foreground">{formatText(result.summary)}</p>
          </CardContent>
        </Card>
      )}
      {error && <p className="text-destructive mt-4">{error}</p>}
    </>
  );
}