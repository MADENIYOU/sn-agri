
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import type { ProductionRecord } from "@/lib/types";
import { Bar, CartesianGrid, XAxis, YAxis, BarChart as RechartsBarChart } from "recharts";

const chartConfig = {
  quantity_tonnes: {
    label: "Tonnes",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export function ProductionChart({ productionRecords }: { productionRecords: ProductionRecord[] }) {
  const chartData = productionRecords.map(record => ({
    month: `${monthNames[record.month - 1]} ${record.year}`,
    quantity_tonnes: record.quantity_tonnes,
    crop_name: record.crop_name,
  }));

  // Create a dynamic chart config for colors based on crop names
  const dynamicChartConfig: ChartConfig = productionRecords.reduce((acc, record) => {
    if (!acc[record.crop_name]) {
      const colorIndex = Object.keys(acc).length % 5; // Cycle through 5 chart colors
      acc[record.crop_name] = {
        label: `${record.crop_name} (tonnes)`,
        color: `hsl(var(--chart-${colorIndex + 1}))`,
      };
    }
    return acc;
  }, {} as ChartConfig);

  // Group data by month and aggregate crops
  const aggregatedData = productionRecords.reduce((acc, record) => {
    const monthKey = `${monthNames[record.month - 1]} '${String(record.year).slice(-2)}`;
    let monthEntry = acc.find(item => item.month === monthKey);
    if (!monthEntry) {
      monthEntry = { month: monthKey };
      acc.push(monthEntry);
    }
    monthEntry[record.crop_name] = record.quantity_tonnes;
    return acc;
  }, [] as any[]);
  
  const cropKeys = Object.keys(dynamicChartConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aperçu de la Production</CardTitle>
        <CardDescription>Votre rendement mensuel par culture.</CardDescription>
      </CardHeader>
      <CardContent>
        {aggregatedData.length > 0 ? (
          <ChartContainer config={dynamicChartConfig} className="h-64 w-full">
            <RechartsBarChart accessibilityLayer data={aggregatedData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                stroke="#888888"
                fontSize={12}
              />
              <YAxis
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
              {cropKeys.map(cropKey => (
                 <Bar key={cropKey} dataKey={cropKey} fill={`var(--color-${cropKey})`} radius={4} />
              ))}
            </RechartsBarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-64 w-full items-center justify-center">
            <p className="text-muted-foreground text-center">
              Aucune donnée de production à afficher.
              <br />
              Commencez par ajouter vos enregistrements de production.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
