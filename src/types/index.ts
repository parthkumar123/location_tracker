export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "employee";
  createdAt: Date;
}

export interface Location {
  userId: string;
  lat: number;
  lng: number;
  timestamp: Date;
  batteryLevel: number;
  speed: number;
  heading?: number;
}

export interface TrackingStats {
  hoursWorked: number;
  distanceCovered: number;
  batteryLevel: number;
}

export interface EmployeeStatus {
  userId: string;
  displayName: string;
  isOnline: boolean;
  lastActive: Date;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}
