
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  sector?: string; // Optional because admin doesn't have one
  isAdmin: boolean;
  role: string;
  password?: string;
}

export interface Booking {
  id: string;
  userId: string;
  date: string; // ISO string for date and time
  sector: string;
  userName: string;
  duration: number; // duration in hours
  reason: string;
}

export interface AppSettings {
  logo: string | null;
  backgroundImage: string | null;
  adminCode: string;
}

export enum View {
  CALENDAR,
  ADMIN_PANEL,
  ALL_BOOKINGS_REPORT,
}