import { StyleSheet, View } from 'react-native';

// Import the appropriate map implementation based on platform
import { Maps} from '@/components/Maps';

interface PlatformMapProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showUserLocation?: boolean;
}
export const PlatformMap: React.FC<PlatformMapProps> = () => {
  return (
    <View style={styles.container}>
      <Maps />
    </View>
  );
};

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <PlatformMap />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  }
}); 