import { InsightsForm } from "./insights-form";
import { BarChart2 } from "lucide-react";

export default function InsightsPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                    <BarChart2 className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold font-headline">AI Agricultural Insights</h1>
                <p className="text-muted-foreground mt-2">
                    Paste agricultural news or reports to get a concise summary of trends and challenges.
                </p>
            </div>
            <InsightsForm />
        </div>
    );
}
