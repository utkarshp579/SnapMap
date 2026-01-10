import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import * as Location from "expo-location";
import type { ScreenProps } from "../types";
import { FontAwesome } from "@expo/vector-icons";
import MapStyle from "../styles/MapStyle";

const styles = MapStyle;

const MapScreen = ({ navigation }: ScreenProps<"MapScreen">) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  type PhotoCoordinate = {
    latitude: number;
    longitude: number;
  };
  const [photos, setPhotos] = useState<PhotoCoordinate[]>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status == "granted") {
        console.log("Permission successful");
      } else {
        console.log("Permission not granted");
      }

      const loc = await Location.getCurrentPositionAsync();

      console.log(loc);
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  if (!location) {
    return (
      <View style={styles.loading}>
        <Text>Loading Map</Text>
      </View>
    );
  }

  useEffect(() => {
    (async () => {
      const photos = await getPhotos();
      setPhotos(photos);
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      />
      {photos.map((photo) => (
        <Marker key={photo.id} coordinate={photo} />
      ))}
      <TouchableOpacity
        style={styles.CameraButton}
        onPress={() => navigation.navigate("CameraScreen")}
      >
        <FontAwesome name="camera" size={20} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.HomeButton}
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <FontAwesome name="home" size={25} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default MapScreen;
