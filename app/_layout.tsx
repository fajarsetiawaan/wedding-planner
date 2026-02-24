import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Platform, StyleSheet } from "react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { WeddingProvider, useWedding } from "@/lib/wedding-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
} from "@expo-google-fonts/lora";

SplashScreen.preventAutoHideAsync();


function RootLayoutNav() {
  const { weddingId, isLoading } = useWedding();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (
      // If the user is not authenticated and not in the auth group
      !weddingId &&
      !inAuthGroup
    ) {
      // Redirect to the splash screen
      router.replace("/(auth)/splash");
    } else if (weddingId && inAuthGroup) {
      // Redirect away from the auth group if authenticated
      router.replace("/(tabs)");
    }
  }, [weddingId, segments, isLoading, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={styles.gestureRoot}>
            <View style={styles.maxWidthContainer}>
              <KeyboardProvider>
                <WeddingProvider>
                  <StatusBar style="dark" />
                  <RootLayoutNav />
                </WeddingProvider>
              </KeyboardProvider>
            </View>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Subtle gray background for desktop/web bounds
  },
  maxWidthContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
    backgroundColor: '#000', // Matches app base bg (Splash is #000 temporarily during load)
    overflow: 'hidden',
    boxShadow: Platform.OS === 'web' ? '0px 0px 20px rgba(0,0,0,0.1)' : 'none',
  },
});
