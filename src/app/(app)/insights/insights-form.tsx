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
  articles: z.string().min(50, "Please provide at least 50 characters of text to summarize."),
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
      setError("An error occurred. Please try again.");
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <>
      <Card>
         <CardHeader>
            <CardTitle>Articles & Reports</CardTitle>
            <CardDescription>Paste the content you want to summarize below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="articles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content to Summarize</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste news articles, market reports, or other agricultural texts here..."
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
                Generate Summary
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>AI-Generated Summary</CardTitle>
            <CardDescription>Key trends and challenges from the provided text.</CardDescription>
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
