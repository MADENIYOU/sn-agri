import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Sprout, Cloud, Users } from "lucide-react";
import { FEED_POSTS } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductionChart } from "./production-chart";

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
        <ProductionChart />
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
