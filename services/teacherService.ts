/**
 * ZuhDemy Teacher Service & Data Provider Layer
 * 
 * Provides a decoupled abstraction layer for querying teachers, filtering,
 * sorting, pagination, and favorites management.
 * 
 * Designed to scale from local in-memory seed records to thousands of
 * teachers backed by Supabase or a high-performance backend search index.
 */

import {
  Teacher,
  TeacherFilterState,
  TeacherSortOption,
  PaginationParams,
  TeacherQueryResult,
  FilterCatalogs,
  DayOfWeek,
  TimeOfDay,
} from "@/types/teacher";
import {
  AVAILABLE_SUBJECTS,
  AVAILABLE_STUDENT_LEVELS,
  AVAILABLE_LANGUAGES,
} from "@/lib/constants/catalogs";
import {
  getPublicTeacherByIdAction,
  getPublicTeachersListAction,
  searchPublicTeachersAction,
  getPublicTeacherFilterCatalogsAction,
} from "@/app/actions/teacher";

// ============================================================================
// DATA PROVIDER INTERFACE
// ============================================================================
export interface TeacherDataProvider {
  name: "mock" | "supabase" | "api";
  fetchTeachers(
    filters: TeacherFilterState,
    sort: TeacherSortOption,
    pagination: PaginationParams
  ): Promise<TeacherQueryResult>;
  fetchTeacherById(id: string): Promise<Teacher | null>;
  fetchFavoriteTeachers(): Promise<Teacher[]>;
  toggleFavorite(teacherId: string, currentStatus: boolean): Promise<boolean>;
  getFilterCatalogs(): Promise<FilterCatalogs>;
}

// ============================================================================
// CURATED TEACHER PROFILES
// ============================================================================
export const SEED_TEACHERS: Teacher[] = [
  {
    id: "usr_teach_01",
    name: "Dr. Alexander Wright",
    firstName: "Alexander",
    lastName: "Wright",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    headline: "Senior Computer Science Instructor & AI Researcher",
    bio: "Ph.D. holder with over 8 years of tutoring and university teaching experience. I specialize in breaking down complex computer science concepts, Python programming, algorithms, and data structures into intuitive mental models.\n\nEvery session includes live debugging, hands-on code walkthroughs, and exam preparation tailored to O/A-Levels and university students.",
    subjects: ["Computer Science", "Python Programming", "Data Structures", "Algorithms", "Mathematics"],
    targetStudentLevels: ["O-Levels / IGCSE", "A-Levels / FSc", "Undergraduate (University)", "Adult Professional & Career Transition"],
    teachingLanguages: ["English", "Urdu"],
    hourlyRate: 3500,
    currency: "PKR",
    sessionDurationMinutes: 60,
    rating: 4.95,
    reviewCount: 48,
    isVerified: true,
    isFavorite: true,
    profileVisibility: "public",
    verificationStatus: "verified",
    city: "Lahore",
    country: "Pakistan",
    timezone: "Asia/Karachi",
    availabilitySummary: "Available today • Evening slots",
    nextAvailableSlot: "Today at 04:00 PM",
    availableDays: ["monday", "wednesday", "friday", "saturday"],
    availableTimesOfDay: ["afternoon", "evening"],
    teachingMode: "100% Online (1-on-1)",
    meetingProvider: "Google Meet",
    totalClassesTaught: 248,
    highlightBadge: "Super Tutor",
    responseSpeed: "Responds in ~15 mins",
    education: [
      {
        id: "edu_1",
        degree: "Ph.D. in Computer Science",
        institution: "Stanford University",
        fieldOfStudy: "Artificial Intelligence",
        completionYear: "2020",
      },
      {
        id: "edu_2",
        degree: "B.Sc. in Mathematics & Computer Science",
        institution: "University of Oxford",
        completionYear: "2016",
      },
    ],
    experience: [
      {
        id: "exp_1",
        role: "Senior CS Lecturer & Mentor",
        institution: "Tech Academy Consortium",
        duration: "2021 - Present (3 yrs)",
      },
    ],
    certificates: [
      {
        id: "cert_1",
        title: "Cambridge Certified Educator (STEM)",
        issuer: "Cambridge Assessment International Education",
        year: "2023",
        isVerified: true,
      },
    ],
  },
  {
    id: "usr_teach_02",
    name: "Ayesha Malik",
    firstName: "Ayesha",
    lastName: "Malik",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    headline: "Cambridge O & A-Levels Mathematics & Calculus Specialist",
    bio: "Passionate mathematics tutor with 6+ years helping students excel in IGCSE/O-Levels and A-Levels. Achieved 94% A/A* rate in Cambridge board examinations through systematic problem breakdown and past paper drills.",
    subjects: ["Mathematics", "Calculus", "Statistics & Probability", "Linear Algebra"],
    targetStudentLevels: ["Middle School (Grade 6-8)", "O-Levels / IGCSE", "A-Levels / FSc"],
    teachingLanguages: ["English", "Urdu", "Punjabi"],
    hourlyRate: 2800,
    currency: "PKR",
    sessionDurationMinutes: 60,
    rating: 4.96,
    reviewCount: 64,
    isVerified: true,
    isFavorite: false,
    profileVisibility: "public",
    verificationStatus: "verified",
    city: "Islamabad",
    country: "Pakistan",
    timezone: "Asia/Karachi",
    availabilitySummary: "Weekday mornings & afternoons",
    nextAvailableSlot: "Tomorrow at 10:00 AM",
    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    availableTimesOfDay: ["morning", "afternoon"],
    teachingMode: "100% Online (1-on-1)",
    meetingProvider: "Google Meet",
    totalClassesTaught: 312,
    highlightBadge: "Top Rated",
    responseSpeed: "Responds in ~30 mins",
    education: [
      {
        id: "edu_3",
        degree: "M.Sc. in Applied Mathematics",
        institution: "Quaid-i-Azam University",
        completionYear: "2019",
      },
    ],
  },
  {
    id: "usr_teach_03",
    name: "Dr. Bilal Siddiqui",
    firstName: "Bilal",
    lastName: "Siddiqui",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    headline: "Assistant Professor of Physics & Mechanics",
    bio: "Specializing in high school and university physics. Focused on building deep physical intuition, solving analytical problems, and mastering kinematics and electromagnetism for O/A-Levels and engineering entrance tests.",
    subjects: ["Physics", "Mechanics & Electromagnetism", "Mathematics"],
    targetStudentLevels: ["O-Levels / IGCSE", "A-Levels / FSc", "Undergraduate (University)"],
    teachingLanguages: ["English", "Urdu"],
    hourlyRate: 4200,
    currency: "PKR",
    sessionDurationMinutes: 60,
    rating: 4.88,
    reviewCount: 36,
    isVerified: true,
    isFavorite: false,
    profileVisibility: "public",
    verificationStatus: "verified",
    city: "Karachi",
    country: "Pakistan",
    timezone: "Asia/Karachi",
    availabilitySummary: "Flexible weekdays • 3 slots left",
    nextAvailableSlot: "Thursday at 06:00 PM",
    availableDays: ["tuesday", "thursday", "saturday"],
    availableTimesOfDay: ["evening"],
    teachingMode: "100% Online (1-on-1)",
    meetingProvider: "Google Meet",
    totalClassesTaught: 185,
    highlightBadge: "Cambridge Certified",
    responseSpeed: "Responds in ~1 hour",
    education: [
      {
        id: "edu_4",
        degree: "Ph.D. in Theoretical Physics",
        institution: "LUMS",
        completionYear: "2018",
      },
    ],
  },
  {
    id: "usr_teach_04",
    name: "Zainab Tariq",
    firstName: "Zainab",
    lastName: "Tariq",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    headline: "Organic & Physical Chemistry Tutor | Pre-Med Mentor",
    bio: "Helping students master organic reaction mechanisms, physical stoichiometry, and pre-med MCAT / MDCAT preparation through structured color-coded notes and active recall.",
    subjects: ["Chemistry", "Biology"],
    targetStudentLevels: ["Middle School (Grade 6-8)", "O-Levels / IGCSE", "A-Levels / FSc"],
    teachingLanguages: ["English", "Urdu"],
    hourlyRate: 3000,
    currency: "PKR",
    sessionDurationMinutes: 60,
    rating: 4.82,
    reviewCount: 27,
    isVerified: true,
    isFavorite: false,
    profileVisibility: "public",
    verificationStatus: "verified",
    city: "Rawalpindi",
    country: "Pakistan",
    timezone: "Asia/Karachi",
    availabilitySummary: "Weekend intensive batches",
    nextAvailableSlot: "Saturday at 11:30 AM",
    availableDays: ["saturday", "sunday"],
    availableTimesOfDay: ["morning", "afternoon"],
    teachingMode: "100% Online (1-on-1)",
    meetingProvider: "Google Meet",
    totalClassesTaught: 114,
    responseSpeed: "Responds in ~45 mins",
    education: [
      {
        id: "edu_5",
        degree: "M.Phil in Organic Chemistry",
        institution: "Punjab University",
        completionYear: "2021",
      },
    ],
  },
  {
    id: "usr_teach_05",
    name: "Hamza Farooq",
    firstName: "Hamza",
    lastName: "Farooq",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    headline: "Full-Stack Web Development & Python Mentor",
    bio: "Senior Software Engineer teaching hands-on React, Next.js, Python, and SQL. Fast-track your engineering skills with real production projects and portfolio building.",
    subjects: ["Web Development", "Python Programming", "Computer Science"],
    targetStudentLevels: ["Undergraduate (University)", "Adult Professional & Career Transition"],
    teachingLanguages: ["English", "Urdu"],
    hourlyRate: 4500,
    currency: "PKR",
    sessionDurationMinutes: 60,
    rating: 4.94,
    reviewCount: 52,
    isVerified: true,
    isFavorite: true,
    profileVisibility: "public",
    verificationStatus: "verified",
    city: "Lahore",
    country: "Pakistan",
    timezone: "Asia/Karachi",
    availabilitySummary: "Evenings & Weekends",
    nextAvailableSlot: "Friday at 08:00 PM",
    availableDays: ["wednesday", "friday", "saturday", "sunday"],
    availableTimesOfDay: ["evening"],
    teachingMode: "100% Online (1-on-1)",
    meetingProvider: "Google Meet",
    totalClassesTaught: 210,
    highlightBadge: "Popular",
    responseSpeed: "Responds in ~20 mins",
    education: [
      {
        id: "edu_6",
        degree: "B.S. Software Engineering",
        institution: "FAST NUCES",
        completionYear: "2019",
      },
    ],
  },
  {
    id: "usr_teach_06",
    name: "Mariam Al-Sayed",
    firstName: "Mariam",
    lastName: "Al-Sayed",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    headline: "Arabic & English Literature Instructor",
    bio: "Native Arabic speaker and certified ESL/Literature educator with 7 years of international school teaching experience. Specializes in conversational fluency, grammar mastery, and literary essay analysis.",
    subjects: ["English Literature"],
    targetStudentLevels: ["Middle School (Grade 6-8)", "O-Levels / IGCSE", "A-Levels / FSc", "Adult Professional & Career Transition"],
    teachingLanguages: ["English", "Arabic", "Urdu"],
    hourlyRate: 2500,
    currency: "PKR",
    sessionDurationMinutes: 60,
    rating: 4.90,
    reviewCount: 38,
    isVerified: true,
    isFavorite: false,
    profileVisibility: "public",
    verificationStatus: "verified",
    city: "Dubai / Islamabad",
    country: "Pakistan",
    timezone: "Asia/Dubai",
    availabilitySummary: "Weekday mornings",
    nextAvailableSlot: "Wednesday at 09:00 AM",
    availableDays: ["monday", "tuesday", "wednesday", "thursday"],
    availableTimesOfDay: ["morning"],
    teachingMode: "100% Online (1-on-1)",
    meetingProvider: "Google Meet",
    totalClassesTaught: 156,
    responseSpeed: "Responds in ~30 mins",
    education: [
      {
        id: "edu_7",
        degree: "M.A. in Comparative Literature",
        institution: "American University of Sharjah",
        completionYear: "2017",
      },
    ],
  },
  {
    id: "usr_teach_07",
    name: "Daniyal Khan",
    firstName: "Daniyal",
    lastName: "Khan",
    avatarUrl: undefined, // Demonstrates avatar fallback
    headline: "Machine Learning & Deep Learning Practitioner",
    bio: "AI researcher guiding university students through PyTorch, Scikit-Learn, computer vision, and NLP capstone projects. Focus on math foundations and practical model deployment.",
    subjects: ["Machine Learning", "Python Programming", "Computer Science", "Algorithms"],
    targetStudentLevels: ["Undergraduate (University)", "Adult Professional & Career Transition"],
    teachingLanguages: ["English", "Urdu"],
    hourlyRate: 5000,
    currency: "PKR",
    sessionDurationMinutes: 60,
    rating: undefined,
    reviewCount: undefined,
    isVerified: false,
    isFavorite: false,
    profileVisibility: "public",
    verificationStatus: "pending",
    city: "Peshawar",
    country: "Pakistan",
    timezone: "Asia/Karachi",
    availabilitySummary: "Evenings • New tutor",
    nextAvailableSlot: "Sunday at 05:00 PM",
    availableDays: ["saturday", "sunday"],
    availableTimesOfDay: ["evening"],
    teachingMode: "100% Online (1-on-1)",
    meetingProvider: "Google Meet",
    totalClassesTaught: 6,
    responseSpeed: "Responds in ~2 hours",
    education: [
      {
        id: "edu_8",
        degree: "M.S. in Data Science",
        institution: "NUST",
        completionYear: "2023",
      },
    ],
  },
  {
    id: "usr_teach_08",
    name: "Fatima Noor",
    firstName: "Fatima",
    lastName: "Noor",
    avatarUrl:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80",
    headline: "Cell Biology & Genetics Tutor for O/A-Levels & Pre-Med",
    bio: "Interactive diagrams, medical mnemonic techniques, and past-paper drills for Cambridge Biology and FSc pre-medical aspirants.",
    subjects: ["Biology", "Chemistry"],
    targetStudentLevels: ["Middle School (Grade 6-8)", "O-Levels / IGCSE", "A-Levels / FSc"],
    teachingLanguages: ["English", "Urdu"],
    hourlyRate: 2700,
    currency: "PKR",
    sessionDurationMinutes: 60,
    rating: 4.85,
    reviewCount: 31,
    isVerified: true,
    isFavorite: false,
    profileVisibility: "public",
    verificationStatus: "verified",
    city: "Faisalabad",
    country: "Pakistan",
    timezone: "Asia/Karachi",
    availabilitySummary: "Tuesday, Thursday & Sunday",
    nextAvailableSlot: "Tomorrow at 02:00 PM",
    availableDays: ["tuesday", "thursday", "sunday"],
    availableTimesOfDay: ["afternoon"],
    teachingMode: "100% Online (1-on-1)",
    meetingProvider: "Google Meet",
    totalClassesTaught: 128,
    responseSpeed: "Responds in ~30 mins",
    education: [
      {
        id: "edu_9",
        degree: "M.B.B.S Candidate / B.Sc. Biomedical Sciences",
        institution: "King Edward Medical University",
        completionYear: "2022",
      },
    ],
  },
  {
    id: "usr_teach_09",
    name: "Kashif Rehman",
    firstName: "Kashif",
    lastName: "Rehman",
    avatarUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    headline: "Certified Cambridge IGCSE Math & Mechanics Tutor",
    bio: "10+ years coaching students across UK, Middle East, and Pakistan. Known for patience, conceptual clarity, and structured homework feedback.",
    subjects: ["Mathematics", "Calculus", "Physics"],
    targetStudentLevels: ["O-Levels / IGCSE", "A-Levels / FSc"],
    teachingLanguages: ["English", "Urdu"],
    hourlyRate: 3200,
    currency: "PKR",
    sessionDurationMinutes: 60,
    rating: 4.97,
    reviewCount: 84,
    isVerified: true,
    isFavorite: false,
    profileVisibility: "public",
    verificationStatus: "verified",
    city: "Lahore",
    country: "Pakistan",
    timezone: "Asia/Karachi",
    availabilitySummary: "Weekdays 05:00 PM - 09:00 PM",
    nextAvailableSlot: "Friday at 05:00 PM",
    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    availableTimesOfDay: ["evening"],
    teachingMode: "100% Online (1-on-1)",
    meetingProvider: "Google Meet",
    totalClassesTaught: 420,
    highlightBadge: "Top Rated",
    responseSpeed: "Responds in ~10 mins",
    education: [
      {
        id: "edu_10",
        degree: "M.Sc. Mathematics",
        institution: "University of the Punjab",
        completionYear: "2014",
      },
    ],
  },
  {
    id: "usr_teach_10",
    name: "Sarah Ahmed",
    firstName: "Sarah",
    lastName: "Ahmed",
    avatarUrl:
      "https://images.unsplash.com/photo-1534751516642-a171edd25218?w=400&auto=format&fit=crop&q=80",
    headline: "IELTS & TOEFL Expert | Academic English Writing Coach",
    bio: "British Council certified trainer with 8+ years helping students achieve Band 7.5+ in IELTS Academic and General. Tailored speaking practice and essay grading with actionable feedback.",
    subjects: ["English Literature"],
    targetStudentLevels: ["A-Levels / FSc", "Undergraduate (University)", "Adult Professional & Career Transition"],
    teachingLanguages: ["English", "Urdu"],
    hourlyRate: 3400,
    currency: "PKR",
    sessionDurationMinutes: 60,
    rating: 4.92,
    reviewCount: 42,
    isVerified: true,
    isFavorite: false,
    profileVisibility: "public",
    verificationStatus: "verified",
    city: "Karachi",
    country: "Pakistan",
    timezone: "Asia/Karachi",
    availabilitySummary: "Daily morning & evening slots",
    nextAvailableSlot: "Tomorrow at 09:00 AM",
    availableDays: ["monday", "wednesday", "friday", "saturday"],
    availableTimesOfDay: ["morning", "evening"],
    teachingMode: "100% Online (1-on-1)",
    meetingProvider: "Google Meet",
    totalClassesTaught: 275,
    highlightBadge: "Super Tutor",
    responseSpeed: "Responds in ~25 mins",
    education: [
      {
        id: "edu_11",
        degree: "M.A. English Linguistics",
        institution: "University of Karachi",
        completionYear: "2017",
      },
    ],
  },
  {
    id: "usr_teach_11",
    name: "Taimoor Hassan",
    firstName: "Taimoor",
    lastName: "Hassan",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    headline: "Data Science & Python Programming Mentor",
    bio: "Ex-fintech Data Analyst helping students and professionals master Pandas, NumPy, SQL, and data visualization. Practical project-based learning with real datasets.",
    subjects: ["Python Programming", "Computer Science", "Statistics & Probability"],
    targetStudentLevels: ["Undergraduate (University)", "Adult Professional & Career Transition"],
    teachingLanguages: ["English", "Urdu"],
    hourlyRate: 3800,
    currency: "PKR",
    sessionDurationMinutes: 60,
    rating: 4.89,
    reviewCount: 29,
    isVerified: true,
    isFavorite: false,
    profileVisibility: "public",
    verificationStatus: "verified",
    city: "Islamabad",
    country: "Pakistan",
    timezone: "Asia/Karachi",
    availabilitySummary: "Weekday nights & weekends",
    nextAvailableSlot: "Saturday at 04:00 PM",
    availableDays: ["tuesday", "thursday", "saturday", "sunday"],
    availableTimesOfDay: ["afternoon", "evening"],
    teachingMode: "100% Online (1-on-1)",
    meetingProvider: "Google Meet",
    totalClassesTaught: 160,
    responseSpeed: "Responds in ~40 mins",
    education: [
      {
        id: "edu_12",
        degree: "B.S. Computer Science",
        institution: "GIKI",
        completionYear: "2020",
      },
    ],
  },
  {
    id: "usr_teach_12",
    name: "Hina Qureshi",
    firstName: "Hina",
    lastName: "Qureshi",
    avatarUrl:
      "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&auto=format&fit=crop&q=80",
    headline: "Primary & Middle School General Science & Math Specialist",
    bio: "Hello! I am Hina Qureshi, a certified STEM educator with over 5 years of dedicated experience mentoring young students across Pakistan and abroad.\n\nMy teaching philosophy revolves around patience, interactive visual whiteboards, and real-world examples that make Mathematics and Science enjoyable rather than intimidating. Whether your child needs help with core school curricula, exam revision, or building foundational math skills, every 1-on-1 session is customized to their exact learning pace with regular progress reports for parents.",
    subjects: ["Mathematics", "Biology", "Physics"],
    targetStudentLevels: ["Middle School (Grade 6-8)"],
    teachingLanguages: ["English", "Urdu"],
    hourlyRate: 2200,
    currency: "PKR",
    sessionDurationMinutes: 60,
    rating: 4.98,
    reviewCount: 56,
    isVerified: true,
    isFavorite: false,
    profileVisibility: "public",
    verificationStatus: "verified",
    city: "Lahore",
    country: "Pakistan",
    timezone: "Asia/Karachi",
    availabilitySummary: "Afternoon slots (03:00 PM - 06:00 PM)",
    nextAvailableSlot: "Today at 03:30 PM",
    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    availableTimesOfDay: ["afternoon"],
    teachingMode: "100% Online (1-on-1)",
    meetingProvider: "Google Meet",
    totalClassesTaught: 340,
    highlightBadge: "Popular",
    responseSpeed: "Responds in ~15 mins",
    introVideoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    videoThumbnailUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&auto=format&fit=crop&q=80",
    education: [
      {
        id: "edu_13",
        degree: "B.Ed. Elementary Education (Honours)",
        institution: "University of Education, Lahore",
        fieldOfStudy: "STEM & Child Psychology",
        completionYear: "2018",
      },
      {
        id: "edu_14",
        degree: "Higher Secondary Certificate (FSc Pre-Medical)",
        institution: "Lahore College for Women University",
        completionYear: "2014",
      },
    ],
    experience: [
      {
        id: "exp_12_1",
        role: "Lead Middle School STEM Teacher",
        institution: "Beaconhouse School System",
        duration: "2019 - 2023 (4 yrs)",
        description: "Designed hands-on interactive math & science curricula for 150+ students with 94% grade improvement.",
      },
      {
        id: "exp_12_2",
        role: "Senior Online 1-on-1 STEM Mentor",
        institution: "ZuhDemy Tutoring Marketplace",
        duration: "2023 - Present (1 yr)",
        description: "Delivering individualized private lessons in General Science and Mathematics.",
      },
    ],
    certificates: [
      {
        id: "cert_12_1",
        title: "Cambridge Primary & Lower Secondary Certified Instructor",
        issuer: "Cambridge Assessment International Education",
        year: "2021",
        isVerified: true,
      },
      {
        id: "cert_12_2",
        title: "Interactive Digital STEM Pedagogy",
        issuer: "STEM Education Institute",
        year: "2022",
        isVerified: true,
      },
    ],
  },
];

// ============================================================================
// DATA PROVIDER IMPLEMENTATION
// ============================================================================
class MockTeacherDataProvider implements TeacherDataProvider {
  public name = "mock" as const;
  private teachers: Teacher[] = JSON.parse(JSON.stringify(SEED_TEACHERS));
  private favoritesCache: Set<string> = new Set(["usr_teach_01", "usr_teach_05"]);

  constructor() {
    this.teachers.forEach((t) => {
      t.isFavorite = this.favoritesCache.has(t.id);
    });
  }

  async fetchTeachers(
    filters: TeacherFilterState,
    sort: TeacherSortOption,
    pagination: PaginationParams
  ): Promise<TeacherQueryResult> {
    let allTeachers = [...this.teachers];
    try {
      const dbTeachers = await getPublicTeachersListAction();
      if (dbTeachers && dbTeachers.length > 0) {
        const existingIds = new Set(allTeachers.map((t) => t.id));
        const newFromDb = dbTeachers.filter((t) => !existingIds.has(t.id));
        allTeachers = [...newFromDb, ...allTeachers];
      }
    } catch (err) {
      console.warn("Notice: Real db teachers fetch fallback:", err);
    }

    // 1. Filter
    let filtered = allTeachers.filter((teacher) => {
      // Search query (case-insensitive, trimmed)
      if (filters.search && filters.search.trim() !== "") {
        const q = filters.search.trim().toLowerCase();
        const matchesName = teacher.name.toLowerCase().includes(q);
        const matchesHeadline = teacher.headline.toLowerCase().includes(q);
        const matchesBio = (teacher.bio || "").toLowerCase().includes(q);
        const matchesSubject = teacher.subjects.some((s) => s.toLowerCase().includes(q));
        const matchesLocation = `${teacher.city || ""} ${teacher.country || ""}`.toLowerCase().includes(q);
        const matchesEducation = (teacher.education || []).some(
          (edu) =>
            edu.degree.toLowerCase().includes(q) ||
            edu.institution.toLowerCase().includes(q)
        );

        if (!matchesName && !matchesHeadline && !matchesBio && !matchesSubject && !matchesLocation && !matchesEducation) {
          return false;
        }
      }

      // Subject filter
      if (filters.subjects && filters.subjects.length > 0) {
        const hasMatchingSubject = teacher.subjects.some((sub) =>
          filters.subjects.includes(sub)
        );
        if (!hasMatchingSubject) return false;
      }

      // Student level filter
      if (filters.studentLevels && filters.studentLevels.length > 0) {
        const hasMatchingLevel = teacher.targetStudentLevels.some((lvl) =>
          filters.studentLevels.includes(lvl)
        );
        if (!hasMatchingLevel) return false;
      }

      // Price filter
      if (filters.minPrice !== undefined && teacher.hourlyRate < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && teacher.hourlyRate > filters.maxPrice) {
        return false;
      }

      // Rating filter
      if (filters.minRating !== undefined && filters.minRating > 0) {
        if (!teacher.rating || teacher.rating < filters.minRating) {
          return false;
        }
      }

      // Teaching language filter
      if (filters.teachingLanguages && filters.teachingLanguages.length > 0) {
        const hasMatchingLang = teacher.teachingLanguages.some((lang) =>
          filters.teachingLanguages.includes(lang)
        );
        if (!hasMatchingLang) return false;
      }

      // Schedule filter (weekdays vs weekends)
      if (filters.scheduleType && filters.scheduleType !== "all") {
        const teacherDays = teacher.availableDays || [];
        const isWeekend = teacherDays.some((d) => d === "saturday" || d === "sunday");
        const isWeekday = teacherDays.some((d) => d !== "saturday" && d !== "sunday");

        if (filters.scheduleType === "weekdays" && !isWeekday) return false;
        if (filters.scheduleType === "weekends" && !isWeekend) return false;
      }

      // Day of week filter
      if (filters.availableDays && filters.availableDays.length > 0) {
        const teacherDays = teacher.availableDays || [];
        const matchesDay = filters.availableDays.some((d) => teacherDays.includes(d));
        if (!matchesDay) return false;
      }

      // Time of day filter (morning, afternoon, evening)
      if (filters.availableTimesOfDay && filters.availableTimesOfDay.length > 0) {
        const teacherTimes = teacher.availableTimesOfDay || [];
        const matchesTime = filters.availableTimesOfDay.some((t) => teacherTimes.includes(t));
        if (!matchesTime) return false;
      }

      return true;
    });

    // 2. Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.hourlyRate - b.hourlyRate;
        case "price-desc":
          return b.hourlyRate - a.hourlyRate;
        case "rating-desc": {
          const rA = a.rating ?? -1;
          const rB = b.rating ?? -1;
          return rB - rA;
        }
        case "reviews-desc": {
          const revA = a.reviewCount ?? 0;
          const revB = b.reviewCount ?? 0;
          return revB - revA;
        }
        case "relevance":
        default: {
          if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
          const taughtDiff = (b.totalClassesTaught || 0) - (a.totalClassesTaught || 0);
          if (taughtDiff !== 0) return taughtDiff;
          return (b.rating || 0) - (a.rating || 0);
        }
      }
    });

    // 3. Paginate
    const totalCount = filtered.length;
    const page = Math.max(1, pagination.page);
    const pageSize = Math.max(1, pagination.pageSize);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const startIndex = (page - 1) * pageSize;
    const paginatedTeachers = filtered.slice(startIndex, startIndex + pageSize);

    const finalizedTeachers = paginatedTeachers.map((t) => ({
      ...t,
      isFavorite: this.favoritesCache.has(t.id),
    }));

    return {
      teachers: finalizedTeachers,
      totalCount,
      page,
      pageSize,
      totalPages,
      appliedFilters: { ...filters },
      sort,
      dataSource: "mock",
    };
  }

  async fetchTeacherById(id: string): Promise<Teacher | null> {
    try {
      const fromDb = await getPublicTeacherByIdAction(id);
      if (fromDb) {
        return {
          ...(fromDb as any),
          isFavorite: this.favoritesCache.has(fromDb.id),
        };
      }
    } catch (err) {
      console.warn("Notice: fetchTeacherById db query error:", err);
    }

    const found = this.teachers.find((t) => t.id === id);
    if (!found) return null;
    return {
      ...found,
      isFavorite: this.favoritesCache.has(found.id),
    };
  }

  async fetchFavoriteTeachers(): Promise<Teacher[]> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    return this.teachers
      .filter((t) => this.favoritesCache.has(t.id))
      .map((t) => ({
        ...t,
        isFavorite: true,
      }));
  }

  async toggleFavorite(teacherId: string, currentStatus: boolean): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const newStatus = !currentStatus;
    if (newStatus) {
      this.favoritesCache.add(teacherId);
    } else {
      this.favoritesCache.delete(teacherId);
    }

    const t = this.teachers.find((item) => item.id === teacherId);
    if (t) {
      t.isFavorite = newStatus;
    }

    return newStatus;
  }

  async getFilterCatalogs(): Promise<FilterCatalogs> {
    const rates = this.teachers.map((t) => t.hourlyRate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);

    return {
      subjects: AVAILABLE_SUBJECTS,
      studentLevels: AVAILABLE_STUDENT_LEVELS,
      languages: AVAILABLE_LANGUAGES,
      priceRange: { min: Math.floor(min / 500) * 500, max: Math.ceil(max / 500) * 500 },
    };
  }
}

// ============================================================================
// REAL SUPABASE / POSTGRES DATA PROVIDER
// ============================================================================
export class SupabaseTeacherDataProvider implements TeacherDataProvider {
  name: "supabase" = "supabase";

  async fetchTeachers(
    filters: TeacherFilterState,
    sort: TeacherSortOption,
    pagination: PaginationParams
  ): Promise<TeacherQueryResult> {
    const res = await searchPublicTeachersAction(filters, sort, pagination);
    try {
      const { getStudentFavoriteTeacherIdsAction } = await import("@/app/actions/student");
      const favRes = await getStudentFavoriteTeacherIdsAction();
      if (favRes.success && favRes.favoriteIds.length > 0) {
        const favSet = new Set(favRes.favoriteIds);
        res.teachers.forEach((t) => {
          t.isFavorite = favSet.has(t.id);
        });
      }
    } catch {}
    return res;
  }

  async fetchTeacherById(id: string): Promise<Teacher | null> {
    const teacher = await getPublicTeacherByIdAction(id);
    if (teacher) {
      try {
        const { getStudentFavoriteTeacherIdsAction } = await import("@/app/actions/student");
        const favRes = await getStudentFavoriteTeacherIdsAction();
        if (favRes.success && favRes.favoriteIds.includes(teacher.id)) {
          teacher.isFavorite = true;
        }
      } catch {}
    }
    return teacher;
  }

  async fetchFavoriteTeachers(): Promise<Teacher[]> {
    try {
      const { getStudentFavoriteTeachersAction } = await import("@/app/actions/student");
      const res = await getStudentFavoriteTeachersAction();
      if (res.success && res.teachers) {
        return res.teachers;
      }
    } catch (err) {
      console.warn("fetchFavoriteTeachers error:", err);
    }
    return [];
  }

  async toggleFavorite(teacherId: string, currentStatus: boolean): Promise<boolean> {
    try {
      const { toggleFavoriteTeacherAction } = await import("@/app/actions/student");
      const res = await toggleFavoriteTeacherAction(teacherId);
      if (res.success && res.isFavorited !== undefined) {
        return res.isFavorited;
      }
    } catch (err) {
      console.warn("toggleFavorite error:", err);
    }
    return !currentStatus;
  }

  async getFilterCatalogs(): Promise<FilterCatalogs> {
    return await getPublicTeacherFilterCatalogsAction();
  }
}

// ============================================================================
// SINGLETON SERVICE INSTANCE
// Default to real Supabase PostgreSQL data provider
// ============================================================================
let activeProvider: TeacherDataProvider = new SupabaseTeacherDataProvider();

export function setTeacherDataProvider(provider: TeacherDataProvider) {
  activeProvider = provider;
}

export function getActiveDataProviderName(): string {
  return activeProvider.name;
}

export async function getTeachers(
  filters: TeacherFilterState,
  sort: TeacherSortOption = "relevance",
  pagination: PaginationParams = { page: 1, pageSize: 6 }
): Promise<TeacherQueryResult> {
  return activeProvider.fetchTeachers(filters, sort, pagination);
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  return activeProvider.fetchTeacherById(id);
}

export async function getFavoriteTeachers(): Promise<Teacher[]> {
  return activeProvider.fetchFavoriteTeachers();
}

export async function toggleFavorite(
  teacherId: string,
  currentStatus: boolean
): Promise<boolean> {
  return activeProvider.toggleFavorite(teacherId, currentStatus);
}

export async function getTeacherFilterCatalogs(): Promise<FilterCatalogs> {
  return activeProvider.getFilterCatalogs();
}
