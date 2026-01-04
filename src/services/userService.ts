import { collection, doc, getDocs, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "../types";

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const usersSnapshot = await getDocs(collection(db, "users"));
    return usersSnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as User[];
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<User | null> => {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return null;
    return {
      uid: userDoc.id,
      ...userDoc.data(),
    } as User;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    // Delete user document from Firestore
    await deleteDoc(doc(db, "users", userId));
    
    // Note: Deleting the Firebase Auth user requires admin privileges
    // This would typically be done server-side for security
    // For now, we only delete the Firestore document
  },

  // Update user
  updateUser: async (userId: string, updates: Partial<User>): Promise<void> => {
    const userRef = doc(db, "users", userId);
    await import("firebase/firestore").then(({ updateDoc }) =>
      updateDoc(userRef, updates)
    );
  },
};

