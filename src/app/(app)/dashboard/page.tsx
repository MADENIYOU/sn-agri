import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Sprout, Cloud, Users } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, BarChart as RechartsBarChart } from "recharts";
import { FEED_POSTS } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, Moussa!</h1>
        <p className="text-muted-foreground">Here&apos;s a summary of your farm and community activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Weather Forecast" value="28°C, Sunny" icon={<Cloud />} description="Next 24 hours in Dakar" />
        <StatCard title="Active Crops" value="3 Varieties" icon={<Sprout />} description="Millet, Sorghum, Groundnut" />
        <StatCard title="Market Price" value="+2.5% Millet" icon={<BarChart />} description="vs. last week" />
        <StatCard title="New Connections" value="4 Farmers" icon={<Users />} description="in the community feed" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
        <Card>
          <CardHeader>
            <CardTitle>Recent Community Activity</CardTitle>
            <CardDescription>Latest posts from the community feed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {FEED_POSTS.slice(0, 3).map((post) => (
              <div key={post.id} className="flex items-start gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-semibold">{post.author.name}</p>
                  <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                </div>
              </div>
            ))}
             <Button variant="outline" className="w-full" asChild>
                <Link href="/feed">View All Posts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
