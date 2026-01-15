import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from "react-native";
import React, { useState, useEffect } from "react";
import * as Location from "expo-location";
import type { ScreenProps } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MapStyle from "../styles/MapStyle";
import BottomNavigation from "../navigation/BottomNavigation";
import Constants from "expo-constants";

const styles = MapStyle;

const API_BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ?? "http://localhost:5000";
const DEFAULT_RADIUS_METERS = 300;

type Coordinates = {
  latitude: number;
  longitude: number;
};

type PhotoMarker = {
  id: string;
  latitude: number;
  longitude: number;
};

const MapScreen = ({ navigation }: ScreenProps<"MapScreen">) => {
  const [location, setLocation] = useState<Coordinates | null>(null);

  const [photos, setPhotos] = useState<PhotoMarker[]>([]);

  const defaultLocation: Coordinates = {
    latitude: 25.3176,
    longitude: 82.9739,
  };

  const getPhotos = async (coords: Coordinates): Promise<PhotoMarker[]> => {
    try {
      const query = `lat=${coords.latitude}&lon=${coords.longitude}&radius=${DEFAULT_RADIUS_METERS}`;

      const response = await fetch(
        `${API_BASE_URL}/api/v1/photos/nearby?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("response", response);

      if (!response.ok) {
        console.error("Failed to fetch photos:", response.statusText);
        return [];
      }

      const data = await response.json();

      // Transform API response to marker format
      // API returns coordinates as [longitude, latitude] (GeoJSON format)
      const markers: PhotoMarker[] = data.map((photo: any) => ({
        id: photo._id,
        longitude: photo.location.coordinates[0], // longitude first in GeoJSON
        latitude: photo.location.coordinates[1],  // latitude second in GeoJSON
      }));

      return markers;
    } catch (error) {
      console.error("Error fetching photos:", error);
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      let coords: Coordinates = defaultLocation;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status == "granted") {
          console.log("Permission successful");
          const loc = await Location.getCurrentPositionAsync();
          coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
        } else {
          console.log("Permission not granted, using default location");
        }
      } catch (error) {
        console.error("Error getting current location, using default:", error);
      }

      setLocation(coords);

      const fetchedPhotos = await getPhotos(coords);
      setPhotos(fetchedPhotos);
    })();
  }, []);

  if (!location) {
    return (
      <View style={styles.loading}>
        <Text>Loading Map</Text>
      </View>
    );
  }



  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
      >
        {photos.length > 0 && photos.map((photo) => (
          <Marker
            key={photo.id}
            coordinate={{
              latitude: photo.latitude,
              longitude: photo.longitude,
            }}
          />
        ))}
      </MapView>

      {/* Top Search Bar with Back Button and Profile Icon */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search campus..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate("ProfileScreen")}
        >
          <Ionicons name="person-circle-outline" size={28} color="#f43f5e" />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
};

export default MapScreen;
