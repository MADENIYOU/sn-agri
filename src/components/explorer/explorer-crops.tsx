"use client";
import ExploreCarte from "@/components/explorer/ExploreCarte";
import CultureDisplay from "@/components/explorer/CultureDisplay";
import { useState } from "react";

export default function ExplorerCrops() {
  const [category, setCategory] = useState("All");
  
  return (
    <div className="space-y-6">
      <ExploreCarte category={category} setCategory={setCategory} />
      <CultureDisplay category={category} />
    </div>
  );
}
