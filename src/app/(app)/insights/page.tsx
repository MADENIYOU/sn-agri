import { InsightsForm } from "./insights-form";
import { BarChart2 } from "lucide-react";

export default function InsightsPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                    <BarChart2 className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold font-headline">Aperçus Agricoles par l'IA</h1>
                <p className="text-muted-foreground mt-2">
                    Collez des actualités ou des rapports agricoles pour obtenir un résumé concis des tendances et des défis.
                </p>
            </div>
            <InsightsForm />
        </div>
    );
}
