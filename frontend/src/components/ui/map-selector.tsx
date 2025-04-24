"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface MapSelectorProps {
  location: LocationData;
  onLocationChange: (location: LocationData) => void;
  height?: string;
}

// Dynamically import the map component with SSR disabled
const MapComponentWithNoSSR = dynamic(
  () => import('./map-component').then((mod) => mod.MapComponent),
  {
    loading: () => (
      <div className="flex items-center justify-center" 
           style={{ height: "350px", width: "100%", background: "#f1f5f9" }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary/70" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    ),
    ssr: false, // This is the key part - disable SSR for this component
  }
);

export function MapSelector({ location, onLocationChange, height = "350px" }: MapSelectorProps) {
  return (
    <div className="w-full rounded-md overflow-hidden border">
      <MapComponentWithNoSSR
        location={location}
        onLocationChange={onLocationChange}
        height={height}
      />
    </div>
  );
}