import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { AnimatedView } from "./AnimatedView";
import {
  LayoutDashboard,
  Map,
  Users,
  User as UserIcon,
  Home,
  LogOut,
  X,
} from "lucide-react-native";
import { User } from "../types";
import { colors, typography, spacing, theme } from "../theme";
import { GlassCard } from "./GlassCard";

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  user: User;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  onProfile: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  onClose,
  user,
  currentRoute,
  onNavigate,
  onLogout,
  onProfile,
}) => {
  const getMenuItems = () => {
    if (user.role === "admin") {
      return [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          route: "Dashboard",
          key: "Dashboard",
        },
        {
          label: "Map View",
          icon: Map,
          route: "MapView",
          key: "MapView",
        },
        {
          label: "User Management",
          icon: Users,
          route: "UserManagement",
          key: "UserManagement",
        },
      ];
    } else {
      return [
        {
          label: "Home",
          icon: Home,
          route: "Home",
          key: "Home",
        },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <Modal
      visible={visible === true}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <AnimatedView
          from={{ translateX: -280 }}
          animate={{ translateX: visible ? 0 : -280 }}
          transition={{ type: "timing", duration: 300 }}
          style={styles.menuContainer}
        >
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {user.photoURL ? (
                  <Image
                    source={{ uri: user.photoURL }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: colors.cyan }]}>
                    <Text style={styles.avatarText}>
                      {user.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.displayName}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userRole}>
                  {user.role === "admin" ? "Administrator" : "Employee"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.menuItems}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => {
                    onNavigate(item.route);
                    onClose();
                  }}
                >
                  <Icon
                    size={20}
                    color={isActive ? colors.cyan : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      isActive && styles.menuItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onProfile();
                onClose();
              }}
            >
              <UserIcon size={20} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <LogOut size={20} color={colors.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </AnimatedView>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  menuContainer: {
    width: 280,
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.glassLight,
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassLight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.cyan,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.cyan,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  userRole: {
    fontSize: typography.fontSize.xs,
    color: colors.cyan,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wide,
  },
  closeButton: {
    padding: spacing.sm,
  },
  menuItems: {
    flex: 1,
    paddingTop: spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  menuItemActive: {
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: colors.cyan,
  },
  menuItemText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  menuItemTextActive: {
    color: colors.cyan,
    fontWeight: typography.fontWeight.bold,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glassLight,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    fontWeight: typography.fontWeight.bold,
  },
});

