"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { geocodeByLatLng } from '../../lib/geocode';

// Define types for components that will be loaded dynamically
interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface MapSelectorProps {
  location: Location;
  onLocationChange: (location: Location) => void;
  height?: string;
}

// Create a dynamic import for the map components to avoid SSR issues
const MapWithNoSSR = dynamic(() => import('./map-component').then(mod => mod.MapComponent), {
  ssr: false,
  loading: () => (
    <div style={{ height: '300px' }} className="bg-gray-100 rounded flex items-center justify-center">
      Loading map...
    </div>
  )
});

export function MapSelector({ location, onLocationChange, height = '300px' }: MapSelectorProps) {
  return (
    <div className="w-full space-y-2 relative">
      {/* The map component */}
      <div className="relative" style={{ zIndex: 1 }}>
        <MapWithNoSSR 
          location={location} 
          onLocationChange={onLocationChange} 
          height={height} 
        />
      </div>
      
      {location.address && (
        <div className="text-sm text-gray-600">
          <p>Selected address: {location.address}</p>
        </div>
      )}
    </div>
  );
}