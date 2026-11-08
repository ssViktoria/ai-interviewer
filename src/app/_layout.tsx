import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

// Вимикаємо strict mode для Reanimated перед завантаженням інших компонентів
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

import { ModalProvider } from "@/components/UniversalModal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ModalProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0F172A" },
          }}
        >
          {/* Головна таб-навігація (Bottom Tabs) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Повноекранний чат інтерв'ю */}
          <Stack.Screen
            name="interview"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />

          {/* Повноекранний звіт пройденої співбесіди */}
          <Stack.Screen
            name="report/[id]"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </ModalProvider>
    </SafeAreaProvider >
  );
}