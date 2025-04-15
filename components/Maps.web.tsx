import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';

const GOOGLE_MAPS_API_KEY = (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) || '';
// create an .env file and add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key in it.

// Add Google Maps types
declare global {
  interface Window {
    google?: {
      maps: typeof google.maps;
    };
  }
}

// Web-specific props interface
interface WebMobileMapProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showUserLocation?: boolean;
}

/**
 * Web-specific map component
 * Uses Google Maps JavaScript API for web platform
 */
export const Maps: React.FC<WebMobileMapProps> = ({
  initialRegion,
  showUserLocation = true,
}: WebMobileMapProps) => {
  // Web-specific default region
  const defaultRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Web-specific state management
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Map refs
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  // Web-specific location handling
  useEffect(() => {
    if (showUserLocation && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition(position);
        },
        (error) => {
          setErrorMsg(`Error getting location: ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else if (showUserLocation && typeof navigator !== 'undefined' && !navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by this browser');
    }
  }, [showUserLocation]);

  // Prepare region for map
  const mapRegion = position ? {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : (initialRegion || defaultRegion);

  // Load Google Maps script dynamically
  useEffect(() => {
    // Skip if already loaded
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Set up callback when script is loaded
    script.onload = () => {
      setMapLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Google Maps script failed to load');
      setErrorMsg('Failed to load Google Maps');
    };
    
    // Add script to document
    document.head.appendChild(script);
    
    // Clean up
    return () => {
      // Remove script if component unmounts before loading completes
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize map once script is loaded and div is available
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google?.maps) return;
    
    // Convert region to Google Maps bounds/zoom
    const center = new window.google.maps.LatLng(mapRegion.latitude, mapRegion.longitude);
    const zoom = Math.log2(360 / mapRegion.latitudeDelta) - 2.5;
    
    // Create map instance
    const mapOptions: google.maps.MapOptions = {
      center,
      zoom,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
      zoomControl: true,
    };
    
    // Initialize map
    googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
    
  }, [mapLoaded, mapRegion.latitude, mapRegion.longitude, mapRegion.latitudeDelta]);

  // Update user location marker when position changes
  useEffect(() => {
    if (!googleMapRef.current || !position || !showUserLocation || !window.google?.maps) {
      // Remove marker if exists but should not be shown
      if (userMarkerRef.current && !showUserLocation) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      return;
    }
    
    const userPos = new window.google.maps.LatLng(
      position.coords.latitude,
      position.coords.longitude
    );
    
    // Create marker if doesn't exist
    if (!userMarkerRef.current) {
      userMarkerRef.current = new window.google.maps.Marker({
        position: userPos,
        map: googleMapRef.current,
        title: 'You are here',
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        }
      });
      
      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: '<div style="font-family: Arial, sans-serif;">Your current location</div>'
      });
      
      userMarkerRef.current.addListener('click', () => {
        infoWindow.open(googleMapRef.current, userMarkerRef.current);
      });
    } else {
      // Update position if marker exists
      userMarkerRef.current.setPosition(userPos);
    }
  }, [position, showUserLocation, mapLoaded]);

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <div ref={mapRef} style={styles.mapDiv} />
      )}
    </View>
  );
};

// Styles for container
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapDiv: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    padding: 16,
    color: '#F44336',
    textAlign: 'center',
  },
});
