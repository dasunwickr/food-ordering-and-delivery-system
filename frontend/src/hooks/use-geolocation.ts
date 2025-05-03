import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
  loading: boolean;
  error: GeolocationPositionError | null;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const defaultOptions: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser.',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        } as GeolocationPositionError
      }));
      return;
    }

    const geoOptions = {
      ...defaultOptions,
      ...options,
    };

    // Success handler
    const onSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        loading: false,
        error: null,
      });
    };

    // Error handler
    const onError = (error: GeolocationPositionError) => {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error,
      }));
    };

    // Start watching position
    const watchId = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      geoOptions
    );

    // Cleanup: stop watching position
    return () => navigator.geolocation.clearWatch(watchId);
  }, [options]);

  return location;
};