"use client";

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useLocationStore } from '@/stores/location-store';

interface MapSelectorProps {
  height?: string;
  onConfirmLocation?: () => void;
}

export function MapSelector({ height = "400px", onConfirmLocation }: MapSelectorProps) {
  const { location, setLocation } = useLocationStore();
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Mock function to simulate geocoding
  const reverseGeocode = async (lat: number, lng: number) => {
    // In a real app, you'd call a geocoding API here
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };
  
  // Mock function to handle map click events
  const handleMapClick = async (lat: number, lng: number) => {
    const address = await reverseGeocode(lat, lng);
    setLocation({ lat, lng, address });
  };
  
  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="w-full" style={{ height }}>
      {!mapLoaded ? (
        <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
          <span className="text-gray-400">Loading map...</span>
        </div>
      ) : (
        <div className="h-full w-full bg-blue-50 flex flex-col items-center justify-center relative">
          {/* This would be replaced by an actual map component */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-gray-100"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <MapPin className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm font-medium">Map Component Placeholder</p>
            <p className="text-xs text-gray-500 mt-1">
              {location.address || "Click on the map to select a location"}
            </p>
            
            {/* Mock map controls */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button 
                className="px-3 py-1 bg-gray-200 rounded text-xs"
                onClick={() => handleMapClick(location.lat + 0.001, location.lng)}
              >
                Move North
              </button>
              <button 
                className="px-3 py-1 bg-gray-200 rounded text-xs"
                onClick={() => handleMapClick(location.lat, location.lng + 0.001)}
              >
                Move East
              </button>
              <button 
                className="px-3 py-1 bg-gray-200 rounded text-xs"
                onClick={() => handleMapClick(location.lat - 0.001, location.lng)}
              >
                Move South
              </button>
              <button 
                className="px-3 py-1 bg-gray-200 rounded text-xs"
                onClick={() => handleMapClick(location.lat, location.lng - 0.001)}
              >
                Move West
              </button>
            </div>
            
            {location.address && (
              <div className="mt-4 text-center">
                <p className="font-medium text-sm">Selected Location:</p>
                <p className="text-xs">{location.address}</p>
                <p className="text-xs text-gray-500">
                  ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}