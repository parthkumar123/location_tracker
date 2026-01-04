import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User } from "../types";

export const authService = {
  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<User> => {
    if (!auth || !db) {
      throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

    if (!userDoc.exists()) {
      throw new Error("User data not found");
    }

    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      ...userDoc.data(),
    } as User;
  },

  // Sign up new user
  signUp: async (
    email: string,
    password: string,
    displayName: string,
    role: "admin" | "employee"
  ): Promise<User> => {
    if (!auth || !db) {
      throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const userData: User = {
      uid: userCredential.user.uid,
      email,
      displayName,
      role,
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), userData);

    return userData;
  },

  // Sign out
  signOut: async (): Promise<void> => {
    if (!auth) {
      throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    await firebaseSignOut(auth);
  },

  // Get current user data
  getCurrentUser: async (firebaseUser: FirebaseUser): Promise<User | null> => {
    if (!firebaseUser || !db) return null;

    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (!userDoc.exists()) return null;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      ...userDoc.data(),
    } as User;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    if (!auth) {
      // If Firebase is not initialized, call callback with null immediately
      callback(null);
      return () => {}; // Return no-op unsubscribe function
    }
    
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await authService.getCurrentUser(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  },
};
