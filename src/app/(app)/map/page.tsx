
import SenegalMap from "./senegal-map";

export default function MapPage() {
  return (
    <div className="w-full flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Carte Agricole Interactive</h1>
        <p className="text-muted-foreground">
          Explorez les données régionales à travers le Sénégal en cliquant sur la carte.
        </p>
      </div>
      <div className="rounded-lg">
        <SenegalMap />
      </div>
    </div>
  );
}
