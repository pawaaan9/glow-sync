export type UserRole = "customer" | "salon-owner" | "staff" | "platform-admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  imageUrl?: string;
}

export interface StaffMember {
  id: string;
  salonId: string;
  name: string;
  role: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  bio?: string;
}

export interface Review {
  id: string;
  salonId: string;
  customerName: string;
  customerAvatarUrl?: string;
  rating: number;
  comment: string;
  date: string;
  serviceName?: string;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export type PriceLevel = 1 | 2 | 3;

export interface Salon {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  coverImageUrl: string;
  galleryImageUrls: string[];
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceLevel: PriceLevel;
  categories: string[];
  amenities: string[];
  openingHours: OpeningHours[];
  services: Service[];
  staff: StaffMember[];
  reviews: Review[];
  featured?: boolean;
}

export interface SalonSearchFilters {
  query?: string;
  city?: string;
  category?: string;
  minRating?: number;
  priceLevel?: PriceLevel;
  sort?: "recommended" | "rating" | "price-low" | "price-high";
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  salonId: string;
  salonName: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  customerId: string;
  customerName: string;
  date: string;
  time: string;
  durationMinutes: number;
  price: number;
  status: BookingStatus;
  notes?: string;
}
