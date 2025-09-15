import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!", headerShown: false }} />
      <LinearGradient
        colors={[Colors.backgroundStart, Colors.backgroundEnd]}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={64} color={Colors.warning} />
          </View>
          
          <Text style={styles.title}>This screen doesn&apos;t exist.</Text>
          <Text style={styles.subtitle}>The page you&apos;re looking for could not be found.</Text>

          <Link href="/(tabs)/home" style={styles.link}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.linkGradient}
            >
              <Text style={styles.linkText}>Go to home screen!</Text>
            </LinearGradient>
          </Link>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  link: {
    borderRadius: 12,
    overflow: "hidden",
  },
  linkGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
});
