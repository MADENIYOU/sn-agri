
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import type { ProductionRecord } from "@/lib/types";
import { Bar, CartesianGrid, XAxis, YAxis, BarChart as RechartsBarChart } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { CROP_DATA } from "@/lib/constants";
import { Loader2, PlusCircle } from "lucide-react";
import { addProductionRecord } from "./actions";

const productionRecordSchema = z.object({
    crop_name: z.string().min(1, "Le nom de la culture est requis."),
    year: z.coerce.number().min(2000, "L'année doit être valide."),
    month: z.coerce.number().min(1).max(12, "Le mois doit être valide."),
    quantity_tonnes: z.coerce.number().min(0, "La quantité ne peut pas être négative."),
});

type ProductionRecordValues = z.infer<typeof productionRecordSchema>;

const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);


function AddProductionRecordDialog({ onUpdate }: { onUpdate: (record: ProductionRecord) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<ProductionRecordValues>({
        resolver: zodResolver(productionRecordSchema),
        defaultValues: {
            year: currentYear,
            month: new Date().getMonth() + 1,
            quantity_tonnes: 0,
        },
    });

    const onSubmit = (values: ProductionRecordValues) => {
        startTransition(async () => {
            const { data, error } = await addProductionRecord(values);
            if (error) {
                if (error === 'User not authenticated') {
                    router.replace('/login');
                } else {
                    toast({ variant: 'destructive', title: 'Erreur', description: error });
                }
            } else if (data) {
                toast({ title: 'Succès', description: 'Enregistrement de production ajouté.' });
                onUpdate(data);
                setIsOpen(false);
                form.reset();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nouveau
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajouter un Enregistrement de Production</DialogTitle>
                    <DialogDescription>Entrez les détails de votre récolte pour un mois donné.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="crop_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Culture</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionnez une culture" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {CROP_DATA.map((crop) => (<SelectItem key={crop.slug} value={crop.name}>{crop.name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Année</FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {years.map(year => (<SelectItem key={year} value={String(year)}>{year}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="month"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mois</FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {monthNames.map((name, index) => (<SelectItem key={index} value={String(index + 1)}>{name}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name="quantity_tonnes"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Quantité (en tonnes)</FormLabel>
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

export function ProductionChart({ initialRecords, onRecordAdd }: { initialRecords: ProductionRecord[], onRecordAdd: (record: ProductionRecord) => void }) {
  const [records, setRecords] = useState(initialRecords);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null); // New state for filter

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  const handleRecordAdd = (newRecord: ProductionRecord) => {
    setRecords(prev => [...prev, newRecord].sort((a, b) => a.year - b.year || a.month - b.month));
    onRecordAdd(newRecord);
  };

  // Sanitize crop names to be used as safe keys for data and rendering.
  const sanitizeKey = (name: string | null | undefined) => {
    if (name === null || name === undefined) {
      return '';
    }
    return name.replace(/\s+/g, '_');
  };

  // Get all unique crop names from ALL production records for filter options and full config
  const allUniqueCropNames = [...new Set(records.map(r => r.cropName))];

  const cropConfigs = allUniqueCropNames.map((name, index) => ({
    name: name,
    key: sanitizeKey(name),
    color: `hsl(var(--chart-${index + 1}))`,
  }));

  // Filter records based on selectedCrop
  const filteredRecords = selectedCrop
    ? records.filter(record => record.cropName === selectedCrop)
    : records;

  // Group data by month and aggregate crops using the sanitized key
  const aggregatedData = filteredRecords.reduce((acc, record) => {
    const monthKey = `${monthNames[record.month - 1]} '${String(record.year).slice(-2)}`;
    let monthEntry = acc.find(item => item.month === monthKey);
    if (!monthEntry) {
      monthEntry = { month: monthKey };
      acc.push(monthEntry);
    }
    const sanitizedCropKey = sanitizeKey(record.cropName);
    monthEntry[sanitizedCropKey] = (monthEntry[sanitizedCropKey] || 0) + record.quantityTonnes;
    return acc;
  }, [] as any[]);
  
  const dynamicChartConfig = Object.fromEntries(
    cropConfigs.map(config => [config.key, { label: config.name, color: config.color }])
  ) as ChartConfig;

  // The actual crop keys present in the aggregated data (from filtered records)
  const chartCropKeys = [...new Set(filteredRecords.map(r => sanitizeKey(r.cropName)))];

  return (
    <Card className="relative">
      <CardHeader className="flex-col items-start"> {/* Changed to flex-col for title/desc */}
        <div className="flex w-full items-center justify-between"> {/* New div for title and actions */}
          <CardTitle>Aperçu de la Production</CardTitle>
          <div className="flex items-center gap-2"> {/* Actions group */}
            <Select value={selectedCrop || "all"} onValueChange={(value) => setSelectedCrop(value === "all" ? null : value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par culture" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les cultures</SelectItem>
                {allUniqueCropNames.map((cropName) => (
                  <SelectItem key={cropName} value={cropName}>{cropName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AddProductionRecordDialog onUpdate={handleRecordAdd} /> {/* This is the "Nouveau" button" */}
          </div>
        </div>
        <CardDescription>Votre rendement mensuel par culture.</CardDescription>
      </CardHeader>
      <CardContent>
        {aggregatedData.length > 0 ? (
          <ChartContainer config={dynamicChartConfig} className="h-64 w-full">
            <RechartsBarChart accessibilityLayer data={aggregatedData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                stroke="#888888"
                fontSize={12}
              />
              <YAxis
                type="number"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} t`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              {chartCropKeys.map(cropKey => (
                 <Bar key={cropKey} dataKey={cropKey} fill={`var(--color-${cropKey})`} radius={4} stackId="a" />
              ))}
            </RechartsBarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-64 w-full items-center justify-center">
            <p className="text-muted-foreground text-center">
              Aucune donnée de production à afficher.
              <br />
              Cliquez sur 'Nouveau' pour ajouter votre premier enregistrement.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
