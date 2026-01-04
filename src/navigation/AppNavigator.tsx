import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { User } from "../types";
import { CustomNavigator } from "./CustomNavigator";

interface AppNavigatorProps {
  user: User;
  onLogout: () => void;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ user, onLogout }) => {
  const initialScreen = user.role === "admin" ? "Dashboard" : "Home";

  return (
    <NavigationContainer>
      <CustomNavigator user={user} onLogout={onLogout} initialScreen={initialScreen} />
    </NavigationContainer>
  );
};
