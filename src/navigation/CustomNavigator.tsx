import React, { useState, createContext, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { User } from "../types";
import { DashboardScreen } from "../screens/DashboardScreen";
import { MapViewScreen } from "../screens/MapViewScreen";
import { UserManagementScreen } from "../screens/UserManagementScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { EmployeeHome } from "../screens/EmployeeHome";
import { AddUserScreen } from "../screens/AddUserScreen";
import { SideMenu } from "../components/SideMenu";
import { UserContext } from "./UserContext";
import { NavigationMenuContext } from "./NavigationContext";

type ScreenName = "Dashboard" | "MapView" | "UserManagement" | "Home" | "Profile" | "AddUser";

interface NavigationContextType {
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  currentScreen: ScreenName;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useCustomNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    return {
      navigate: () => {},
      goBack: () => {},
      currentScreen: "Dashboard" as ScreenName,
    };
  }
  return context;
};

interface CustomNavigatorProps {
  user: User;
  onLogout: () => void;
  initialScreen: ScreenName;
}

export const CustomNavigator: React.FC<CustomNavigatorProps> = ({
  user,
  onLogout,
  initialScreen,
}) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(initialScreen);
  const [screenHistory, setScreenHistory] = useState<ScreenName[]>([initialScreen]);
  const [menuVisible, setMenuVisible] = useState(false);

  const navigate = (screen: ScreenName) => {
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
    setMenuVisible(false);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop(); // Remove current screen
      const previousScreen = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setCurrentScreen(previousScreen);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "Dashboard":
        return <DashboardScreen />;
      case "MapView":
        return <MapViewScreen />;
      case "UserManagement":
        return <UserManagementScreen />;
      case "Home":
        return <EmployeeHome />;
      case "Profile":
        return <ProfileScreen />;
      case "AddUser":
        return <AddUserScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <UserContext.Provider value={{ user, onLogout }}>
      <NavigationContext.Provider value={{ navigate, goBack, currentScreen }}>
        <NavigationMenuContext.Provider value={{ openMenu: () => setMenuVisible(true) }}>
          <View style={styles.container}>
            {renderScreen()}
            <SideMenu
              visible={menuVisible}
              onClose={() => setMenuVisible(false)}
              user={user}
              currentRoute={currentScreen}
              onNavigate={(route) => navigate(route as ScreenName)}
              onLogout={onLogout}
              onProfile={() => navigate("Profile")}
            />
          </View>
        </NavigationMenuContext.Provider>
      </NavigationContext.Provider>
    </UserContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

