
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
  { id: 1, name: "Moussa Faye", position: { x: 20.3, y: 38.4 }, crop: "Millet" }, // Dakar
  { id: 2, name: "Awa Diallo", position: { x: 50, y: 55 }, crop: "Groundnut" },   // Kaolack
  { id: 3, name: "Ousmane Sow", position: { x: 34, y: 22 }, crop: "Sorghum" },   // Thies
  { id: 4, name: "Fatou Ndiaye", position: { x: 45, y: 80 }, crop: "Cassava" },  // Ziguinchor
];

const regions = [
    { name: "Dakar", path: "M205 380 L198 388 L198 398 L206 404 L212 399 L210 388 Z", textPos: {x: 180, y: 400} },
    { name: "Thiès", path: "M210 388 L212 399 L206 404 L216 414 L228 410 L250 420 L270 400 L250 360 L220 358 Z", textPos: {x: 230, y: 380} },
    { name: "Diourbel", path: "M270 400 L250 420 L280 440 L310 430 L320 400 Z", textPos: {x: 280, y: 415} },
    { name: "Fatick", path: "M250 420 L270 460 L300 480 L310 430 L280 440 Z", textPos: {x: 275, y: 450} },
    { name: "Kaolack", path: "M310 430 L300 480 L340 500 L350 470 L320 450 Z", textPos: {x: 320, y: 470} },
    { name: "Kaffrine", path: "M350 470 L340 500 L380 520 L400 490 Z", textPos: {x: 370, y: 490} },
    { name: "Kolda", path: "M300 540 L340 580 L380 550 L340 510 L300 520 Z", textPos: {x: 330, y: 540} },
    { name: "Sédhiou", path: "M260 560 L300 540 L300 520 L270 530 Z", textPos: {x: 270, y: 550} },
    { name: "Ziguinchor", path: "M220 580 L260 560 L270 530 L240 540 Z", textPos: {x: 230, y: 560} },
    { name: "Tambacounda", path: "M400 490 L380 520 L420 560 L500 550 L530 480 Z", textPos: {x: 450, y: 520} },
    { name: "Kédougou", path: "M500 550 L420 560 L450 620 L540 600 Z", textPos: {x: 480, y: 580} },
    { name: "Matam", path: "M380 320 L420 350 L500 340 L480 280 L400 300 Z", textPos: {x: 440, y: 320} },
    { name: "Saint-Louis", path: "M260 220 L300 250 L350 240 L340 180 L280 190 Z", textPos: {x: 300, y: 220} },
    { name: "Louga", path: "M250 360 L270 400 L320 400 L350 350 L300 320 L280 340 Z", textPos: {x: 300, y: 360} }
];


export default function SenegalMap() {

  return (
    <div className="relative w-full h-full bg-muted flex items-center justify-center p-4">
      <svg
        viewBox="180 170 400 480"
        className="max-w-full max-h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="fill-card stroke-border stroke-[0.5] group">
          {regions.map((region) => (
            <path key={region.name} d={region.path} className="transition-all duration-200 hover:fill-primary/20" data-name={region.name} />
          ))}

          {regions.map((region) => (
             <text key={region.name} x={region.textPos.x} y={region.textPos.y} className="fill-current text-[8px] font-sans pointer-events-none" >{region.name}</text>
          ))}
        </g>
        
        {farmers.map(farmer => (
          <Popover key={farmer.id}>
            <PopoverTrigger asChild>
                <g transform={`translate(${180 + (farmer.position.x / 100) * 400}, ${170 + (farmer.position.y / 100) * 480})`} className="cursor-pointer">
                    <circle cx="0" cy="0" r="5" className="fill-primary/20" />
                    <circle cx="0" cy="0" r="3" className="fill-primary" />
                    <Sprout className="text-primary-foreground w-3 h-3 -translate-x-1.5 -translate-y-1.5" />
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
