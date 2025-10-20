import { cultureDisplay_list } from "@/lib/culture-data";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Wind, Droplets, MapPin, Calendar, Sun } from "lucide-react";

export default function CropDetailPage({ params }: { params: { slug: string } }) {
  const crop = cultureDisplay_list.find((c) => c.slug === params.slug);

  if (!crop) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      <div>
        <h1 className="text-4xl font-bold font-headline mb-2">{crop.nom_culture}</h1>
        <p className="text-lg text-muted-foreground">{crop.description}</p>
      </div>

      <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-lg">
        <Image
          src={crop.image}
          alt={crop.nom_culture}
          layout="fill"
          objectFit="cover"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="text-primary" /> Conseils de culture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">{crop.conseil}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wind className="text-primary" /> Conditions de Production
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <MapPin className="text-primary"/>
                <p><span className="font-semibold">Région:</span> {crop.region}</p>
            </div>
            <div className="flex items-center gap-4">
                <Calendar className="text-primary"/>
                <p><span className="font-semibold">Saison:</span> {crop.saison}</p>
            </div>
            <div className="flex items-center gap-4">
                <Droplets className="text-primary"/>
                <p><span className="font-semibold">Besoin en eau:</span> {crop.besoin_eau}</p>
            </div>
            <div className="flex items-center gap-4">
                <Sun className="text-primary"/>
                <p><span className="font-semibold">Production:</span> {crop.production} tonnes/ha/an</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return cultureDisplay_list.map((crop) => ({
    slug: crop.slug,
  }));
}