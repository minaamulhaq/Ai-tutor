/**
 * ZuhDemy Teacher & Marketplace Data Models
 * Defines the shared TypeScript contracts for teacher profiles, marketplace search,
 * filtering, sorting, pagination, and favorites.
 */

export interface TeacherEducation {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  completionYear?: string;
}

export interface TeacherExperience {
  id: string;
  role: string;
  institution: string;
  duration: string;
  description?: string;
}

export interface TeacherCertificate {
  id: string;
  title: string;
  issuer: string;
  year?: string;
  isVerified: boolean;
}

export interface TeacherReview {
  id: string;
  bookingId?: string;
  author: string;
  authorAvatar?: string;
  role: "student" | "parent";
  studentInfo?: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  subject?: string;
  topicTitle?: string;
  likes?: number;
}

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface TeacherTimeSlot {
  day: DayOfWeek;
  startTime: string; // "16:00" (24h)
  endTime: string;   // "17:00" (24h)
  isBooked?: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  headline: string;
  bio?: string;
  subjects: string[];
  education?: TeacherEducation[];
  experience?: TeacherExperience[];
  certificates?: TeacherCertificate[];
  targetStudentLevels: string[];
  teachingLanguages: string[];
  hourlyRate: number; // in platform currency (PKR)
  currency: string;   // default: "PKR"
  sessionDurationMinutes: number; // 60 for standard 1-hour sessions
  
  // Ratings & reviews: only present when authentic data exists
  rating?: number;
  reviewCount?: number;
  reviews?: TeacherReview[];

  // Verification & Status
  isVerified: boolean;
  isFavorite?: boolean;
  profileVisibility: "public" | "unlisted" | "private";
  verificationStatus: "verified" | "pending" | "unverified";

  // Location & schedule availability
  city?: string;
  country?: string;
  timezone?: string;
  availabilitySummary?: string;
  nextAvailableSlot?: string;
  availableDays?: DayOfWeek[];
  availableTimesOfDay?: TimeOfDay[];
  teachingMode?: string;      // e.g. "100% Online (1-on-1)"
  meetingProvider?: string;   // e.g. "Google Meet"
  totalClassesTaught?: number;

  // Professional highlight badges
  highlightBadge?: "Top Rated" | "Super Tutor" | "Popular" | "Cambridge Certified";
  responseSpeed?: string; // e.g. "Responds in ~30 mins"

  // Video introduction
  introVideoUrl?: string;
  videoThumbnailUrl?: string;
}

/**
 * Filter state model for Find Teachers search and filtering
 */
export interface TeacherFilterState {
  search: string;
  subjects: string[];
  studentLevels: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  teachingLanguages: string[];
  availableDays: DayOfWeek[];
  availableTimesOfDay?: TimeOfDay[];
  scheduleType?: "all" | "weekdays" | "weekends";
}

/**
 * Supported sorting options for teacher search results
 */
export type TeacherSortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "reviews-desc";

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paginated teacher query result with metadata
 */
export interface TeacherQueryResult {
  teachers: Teacher[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  appliedFilters: TeacherFilterState;
  sort: TeacherSortOption;
  dataSource: "mock" | "supabase" | "api";
}

/**
 * Teacher catalogs metadata for filter controls
 */
export interface FilterCatalogs {
  subjects: string[];
  studentLevels: string[];
  languages: string[];
  priceRange: {
    min: number;
    max: number;
  };
}
