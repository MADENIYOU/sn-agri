import MapClient from "./map-client";

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-10rem)] w-full flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold font-headline">Interactive Agricultural Map</h1>
        <p className="text-muted-foreground">
          Explore farmer locations, regional data, and weather across Senegal.
        </p>
      </div>
      <div className="flex-grow rounded-lg overflow-hidden border">
        <MapClient />
      </div>
    </div>
  );
}
