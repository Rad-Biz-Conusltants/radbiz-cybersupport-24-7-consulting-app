import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/providers/auth-provider";
import { SubscriptionProvider } from "@/providers/subscription-provider";
import { TicketsProvider } from "@/providers/tickets-provider";
import { UsersProvider } from "@/providers/users-provider";
import { StorageProvider } from "@/providers/storage-provider";
import { SupportProvider } from "@/providers/support-provider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ 
        presentation: "modal",
        headerShown: false 
      }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="tickets/index" options={{ headerShown: false }} />
      <Stack.Screen name="tickets/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="tickets/new" options={{ headerShown: false }} />
      <Stack.Screen name="users/manage" options={{ headerShown: false }} />
      <Stack.Screen name="credits/add" options={{ headerShown: false }} />
      <Stack.Screen name="subscription/success" options={{ headerShown: false }} />
      <Stack.Screen name="credits/success" options={{ headerShown: false }} />
      <Stack.Screen name="security/vpn-servers" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  gestureHandler: {
    flex: 1,
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.gestureHandler}>
        <StorageProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <TicketsProvider>
                <UsersProvider>
                  <SupportProvider>
                    <RootLayoutNav />
                  </SupportProvider>
                </UsersProvider>
              </TicketsProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </StorageProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}