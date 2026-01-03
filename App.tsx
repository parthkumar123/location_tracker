import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LoginScreen } from "./src/screens/LoginScreen";
import { EmployeeHome } from "./src/screens/EmployeeHome";
import { AdminDashboard } from "./src/screens/AdminDashboard";
import { ErrorBoundary } from "./src/components";
import { authService } from "./src/services/auth";
import { User } from "./src/types";
import { colors } from "./src/theme";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.cyan} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="light" />

        {!user ? (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        ) : user.role === "admin" ? (
          <AdminDashboard user={user} onLogout={handleLogout} />
        ) : (
          <EmployeeHome user={user} onLogout={handleLogout} />
        )}
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
});
