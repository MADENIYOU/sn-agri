import SenegalMap from "./senegal-map";

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-10rem)] w-full flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold font-headline">Carte Agricole Interactive</h1>
        <p className="text-muted-foreground">
          Explorez les emplacements des agriculteurs et les données régionales à travers le Sénégal.
        </p>
      </div>
      <div className="flex-grow rounded-lg overflow-hidden border">
        <SenegalMap />
      </div>
    </div>
  );
}
