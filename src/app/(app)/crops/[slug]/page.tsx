import { CROP_DATA } from "@/lib/constants";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Wind, Droplets } from "lucide-react";

export default function CropDetailPage({ params }: { params: { slug: string } }) {
  const crop = CROP_DATA.find((c) => c.slug === params.slug);

  if (!crop) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-headline mb-2">{crop.name}</h1>
        <p className="text-lg text-muted-foreground">{crop.description}</p>
      </div>

      <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-lg">
        <Image
          src={crop.image.src}
          alt={crop.name}
          layout="fill"
          objectFit="cover"
          data-ai-hint={crop.image.aiHint}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="text-primary" /> Meilleures Pratiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">{crop.bestPractices}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wind className="text-primary" /> Conditions de Production
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground whitespace-pre-line">{crop.productionConditions}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return CROP_DATA.map((crop) => ({
    slug: crop.slug,
  }));
}
