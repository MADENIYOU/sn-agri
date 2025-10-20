"use client";
import ExploreCarte from "@/components/explore-carte/ExploreCarte";
import CultureDisplay from "@/components/culture-display/CultureDisplay";
import { useState } from "react";

export default function CropsPage() {
  const [category, setCategory] = useState("All");
  
  return (
    <div className="space-y-6">
      <ExploreCarte category={category} setCategory={setCategory} />
      <CultureDisplay category={category} />
    </div>
  );
}