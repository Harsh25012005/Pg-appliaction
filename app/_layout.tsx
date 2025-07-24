import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { UserProvider, useUser } from "@/store/user-store";
import { RentProvider } from "@/store/rent-store";
import { MealProvider } from "@/store/meal-store";
import { ComplaintProvider } from "@/store/complaint-store";
import { AnnouncementProvider } from "@/store/announcement-store";
import { AIAssistantProvider } from "@/store/ai-assistant-store";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#121212" },
        headerTintColor: "#F3F4F6",
        contentStyle: { backgroundColor: "#121212" },
        headerBackTitle: "Back",
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" options={{ headerShown: false }} />
          <Stack.Screen
            name="ai-assistant"
            options={{ presentation: "modal", title: "AI Assistant" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <RentProvider>
          <MealProvider>
            <ComplaintProvider>
              <AnnouncementProvider>
                <AIAssistantProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <StatusBar style="light" />
                    <RootLayoutNav />
                  </GestureHandlerRootView>
                </AIAssistantProvider>
              </AnnouncementProvider>
            </ComplaintProvider>
          </MealProvider>
        </RentProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
