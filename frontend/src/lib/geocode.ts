export interface SearchSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

export async function geocodeByLatLng(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'FoodDeliveryApp/1.0',
        },
      }
    );
    const data = await response.json();
    return data.display_name || 'Address not found';
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Error fetching address';
  }
}

export async function geocodeByAddress(address: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'FoodDeliveryApp/1.0',
        },
      }
    );
    const data = await response.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'User-Agent': 'FoodDeliveryApp/1.0',
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search suggestions error:', error);
    return [];
  }
}