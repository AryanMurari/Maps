import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Platform, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';

// Native-specific props interface
interface NativeMobileMapProps {
  initialRegion?: Region;
  showUserLocation?: boolean;
}

/**
 * Native mobile-specific map component for iOS and Android
 * Uses react-native-maps under the hood with platform-specific providers
 */
export const Maps: React.FC<NativeMobileMapProps> = ({
  initialRegion,
  showUserLocation = true,
}: NativeMobileMapProps) => {
  // Native-specific default region
  const defaultRegion: Region = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Native-specific state management
  const [region, setRegion] = useState<Region>(initialRegion || defaultRegion);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Native-specific location handling
  useEffect(() => {
    (async () => {
      if (showUserLocation) {
        // Request location permissions for native
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        try {
          // Platform-specific location accuracy
          const locationOptions = Platform.OS === 'ios' 
            ? { accuracy: Location.Accuracy.Balanced }
            : {};
            
          // Get native device location
          let location = await Location.getCurrentPositionAsync(locationOptions);
          setLocation(location);
          
          // Update native map region
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        } catch (error) {
          setErrorMsg('Error getting current location on native device');
        }
      }
    })();
  }, [showUserLocation]);

  // Native-specific region change handler
  const onRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
  };

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <MapView
          style={styles.map}
          // Platform-specific provider
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={region}
          onRegionChangeComplete={onRegionChange}
          showsUserLocation={showUserLocation}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          showsBuildings={true}
          showsTraffic={false}
          showsIndoors={true}
          loadingEnabled={true}
          loadingIndicatorColor={Platform.OS === 'ios' ? '#007AFF' : '#4285F4'}
          loadingBackgroundColor="#f0f0f0"
          moveOnMarkerPress={false}
          pitchEnabled={true}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You are here"
              description="Your current location on native device"
              tracksViewChanges={Platform.OS !== 'android'}
            />
          )}
        </MapView>
      )}
    </View>
  );
};

// Native-specific styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  errorText: {
    padding: 16,
    color: Platform.OS === 'ios' ? '#FF3B30' : '#F44336',
    textAlign: 'center',
  },
});
