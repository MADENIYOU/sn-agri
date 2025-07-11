import { SearchForm } from "./search-form";
import { BrainCircuit } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="p-3 bg-primary/10 rounded-full mb-4">
          <BrainCircuit className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-headline">AI Crop Recommendation</h1>
        <p className="text-muted-foreground mt-2">
          Fill in your farm&apos;s details to get personalized crop recommendations from our AI advisor.
        </p>
      </div>
      <SearchForm />
    </div>
  );
}
