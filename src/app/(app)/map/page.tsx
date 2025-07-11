import SenegalMap from "./senegal-map";

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-10rem)] w-full flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold font-headline">Interactive Agricultural Map</h1>
        <p className="text-muted-foreground">
          Explore farmer locations and regional data across Senegal.
        </p>
      </div>
      <div className="flex-grow rounded-lg overflow-hidden border">
        <SenegalMap />
      </div>
    </div>
  );
}
