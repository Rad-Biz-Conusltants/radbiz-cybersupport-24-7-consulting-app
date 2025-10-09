import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { SubscriptionProvider } from "@/providers/subscription-provider";
import { TicketsProvider } from "@/providers/tickets-provider";
import { UsersProvider } from "@/providers/users-provider";
import { StorageProvider } from "@/providers/storage-provider";
import { SupportProvider } from "@/providers/support-provider";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0] as string | undefined;
    const inTabsGroup = firstSegment === '(tabs)';
    const onLandingPage = !firstSegment || firstSegment === 'index';

    const protectedRoutes = ['tickets', 'users', 'security', 'profile'];
    const isProtectedRoute = protectedRoutes.some(route => segments.includes(route));

    console.log('Navigation check:', { user: !!user, firstSegment, inTabsGroup, onLandingPage, isProtectedRoute });

    if (!user && (inTabsGroup || isProtectedRoute)) {
      console.log('Redirecting to landing page - user not authenticated');
      router.replace('/');
    } else if (user && onLandingPage) {
      console.log('Redirecting to home - user authenticated');
      router.replace('/(tabs)/home');
    }
  }, [user, segments, isLoading, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="checkout" options={{ 
        presentation: "modal",
        headerShown: false 
      }} />
      <Stack.Screen name="tickets/index" options={{ headerShown: false }} />
      <Stack.Screen name="tickets/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="tickets/new" options={{ headerShown: false }} />
      <Stack.Screen name="users/manage" options={{ headerShown: false }} />
      <Stack.Screen name="credits/add" options={{ headerShown: false }} />
      <Stack.Screen name="subscription/success" options={{ headerShown: false }} />
      <Stack.Screen name="credits/success" options={{ headerShown: false }} />
      <Stack.Screen name="security/vpn-servers" options={{ headerShown: false }} />
      <Stack.Screen name="support/payment" options={{ headerShown: false }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
      <Stack.Screen name="profile/notifications" options={{ headerShown: false }} />
      <Stack.Screen name="profile/billing" options={{ headerShown: false }} />
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
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
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
    </trpc.Provider>
  );
}