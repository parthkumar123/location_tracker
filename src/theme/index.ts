export { colors } from "./colors";
export { typography } from "./typography";
export { spacing } from "./spacing";

export const theme = {
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 8,
    },
    glow: {
      cyan: {
        shadowColor: "#06b6d4",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
      },
      purple: {
        shadowColor: "#8b5cf6",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
      },
      pink: {
        shadowColor: "#ec4899",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
      },
    },
  },
} as const;
