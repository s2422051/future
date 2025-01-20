import 'react-native-get-random-values';
import { useState, useEffect } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import styles from '../style/home_style';

// APIキーを直接定義
const GOOGLE_MAPS_API_KEY = 'AIzaSyDmEy7T0Vpxv3Dq427BaprLcVf58dTB4GU'; // ここにあなたのAPIキーを入れてください

function HomeScreen() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('位置情報の許可が必要です');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const getDirections = async (destination) => {
    try {
      if (!currentLocation) return;

      const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
      const dest = `${destination.latitude},${destination.longitude}`;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=transit&transit_mode=train&language=ja&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);
        setRoute(decodedPoints);
      }
    } catch (error) {
      console.error('経路取得エラー:', error);
      alert('経路を取得できませんでした');
    }
  };

  function decodePolyline(encoded) {
    let index = 0;
    const len = encoded.length;
    let latitude = 0;
    let longitude = 0;
    const coordinates = [];

    while (index < len) {
      let shift = 0;
      let result = 0;

      while (true) {
        let byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
        if (byte < 0x20) break;
      }

      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      latitude += deltaLat;

      shift = 0;
      result = 0;

      while (true) {
        let byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
        if (byte < 0x20) break;
      }

      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      longitude += deltaLng;

      coordinates.push({
        latitude: latitude * 1e-5,
        longitude: longitude * 1e-5
      });
    }

    return coordinates;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder='目的地を検索'
          onPress={(data, details) => {
            if (details && details.geometry) {
              const location = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              };
              setDestination(location);
              getDirections(location);
            }
          }}
          fetchDetails={true}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'ja',
            components: 'country:jp',
          }}
          styles={{
            container: styles.autocompleteContainer,
            textInput: styles.searchInput,
            listView: styles.searchListView,
          }}
        />
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 35.6812362,
          longitude: 139.7671248,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        region={currentLocation ? {
          ...currentLocation,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        } : undefined}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="現在位置"
            pinColor="blue"
          />
        )}

        {destination && (
          <Marker
            coordinate={destination}
            title="目的地"
            pinColor="red"
          />
        )}

        {route && (
          <Polyline
            coordinates={route}
            strokeColor="#2196F3"
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}
      </MapView>
    </View>
  );
}

export default HomeScreen;