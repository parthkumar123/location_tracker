import React, { createContext, useContext } from "react";

interface NavigationContextType {
  openMenu: () => void;
}

export const NavigationMenuContext = createContext<NavigationContextType | null>(
  null
);

export const useNavigationMenu = () => {
  const context = useContext(NavigationMenuContext);
  if (!context) {
    // Return a no-op function if context is not available (shouldn't happen, but prevents crashes)
    return { openMenu: () => {} };
  }
  return context;
};

