"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// IMPORTANT: You need to add your Google Maps API key to your environment variables.
// Create a .env.local file in the root of your project and add:
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY"
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const farmers = [
  { id: 1, name: "Moussa Faye", position: { lat: 14.7167, lng: -17.4677 }, crop: "Millet" },
  { id: 2, name: "Awa Diallo", position: { lat: 14.6934, lng: -16.4381 }, crop: "Groundnut" },
  { id: 3, name: "Ousmane Sow", position: { lat: 14.8333, lng: -16.2667 }, crop: "Sorghum" },
  { id: 4, name: "Fatou Ndiaye", position: { lat: 12.5667, lng: -16.2667 }, crop: "Cassava" },
];

export default function MapClient() {
  const [selectedFarmer, setSelectedFarmer] = useState<typeof farmers[0] | null>(null);

  if (!API_KEY) {
    return (
        <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-center p-4 rounded-md bg-card border border-destructive">
                <h2 className="text-xl font-bold text-destructive-foreground">Configuration Error</h2>
                <p className="text-muted-foreground">Google Maps API key is missing. Please add it to your environment variables.</p>
            </div>
        </div>
    )
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        mapId="senagriconnect-map"
        defaultCenter={{ lat: 14.4974, lng: -14.4524 }}
        defaultZoom={7}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        className="w-full h-full"
      >
        {farmers.map((farmer) => (
          <AdvancedMarker
            key={farmer.id}
            position={farmer.position}
            onClick={() => setSelectedFarmer(farmer)}
          />
        ))}
        {selectedFarmer && (
          <InfoWindow
            position={selectedFarmer.position}
            onCloseClick={() => setSelectedFarmer(null)}
          >
            <Card className="border-0 shadow-none w-64">
                <CardHeader className="flex-row gap-4 items-center p-2">
                    <Avatar>
                        <AvatarImage src={`/avatars/0${selectedFarmer.id}.png`} />
                        <AvatarFallback>{selectedFarmer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base">{selectedFarmer.name}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                    <p className="text-sm"><strong>Primary Crop:</strong> {selectedFarmer.crop}</p>
                </CardContent>
            </Card>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
