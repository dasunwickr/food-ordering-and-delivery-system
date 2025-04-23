"use client";

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geocodeByLatLng, geocodeByAddress, getSearchSuggestions, SearchSuggestion } from '../../lib/geocode';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';

// Define interfaces
interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface MapComponentProps {
  location: Location;
  onLocationChange: (location: Location) => void;
  height: string;
}

function LocationMarker({ location, onLocationChange }: { 
  location: Location; 
  onLocationChange: (location: Location) => void;
}) {
  const map = useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const address = await geocodeByLatLng(lat, lng);
      onLocationChange({ lat, lng, address });
    }
  });

  return location.lat !== 0 && location.lng !== 0 ? (
    <Marker 
      position={[location.lat, location.lng]}
      draggable={true}
      eventHandlers={{
        async dragend(e) {
          const marker = e.target;
          const position = marker.getLatLng();
          const address = await geocodeByLatLng(position.lat, position.lng);
          onLocationChange({ 
            lat: position.lat, 
            lng: position.lng, 
            address 
          });
        }
      }}
    />
  ) : null;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export function MapComponent({ location, onLocationChange, height }: MapComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const mapCenter = location.lat !== 0 && location.lng !== 0 
    ? [location.lat, location.lng] as [number, number]
    : [6.9271, 79.8612] as [number, number]; // Default to Colombo, Sri Lanka

  // Fix the Leaflet icon issues
  useEffect(() => {
    L.Icon.Default.prototype.options.iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
    L.Icon.Default.prototype.options.iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
    L.Icon.Default.prototype.options.shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
  }, []);

  // Handle search input with debounce for autocomplete
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounce
    if (value.length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await getSearchSuggestions(value);
          setSuggestions(results);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    onLocationChange({
      lat,
      lng,
      address: suggestion.display_name
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    
    try {
      const coordinates = await geocodeByAddress(searchQuery);
      if (coordinates) {
        const [lat, lng] = coordinates;
        const address = await geocodeByLatLng(lat, lng);
        onLocationChange({ lat, lng, address });
      } else {
        setSearchError('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Error searching for location');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="relative z-20"> {/* Add z-index: 20 to ensure dropdown appears above map */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <Input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="pr-10"
              disabled={isSearching}
              onFocus={() => setShowSuggestions(true)}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-opacity-50 border-t-primary rounded-full" />
              </div>
            )}
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                <ul>
                  {suggestions.map((suggestion) => (
                    <li 
                      key={suggestion.place_id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion.display_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Button type="submit" disabled={isSearching} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>
        
        {searchError && (
          <div className="text-sm text-red-500">
            {searchError}
          </div>
        )}
      </div>
      
      <div className="relative z-10" style={{ height, width: '100%' }}>
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker location={location} onLocationChange={onLocationChange} />
          <MapUpdater center={mapCenter} />
        </MapContainer>
      </div>
    </div>
  );
}