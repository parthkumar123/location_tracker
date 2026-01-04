import React, { createContext, useContext } from "react";
import { User } from "../types";

interface UserContextType {
  user: User;
  onLogout: () => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within UserProvider");
  }
  return context;
};

