import { Stack } from "expo-router";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuthStore } from "./storage/useAuthStore";
import { useExpenseStore } from "./storage/useExpenseStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  // Check the saved token once when the app starts
  useEffect(() => {
    bootstrap();
  }, []);

  // Keep the splash screen up until fonts AND the session check are done
  const ready = fontsLoaded && status !== "loading";

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    if (status === "loggedIn") {
      useExpenseStore.getState().fetchExpenses();
    } else if (status === "loggedOut") {
      useExpenseStore.getState().reset(); // so the next user never sees the last user's data
    }
  }, [status]);
  if (!ready) return null;

  const isLoggedIn = status === "loggedIn";

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Only reachable while logged out */}
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="login" />
          <Stack.Screen name="enter-phone" />
          <Stack.Screen name="verify-otp" />
        </Stack.Protected>

        {/* Only reachable while logged in */}
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="notifications" />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  );
}
