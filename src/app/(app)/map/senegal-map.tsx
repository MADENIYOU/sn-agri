
"use client";
import { useState } from "react";
import { Sprout } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Farmer = {
    id: number;
    name: string;
    position: { x: number; y: number };
    crop: string;
};

const farmers: Farmer[] = [
  { id: 1, name: "Moussa Faye", position: { x: 15, y: 40 }, crop: "Millet" },
  { id: 2, name: "Awa Diallo", position: { x: 60, y: 45 }, crop: "Groundnut" },
  { id: 3, name: "Ousmane Sow", position: { x: 75, y: 35 }, crop: "Sorghum" },
  { id: 4, name: "Fatou Ndiaye", position: { x: 70, y: 85 }, crop: "Cassava" },
];

export default function SenegalMap() {

  return (
    <div className="relative w-full h-full bg-muted flex items-center justify-center p-4">
      <svg
        viewBox="0 0 800 900"
        className="max-w-full max-h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="fill-card stroke-border stroke-2 group">
          <path d="M 120,50 L 150,20 L 250,30 L 300,80 L 280,120 L 160,100 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Saint-Louis" />
          <path d="M 300,80 L 450,90 L 480,150 L 320,160 L 280,120 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Louga" />
          <path d="M 480,150 L 600,160 L 620,250 L 500,260 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Matam" />
          <path d="M 100,110 L 160,100 L 280,120 L 250,200 L 110,180 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Thiès" />
          <path d="M 80,190 L 110,180 L 250,200 L 240,250 L 90,230 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Dakar" />
          <path d="M 250,200 L 320,160 L 480,150 L 500,260 L 400,300 L 260,260 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Diourbel" />
          <path d="M 240,250 L 400,300 L 380,380 L 220,350 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Fatick" />
          <path d="M 400,300 L 500,260 L 620,250 L 700,350 L 550,400 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Kaolack" />
          <path d="M 550,400 L 700,350 L 750,500 L 600,520 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Kaffrine" />
          <path d="M 600,520 L 750,500 L 780,650 L 580,700 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Tambacounda" />
          <path d="M 580,700 L 780,650 L 750,800 L 550,820 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Kédougou" />
          <path d="M 220,350 L 380,380 L 450,550 L 300,580 L 200,500 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Kolda" />
          <path d="M 200,500 L 300,580 L 250,680 L 150,600 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Sédhiou" />
          <path d="M 150,600 L 250,680 L 200,750 L 100,700 Z" className="transition-all duration-200 hover:fill-primary/20" data-name="Ziguinchor" />
          
          <text x="200" y="80" className="fill-current text-sm font-sans" >Saint-Louis</text>
          <text x="370" y="130" className="fill-current text-sm font-sans" >Louga</text>
          <text x="550" y="220" className="fill-current text-sm font-sans" >Matam</text>
          <text x="170" y="150" className="fill-current text-sm font-sans" >Thiès</text>
          <text x="150" y="220" className="fill-current text-sm font-sans" >Dakar</text>
          <text x="360" y="230" className="fill-current text-sm font-sans" >Diourbel</text>
          <text x="300" y="320" className="fill-current text-sm font-sans" >Fatick</text>
          <text x="520" y="350" className="fill-current text-sm font-sans" >Kaolack</text>
          <text x="650" y="480" className="fill-current text-sm font-sans" >Kaffrine</text>
          <text x="650" y="600" className="fill-current text-sm font-sans" >Tambacounda</text>
          <text x="650" y="750" className="fill-current text-sm font-sans" >Kédougou</text>
          <text x="300" y="500" className="fill-current text-sm font-sans" >Kolda</text>
          <text x="200" y="620" className="fill-current text-sm font-sans" >Sédhiou</text>
          <text x="140" y="700" className="fill-current text-sm font-sans" >Ziguinchor</text>
        </g>
        
        {farmers.map(farmer => (
          <Popover key={farmer.id}>
            <PopoverTrigger asChild>
                <g transform={`translate(${(farmer.position.x / 100) * 800}, ${(farmer.position.y / 100) * 900})`} className="cursor-pointer">
                    <circle cx="0" cy="0" r="12" className="fill-primary/20" />
                    <circle cx="0" cy="0" r="8" className="fill-primary" />
                    <Sprout className="text-primary-foreground w-4 h-4 -translate-x-2 -translate-y-2" />
                </g>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <Card className="border-0 shadow-none">
                    <CardHeader className="p-2">
                        <CardTitle>{farmer.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0">
                        <p className="text-sm"><strong>Primary Crop:</strong> {farmer.crop}</p>
                    </CardContent>
                </Card>
            </PopoverContent>
          </Popover>
        ))}
      </svg>
    </div>
  );
}
