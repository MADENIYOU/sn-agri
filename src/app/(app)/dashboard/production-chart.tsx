"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, BarChart as RechartsBarChart } from "recharts";

const chartData = [
  { month: "January", millet: 186, sorghum: 80 },
  { month: "February", millet: 305, sorghum: 200 },
  { month: "March", millet: 237, sorghum: 120 },
  { month: "April", millet: 73, sorghum: 190 },
  { month: "May", millet: 209, sorghum: 130 },
  { month: "June", millet: 214, sorghum: 140 },
];

const chartConfig = {
  millet: {
    label: "Millet (tons)",
    color: "hsl(var(--primary))",
  },
  sorghum: {
    label: "Sorghum (tons)",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export function ProductionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Overview</CardTitle>
        <CardDescription>Your yield for the last 6 months.</CardDescription>
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
