'use client'

import { Header } from '@/components/layout/Header';
import ExplorerMap from '@/components/explorer/explorer-map';
import ExploreCarte from "@/components/explorer/ExploreCarte";
import CultureDisplay from "@/components/explorer/CultureDisplay";
import { useState } from "react";

export default function ExplorerPage() {
  const [category, setCategory] = useState("All");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold font-headline text-primary mb-4">Explorer</h1>
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold font-headline text-primary mb-4">Carte Interactive</h2>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <ExplorerMap />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold font-headline text-primary mb-4">My country, My Diversity</h2>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <ExploreCarte category={category} setCategory={setCategory} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold font-headline text-primary mb-4">Top cultures près de chez vous</h2>
            <CultureDisplay category={category} />
          </div>
        </div>
      </main>
    </div>
  );
}