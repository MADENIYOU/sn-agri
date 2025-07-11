import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/icons';
import { Map, BrainCircuit, Sprout, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline">SenAgriConnect</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary mb-4">
              Empowering Senegalese Agriculture
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              A collaborative platform providing farmers and stakeholders with data, insights, and connections to foster growth and sustainability.
            </p>
            <Button size="lg" asChild>
              <Link href="/dashboard">Enter the Platform</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-20 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center font-headline mb-12">Our Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Map className="h-10 w-10 text-primary" />}
                title="Interactive Map"
                description="Visualize agricultural regions, weather patterns, and farmer networks across Senegal."
              />
              <FeatureCard
                icon={<BrainCircuit className="h-10 w-10 text-primary" />}
                title="AI-Powered Search"
                description="Get instant, intelligent recommendations for crops and practices tailored to your specific conditions."
              />
              <FeatureCard
                icon={<Sprout className="h-10 w-10 text-primary" />}
                title="Crop Database"
                description="Access detailed information on a wide variety of crops, from planting to harvest."
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 text-primary" />}
                title="Community Feed"
                description="Connect with fellow producers, buyers, and experts. Share knowledge and opportunities."
              />
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="Farmers in Senegal"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                  data-ai-hint="senegal agriculture"
                />
              </div>
              <div>
                <h3 className="text-3xl font-bold font-headline mb-4">From Data to Decisions</h3>
                <p className="text-muted-foreground mb-4">
                  SenAgriConnect transforms complex agricultural data into actionable insights. Our dashboards provide a clear view of your performance and market trends, helping you make informed decisions that boost productivity and profitability.
                </p>
                <Button variant="link" className="p-0" asChild>
                  <Link href="/signup">Join the revolution &rarr;</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SenAgriConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
          {icon}
        </div>
        <CardTitle className="font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
