import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CROP_DATA } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CropsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Crop Information Database</h1>
        <p className="text-muted-foreground">
          Explore potential crops, best practices, and production conditions.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {CROP_DATA.map((crop) => (
          <Card key={crop.slug} className="overflow-hidden flex flex-col">
            <CardHeader className="p-0">
              <Image
                src={crop.image.src}
                alt={crop.name}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
                data-ai-hint={crop.image.aiHint}
              />
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col">
              <CardTitle className="font-headline text-xl mb-2">{crop.name}</CardTitle>
              <p className="text-muted-foreground text-sm line-clamp-3 flex-grow">{crop.description}</p>
              <Button asChild className="mt-4 w-full">
                <Link href={`/crops/${crop.slug}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
