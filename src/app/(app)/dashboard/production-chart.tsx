"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, BarChart as RechartsBarChart } from "recharts";

const chartData = [
  { month: "Janvier", millet: 186, sorghum: 80 },
  { month: "Février", millet: 305, sorghum: 200 },
  { month: "Mars", millet: 237, sorghum: 120 },
  { month: "Avril", millet: 73, sorghum: 190 },
  { month: "Mai", millet: 209, sorghum: 130 },
  { month: "Juin", millet: 214, sorghum: 140 },
];

const chartConfig = {
  millet: {
    label: "Mil (tonnes)",
    color: "hsl(var(--primary))",
  },
  sorghum: {
    label: "Sorgho (tonnes)",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export function ProductionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aperçu de la Production</CardTitle>
        <CardDescription>Votre rendement pour les 6 derniers mois.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <RechartsBarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="millet" fill="var(--color-millet)" radius={4} />
            <Bar dataKey="sorghum" fill="var(--color-sorghum)" radius={4} />
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
