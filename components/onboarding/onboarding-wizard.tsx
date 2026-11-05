"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Phone,
  MapPin,
  User,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Loader2,
  AlertCircle,
  Check,
  Target,
  Sparkles,
  School,
  Award,
  Plus,
  Trash2,
  Edit2,
  X,
  BookOpen,
  Sliders,
  DollarSign,
  Video,
  Languages,
  Calendar,
} from "lucide-react";

// Shadcn UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import { createClient } from "@/utils/supabase/client";
import {
  completeOnboardingAction,
  StudentOnboardingData,
  TeacherOnboardingData,
} from "@/app/actions/onboarding";
import { EducationEntry, ExperienceEntry, CertificateEntry } from "@/db/schema";

const POPULAR_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Accounting",
  "Economics",
  "Business Studies",
  "Urdu",
  "Pak Studies",
  "Islamiat",
];

const EXTENDED_ACADEMIC_SUBJECTS = [
  { category: "🧪 Pure & Applied Sciences", items: ["Mathematics", "Additional Mathematics", "Physics", "Chemistry", "Biology", "Environmental Management"] },
  { category: "💻 Tech & Computing", items: ["Computer Science", "Information Technology", "Coding & Python", "AI & Data"] },
  { category: "📊 Business & Commerce", items: ["Accounting", "Economics", "Business Studies", "Commerce", "Finance"] },
  { category: "📚 Languages & Humanities", items: ["English Language", "English Literature", "Urdu", "Pakistan Studies", "Islamiat", "Sociology", "Psychology"] },
];

const STUDENT_ACADEMIC_LEVELS = [
  { id: "O-Levels", label: "O-Levels / IGCSE", sub: "Grades 9 - 11" },
  { id: "A-Levels", label: "A-Levels", sub: "Years 12 - 13" },
  { id: "Matric", label: "Matriculation (SSC)", sub: "Board Exams" },
  { id: "FSc", label: "FSc / Inter (HSSC)", sub: "Pre-Med & Pre-Eng" },
  { id: "MDCAT_ECAT", label: "Entry Test Prep", sub: "MDCAT, ECAT, SAT" },
  { id: "MiddleSchool", label: "Middle School", sub: "Grades 6 - 8" },
];

const STUDENT_GOAL_OPTIONS = [
  { id: "straight_as", label: "🎯 Aiming for Straight A/A*s", sub: "Top grade academic excellence" },
  { id: "past_papers", label: "📝 Past Paper & Exam Technique", sub: "Solving topical & yearly papers" },
  { id: "entry_test", label: "🚀 University Entry Test Prep", sub: "MDCAT, ECAT, NET, SAT drills" },
  { id: "concept_gaps", label: "💡 Concept Clarity & Basics", sub: "Clear weak foundation doubts" },
  { id: "crash_course", label: "⚡ Rapid Exam Revision", sub: "Fast-paced syllabus coverage" },
  { id: "homework_help", label: "📚 Homework & Weekly Support", sub: "Ongoing test preparation" },
];

const TEACHER_STUDENT_LEVELS = [
  "Primary (1-5)",
  "Middle School (6-8)",
  "O-Levels / IGCSE",
  "A-Levels",
  "Matric (SSC)",
  "FSc / Inter",
  "University / Undergrad",
  "MDCAT / ECAT / Entry Test",
];

const TEACHER_LANGUAGES = ["English", "Urdu", "Punjabi", "Sindhi", "Pashto", "Arabic"];

const PAKISTAN_CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Peshawar",
  "Multan",
  "Sialkot",
  "Gujranwala",
  "Quetta",
];

const PRESET_HOURLY_RATES = [1500, 2500, 3500, 5000];

export function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Role detection
  const initialRoleParam = searchParams.get("role") === "teacher" ? "teacher" : "student";
  const [role, setRole] = useState<"student" | "teacher">(initialRoleParam);
  const [currentStep, setCurrentStep] = useState(1);

  // Total steps: Teacher has 6 dedicated sections, Student has 3
  const totalSteps = role === "teacher" ? 6 : 3;

  // Global & Auth state
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Common Fields
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Lahore");

  // Student Specific State
  const [academicLevel, setAcademicLevel] = useState("O-Levels");
  const [institution, setInstitution] = useState("");
  const [targetExamYear, setTargetExamYear] = useState("2026");
  const [studentSubjects, setStudentSubjects] = useState<string[]>(["Mathematics", "Physics"]);
  const [studentGoals, setStudentGoals] = useState<string[]>([
    "🎯 Aiming for Straight A/A*s",
    "📝 Past Paper & Exam Technique",
  ]);
  const [preferredLearningFormat, setPreferredLearningFormat] = useState("1-on-1 Focused Session");
  const [customGoalNote, setCustomGoalNote] = useState("");

  // Teacher Section 1: Professional Heading
  const [headline, setHeadline] = useState("");

  // Teacher Section 2: Education (Multiple Degrees)
  const [educationList, setEducationList] = useState<EducationEntry[]>([
    {
      id: "edu-1",
      degree: "B.Sc. in Computer Science",
      institution: "LUMS (Lahore University of Management Sciences)",
      fieldOfStudy: "Computer Science",
      completionYear: "2023",
    },
  ]);
  const [isAddingEdu, setIsAddingEdu] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduDegree, setEduDegree] = useState("");
  const [eduInstitution, setEduInstitution] = useState("");
  const [eduField, setEduField] = useState("");
  const [eduYear, setEduYear] = useState("2024");

  // Teacher Section 3: Certifications (Multiple Certificates)
  const [certificatesList, setCertificatesList] = useState<CertificateEntry[]>([]);
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certYear, setCertYear] = useState("2023");

  // Teacher Section 4: Experience (Multiple Roles)
  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>([
    {
      id: "exp-1",
      role: "Senior O/A-Level Tutor",
      institution: "Beaconhouse School System",
      duration: "3+ Years",
      description: "Mentored students with personalized lesson plans, concept derivations, and extensive CAIE past paper mastery.",
    },
  ]);
  const [experienceYears, setExperienceYears] = useState("3-5 Years");
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expRole, setExpRole] = useState("");
  const [expInstitution, setExpInstitution] = useState("");
  const [expDuration, setExpDuration] = useState("");
  const [expDescription, setExpDescription] = useState("");

  // Teacher Section 5: Academic Subjects & Topics
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([
    "Mathematics",
    "Physics",
  ]);
  const [customTopics, setCustomTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [teacherLevels, setTeacherLevels] = useState<string[]>([
    "O-Levels / IGCSE",
    "A-Levels",
  ]);

  // Teacher Section 6: Preferences
  const [hourlyRatePKR, setHourlyRatePKR] = useState(2500);
  const [teachingLanguages, setTeachingLanguages] = useState<string[]>(["English", "Urdu"]);
  const [teachingMode, setTeachingMode] = useState("100% Online (1-on-1)");
  const [meetingProvider, setMeetingProvider] = useState("Google Meet");
  const [bio, setBio] = useState("");
  const [teacherMethodology, setTeacherMethodology] = useState("");

  // Load active user session on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          if (user.user_metadata?.full_name) {
            setUserName(user.user_metadata.full_name);
          }
          if (user.email) {
            setUserEmail(user.email);
          }
          if (user.user_metadata?.role) {
            setRole(user.user_metadata.role);
          }
          if (user.user_metadata?.phone) {
            setPhone(user.user_metadata.phone);
          }
          if (user.user_metadata?.city) {
            setCity(user.user_metadata.city);
          }
          if (user.user_metadata?.headline) {
            setHeadline(user.user_metadata.headline);
          }
          if (user.user_metadata?.bio) {
            setBio(user.user_metadata.bio);
          }
        }
      } catch (err) {
        console.warn("Could not fetch user session:", err);
      }
    }
    loadUser();
  }, []);

  // Sync role if url query changes
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "teacher") {
      setRole("teacher");
    } else if (roleParam === "student") {
      setRole("student");
    }
  }, [searchParams]);

  // -------------------------------------------------------------
  // Helpers for Education Section
  // -------------------------------------------------------------
  const startAddEducation = () => {
    setEditingEduId(null);
    setEduDegree("");
    setEduInstitution("");
    setEduField("");
    setEduYear("2024");
    setIsAddingEdu(true);
  };

  const startEditEducation = (edu: EducationEntry) => {
    setEditingEduId(edu.id);
    setEduDegree(edu.degree);
    setEduInstitution(edu.institution);
    setEduField(edu.fieldOfStudy || "");
    setEduYear(edu.completionYear || "2024");
    setIsAddingEdu(true);
  };

  const handleSaveEducation = () => {
    if (!eduDegree.trim() || !eduInstitution.trim()) {
      setErrorMessage("Please specify both degree title and awarding institution.");
      return;
    }
    setErrorMessage(null);

    if (editingEduId) {
      setEducationList((prev) =>
        prev.map((item) =>
          item.id === editingEduId
            ? {
                ...item,
                degree: eduDegree.trim(),
                institution: eduInstitution.trim(),
                fieldOfStudy: eduField.trim() || eduDegree.trim(),
                completionYear: eduYear.trim(),
              }
            : item
        )
      );
    } else {
      const newEntry: EducationEntry = {
        id: `edu-${Date.now()}`,
        degree: eduDegree.trim(),
        institution: eduInstitution.trim(),
        fieldOfStudy: eduField.trim() || eduDegree.trim(),
        completionYear: eduYear.trim(),
      };
      setEducationList((prev) => [...prev, newEntry]);
    }
    setIsAddingEdu(false);
    setEditingEduId(null);
  };

  const handleDeleteEducation = (id: string) => {
    setEducationList((prev) => prev.filter((item) => item.id !== id));
  };

  // -------------------------------------------------------------
  // Helpers for Certifications Section
  // -------------------------------------------------------------
  const startAddCertificate = () => {
    setEditingCertId(null);
    setCertTitle("");
    setCertIssuer("");
    setCertYear("2023");
    setIsAddingCert(true);
  };

  const startEditCertificate = (cert: CertificateEntry) => {
    setEditingCertId(cert.id);
    setCertTitle(cert.title);
    setCertIssuer(cert.issuer);
    setCertYear(cert.year || "2023");
    setIsAddingCert(true);
  };

  const handleSaveCertificate = () => {
    if (!certTitle.trim() || !certIssuer.trim()) {
      setErrorMessage("Please enter both certificate title and issuing authority.");
      return;
    }
    setErrorMessage(null);

    if (editingCertId) {
      setCertificatesList((prev) =>
        prev.map((item) =>
          item.id === editingCertId
            ? {
                ...item,
                title: certTitle.trim(),
                issuer: certIssuer.trim(),
                year: certYear.trim(),
              }
            : item
        )
      );
    } else {
      const newEntry: CertificateEntry = {
        id: `cert-${Date.now()}`,
        title: certTitle.trim(),
        issuer: certIssuer.trim(),
        year: certYear.trim(),
        isVerified: true,
      };
      setCertificatesList((prev) => [...prev, newEntry]);
    }
    setIsAddingCert(false);
    setEditingCertId(null);
  };

  const handleDeleteCertificate = (id: string) => {
    setCertificatesList((prev) => prev.filter((item) => item.id !== id));
  };

  // -------------------------------------------------------------
  // Helpers for Experience Section
  // -------------------------------------------------------------
  const startAddExperience = () => {
    setEditingExpId(null);
    setExpRole("");
    setExpInstitution("");
    setExpDuration("2 Years");
    setExpDescription("");
    setIsAddingExp(true);
  };

  const startEditExperience = (exp: ExperienceEntry) => {
    setEditingExpId(exp.id);
    setExpRole(exp.role);
    setExpInstitution(exp.institution);
    setExpDuration(exp.duration || "");
    setExpDescription(exp.description || "");
    setIsAddingExp(true);
  };

  const handleSaveExperience = () => {
    if (!expRole.trim() || !expInstitution.trim()) {
      setErrorMessage("Please enter the teaching role and institution/organization name.");
      return;
    }
    setErrorMessage(null);

    if (editingExpId) {
      setExperienceList((prev) =>
        prev.map((item) =>
          item.id === editingExpId
            ? {
                ...item,
                role: expRole.trim(),
                institution: expInstitution.trim(),
                duration: expDuration.trim(),
                description: expDescription.trim(),
              }
            : item
        )
      );
    } else {
      const newEntry: ExperienceEntry = {
        id: `exp-${Date.now()}`,
        role: expRole.trim(),
        institution: expInstitution.trim(),
        duration: expDuration.trim() || "1 Year",
        description: expDescription.trim(),
      };
      setExperienceList((prev) => [...prev, newEntry]);
    }
    setIsAddingExp(false);
    setEditingExpId(null);
  };

  const handleDeleteExperience = (id: string) => {
    setExperienceList((prev) => prev.filter((item) => item.id !== id));
  };

  // -------------------------------------------------------------
  // Helpers for Subjects & Topics Section
  // -------------------------------------------------------------
  const toggleTeacherSubject = (sub: string) => {
    setTeacherSubjects((prev) =>
      prev.includes(sub) ? prev.filter((item) => item !== sub) : [...prev, sub]
    );
  };

  const handleAddCustomTopic = () => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;
    if (!customTopics.includes(trimmed) && !teacherSubjects.includes(trimmed)) {
      setCustomTopics((prev) => [...prev, trimmed]);
    }
    setTopicInput("");
  };

  const handleRemoveCustomTopic = (topic: string) => {
    setCustomTopics((prev) => prev.filter((t) => t !== topic));
  };

  const toggleTeacherLevel = (lvl: string) => {
    setTeacherLevels((prev) =>
      prev.includes(lvl) ? prev.filter((item) => item !== lvl) : [...prev, lvl]
    );
  };

  const toggleTeachingLanguage = (lang: string) => {
    setTeachingLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  // Student Helpers
  const toggleStudentSubject = (sub: string) => {
    setStudentSubjects((prev) =>
      prev.includes(sub) ? prev.filter((item) => item !== sub) : [...prev, sub]
    );
  };

  const toggleStudentGoal = (goalLabel: string) => {
    setStudentGoals((prev) =>
      prev.includes(goalLabel)
        ? prev.filter((g) => g !== goalLabel)
        : [...prev, goalLabel]
    );
  };

  // -------------------------------------------------------------
  // Step Validation
  // -------------------------------------------------------------
  const validateStep = (): boolean => {
    setErrorMessage(null);

    // ==========================================
    // TEACHER FLOW (6 Steps)
    // ==========================================
    if (role === "teacher") {
      if (currentStep === 1) {
        if (!userName.trim()) {
          setErrorMessage("Please enter your full name.");
          return false;
        }
        if (!phone.trim()) {
          setErrorMessage("Please enter a valid WhatsApp or contact phone number.");
          return false;
        }
        if (!city.trim()) {
          setErrorMessage("Please enter your current city.");
          return false;
        }
        if (!headline.trim()) {
          setErrorMessage("Please provide a professional headline (e.g., 'Cambridge A-Level Physics Specialist').");
          return false;
        }
      } else if (currentStep === 2) {
        if (educationList.length === 0) {
          setErrorMessage("Please add at least one degree or academic qualification.");
          return false;
        }
      } else if (currentStep === 3) {
        // Certifications are optional, but if the user has opened the add form without saving:
        if (isAddingCert && (certTitle.trim() || certIssuer.trim())) {
          setErrorMessage("Please click 'Save Certificate' or 'Cancel' before proceeding.");
          return false;
        }
      } else if (currentStep === 4) {
        // Experience is recommended
        if (isAddingExp && (expRole.trim() || expInstitution.trim())) {
          setErrorMessage("Please click 'Save Experience' or 'Cancel' before proceeding.");
          return false;
        }
      } else if (currentStep === 5) {
        if (teacherSubjects.length === 0 && customTopics.length === 0) {
          setErrorMessage("Please select at least one subject or topic you tutor on ZuhDemy.");
          return false;
        }
        if (teacherLevels.length === 0) {
          setErrorMessage("Please select at least one eligible student level.");
          return false;
        }
      } else if (currentStep === 6) {
        if (!hourlyRatePKR || hourlyRatePKR < 500) {
          setErrorMessage("Please set a realistic hourly rate (minimum 500 PKR).");
          return false;
        }
        if (bio.trim().length < 40) {
          setErrorMessage("Please write at least 40 characters in your Bio to introduce your background to prospective students.");
          return false;
        }
      }
      return true;
    }

    // ==========================================
    // STUDENT FLOW (3 Steps)
    // ==========================================
    if (currentStep === 1) {
      if (!phone.trim()) {
        setErrorMessage("Please enter a valid WhatsApp or contact phone number.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!institution.trim()) {
        setErrorMessage("Please enter your current School or College name.");
        return false;
      }
      if (studentSubjects.length === 0) {
        setErrorMessage("Please select at least one subject you want tutoring in.");
        return false;
      }
    } else if (currentStep === 3) {
      if (studentGoals.length === 0) {
        setErrorMessage("Please choose at least one learning goal.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        handleSubmitFinal();
      }
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // -------------------------------------------------------------
  // Final Submission
  // -------------------------------------------------------------
  const handleSubmitFinal = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let result;
      if (role === "student") {
        const studentPayload: StudentOnboardingData = {
          role: "student",
          fullName: userName.trim() || undefined,
          phone,
          city,
          academicLevel,
          institution: institution.trim(),
          targetExamYear,
          subjects: studentSubjects,
          primaryGoals: studentGoals,
          preferredLearningFormat,
          customNote: customGoalNote || undefined,
        };
        result = await completeOnboardingAction(studentPayload);
      } else {
        const allSubjects = Array.from(new Set([...teacherSubjects, ...customTopics]));
        const teacherPayload: TeacherOnboardingData = {
          role: "teacher",
          fullName: userName.trim() || undefined,
          phone: phone.trim(),
          city: city.trim(),
          headline: headline.trim() || "Expert Instructor on ZuhDemy",
          subjects: allSubjects,
          studentLevels: teacherLevels,
          languages: teachingLanguages,
          hourlyRatePKR: Number(hourlyRatePKR) || 2500,
          experienceYears,
          bio: bio.trim(),
          education: educationList,
          certificates: certificatesList,
          experience: experienceList,
          // Legacy single fields for backwards compatibility
          degree: educationList[0]?.degree || "",
          institution: educationList[0]?.institution || "",
          completionYear: educationList[0]?.completionYear || "2024",
          fieldOfStudy: educationList[0]?.fieldOfStudy || "",
          teachingMethodology: teacherMethodology.trim() || bio.trim(),
          teachingMode,
          meetingProvider,
        };
        result = await completeOnboardingAction(teacherPayload);
      }

      if (!result.success) {
        setErrorMessage(result.error || "Failed to save profile. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const destination = role === "teacher" ? "/teacher/profile" : "/student";
      router.push(destination);
      router.refresh();
    } catch (err: unknown) {
      console.error("Onboarding error:", err);
      setErrorMessage("Network issue occurred while saving your profile. Please retry.");
      setIsSubmitting(false);
    }
  };

  const progressPercent = (currentStep / totalSteps) * 100;

  // Step Titles and Descriptions
  const teacherStepInfo = [
    {
      title: "Personal Info & Headline",
      subtitle: "Introduce yourself, confirm contact details, and craft a catchy professional headline.",
      badge: "Step 1 of 6",
    },
    {
      title: "Education & Degrees",
      subtitle: "Add your university degrees, colleges, or formal academic qualifications. You can add multiple degrees.",
      badge: "Step 2 of 6",
    },
    {
      title: "Certifications & Credentials",
      subtitle: "Showcase verified teaching licenses, language certifications (e.g. IELTS), or test accreditations.",
      badge: "Step 3 of 6",
    },
    {
      title: "Teaching Experience",
      subtitle: "Add prior school, coaching academy, university faculty, or private tutoring experience.",
      badge: "Step 4 of 6",
    },
    {
      title: "Select all academic subjects and topics you tutor on ZuhDemy",
      subtitle: "Pick curriculum subjects you teach and add specialized topics or exam prep focus areas.",
      badge: "Step 5 of 6",
    },
    {
      title: "Rates & Teaching Preferences",
      subtitle: "Set your hourly tuition fee, delivery mode, and share your teaching methodology.",
      badge: "Step 6 of 6",
    },
  ];

  const studentStepInfo = [
    {
      title: "Contact & Identity",
      subtitle: "Confirm your phone and location for instant lesson alerts.",
      badge: "Step 1 of 3",
    },
    {
      title: "School & Subjects",
      subtitle: "Tell us your current school or college and the subjects you need help with.",
      badge: "Step 2 of 3",
    },
    {
      title: "Learning Goals & Format",
      subtitle: "Pick your target exam series and preferred tutoring format.",
      badge: "Step 3 of 3",
    },
  ];

  const currentInfo = role === "teacher" ? teacherStepInfo[currentStep - 1] : studentStepInfo[currentStep - 1];

  return (
    <div className="min-h-screen w-full bg-[#FCFBF8] text-[#172033] flex flex-col justify-between antialiased selection:bg-orange-100 selection:text-orange-900">
      {/* =================================================================== */}
      {/* TOP NAVBAR                                                          */}
      {/* =================================================================== */}
      <header className="sticky top-0 h-16 w-full border-b border-[#F0E6DE] bg-white/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0 z-40 shadow-xs">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-[#172033]">
                Zuh<span className="text-orange-600">Demy</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-bold border border-orange-200">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {role === "teacher" ? "Instructor Profile Setup" : "Student Learning Setup"}
            </p>
          </div>
        </div>

        {/* Right: Step Indicator & Role Tag */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">
              Step {currentStep} of {totalSteps}
            </p>
            <p className="text-[11px] text-orange-600 font-semibold">{Math.round(progressPercent)}% Done</p>
          </div>
          <Badge
            variant="secondary"
            className="capitalize gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-orange-50/80 border border-orange-200/80"
          >
            {role === "teacher" ? (
              <Briefcase className="h-3.5 w-3.5 text-orange-600" />
            ) : (
              <User className="h-3.5 w-3.5 text-orange-600" />
            )}
            {role} Onboarding
          </Badge>
        </div>
      </header>

      {/* =================================================================== */}
      {/* MAIN CONTAINER                                                      */}
      {/* =================================================================== */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-start">
        {/* Step Navigation Pills for Teacher (Clickable or Visual) */}
        {role === "teacher" && (
          <div className="w-full mb-6 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center min-w-max gap-2 px-1">
              {[
                { step: 1, label: "Identity & Headline", icon: User },
                { step: 2, label: "Education", icon: GraduationCap },
                { step: 3, label: "Certifications", icon: Award },
                { step: 4, label: "Experience", icon: Briefcase },
                { step: 5, label: "Subjects & Topics", icon: BookOpen },
                { step: 6, label: "Preferences", icon: Sliders },
              ].map((item) => {
                const isCompleted = item.step < currentStep;
                const isCurrent = item.step === currentStep;
                const IconComponent = item.icon;
                return (
                  <button
                    type="button"
                    key={item.step}
                    onClick={() => {
                      if (item.step < currentStep) {
                        setCurrentStep(item.step);
                        setErrorMessage(null);
                      }
                    }}
                    disabled={item.step > currentStep}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isCurrent
                        ? "bg-orange-600 text-white shadow-sm ring-2 ring-orange-400/40"
                        : isCompleted
                        ? "bg-orange-50 text-orange-800 hover:bg-orange-100 cursor-pointer border border-orange-200/60"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5 text-orange-600 stroke-[3]" />
                    ) : (
                      <IconComponent className="h-3.5 w-3.5" />
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Global Progress Bar */}
        <div className="w-full mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 px-1">
            <span className="text-orange-950 font-extrabold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-600 animate-pulse" />
              {currentInfo.badge} — {currentInfo.title}
            </span>
            <span className="text-orange-600 font-extrabold">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-orange-100 rounded-full" />
        </div>

        {/* Validation Alert */}
        {errorMessage && (
          <div className="w-full mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="font-semibold flex-1">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-700 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Card Component */}
        <Card className="w-full border-[#EFE5DC] shadow-sm shadow-orange-950/5 rounded-2xl overflow-hidden bg-white flex flex-col">
          {/* Card Header */}
          <CardHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-orange-50/40 via-amber-50/20 to-transparent">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[11px] font-bold text-orange-700 bg-orange-50 border-orange-200">
                {currentInfo.badge}
              </Badge>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
              {currentInfo.title}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500 mt-1">
              {currentInfo.subtitle}
            </CardDescription>
          </CardHeader>

          {/* Card Content */}
          <CardContent className="p-5 sm:p-6 space-y-6">
            {/* ============================================================= */}
            {/* TEACHER STEP 1: PERSONAL INFO & HEADLINE                     */}
            {/* ============================================================= */}
            {role === "teacher" && currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <Label htmlFor="full-name" className="text-xs font-bold text-slate-700">
                      Full Name <span className="text-orange-600">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="full-name"
                        value={userName}
                        onChange={(e) => {
                          setUserName(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="e.g. Dr. Muhammad Ahmad"
                        className="pl-9 h-10 text-sm border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Email (Readonly) */}
                  <div>
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                      Verified Email
                    </Label>
                    <Input
                      id="email"
                      value={userEmail}
                      disabled
                      className="mt-1.5 h-10 text-sm bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp */}
                  <div>
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                      WhatsApp / Contact Phone <span className="text-orange-600">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="+92 300 1234567"
                        className="pl-9 h-10 text-sm border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Used for automated class booking WhatsApp reminders and student link sharing.
                    </span>
                  </div>

                  {/* City */}
                  <div>
                    <Label htmlFor="city" className="text-xs font-bold text-slate-700">
                      City of Residence <span className="text-orange-600">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600" />
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="e.g. Lahore, Karachi, Islamabad"
                        className="pl-9 h-10 text-sm border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                    {/* City suggestion pills */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {PAKISTAN_CITIES.slice(0, 5).map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setCity(c)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-medium transition-all ${
                            city.toLowerCase() === c.toLowerCase()
                              ? "bg-orange-600 text-white border-orange-600 font-bold"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Professional Heading */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="headline" className="text-xs font-bold text-slate-700">
                      Professional Heading / Headline <span className="text-orange-600">*</span>
                    </Label>
                    <span className="text-[11px] text-slate-400 font-medium">Visible on search & tutor directory</span>
                  </div>
                  <Input
                    id="headline"
                    value={headline}
                    onChange={(e) => {
                      setHeadline(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="e.g. Cambridge CAIE O/A-Levels Math & Physics Specialist | 7+ Years Experience"
                    className="h-10 text-sm border-slate-200 focus:border-orange-500 focus:ring-orange-500 font-medium"
                    required
                  />
                  <div className="mt-2 p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/50 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-orange-950 leading-relaxed">
                      <strong>Pro-tip:</strong> Mention your highest degree, target curricula (CAIE, Matric, FSc), and years of experience. High-impact headlines convert 3x more trial bookings!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TEACHER STEP 2: EDUCATION (MULTIPLE DEGREES)                 */}
            {/* ============================================================= */}
            {role === "teacher" && currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Your Degrees & Academic Credentials</h3>
                    <p className="text-xs text-slate-500">Add all undergraduate, graduate, or postgraduate degrees.</p>
                  </div>
                  {!isAddingEdu && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={startAddEducation}
                      className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 text-xs font-semibold shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Another Degree
                    </Button>
                  )}
                </div>

                {/* List of Degrees */}
                <div className="space-y-3">
                  {educationList.length === 0 && !isAddingEdu && (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center bg-slate-50/50 flex flex-col items-center justify-center">
                      <GraduationCap className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-700">No degrees added yet</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
                        Please add at least one university degree or academic qualification to showcase your academic mastery.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={startAddEducation}
                        className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 text-xs font-semibold"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Your Degree
                      </Button>
                    </div>
                  )}

                  {educationList.map((edu) => (
                    <div
                      key={edu.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-300 transition-all shadow-2xs flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-100/70 border border-orange-200 flex items-center justify-center text-orange-700 shrink-0">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{edu.degree}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              Class of {edu.completionYear}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">{edu.institution}</p>
                          {edu.fieldOfStudy && (
                            <p className="text-[11px] text-slate-400 mt-0.5">Major / Field: {edu.fieldOfStudy}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditEducation(edu)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEducation(edu.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline Form to Add / Edit Degree */}
                {isAddingEdu && (
                  <div className="p-4 sm:p-5 rounded-2xl border-2 border-orange-200 bg-orange-50/20 space-y-3.5 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-orange-100">
                      <span className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-orange-600" />
                        {editingEduId ? "Edit Degree Entry" : "Add Academic Degree"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingEdu(false);
                          setEditingEduId(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-bold text-slate-700">
                          Degree / Qualification <span className="text-orange-600">*</span>
                        </Label>
                        <Input
                          value={eduDegree}
                          onChange={(e) => setEduDegree(e.target.value)}
                          placeholder="e.g. B.Sc. in Physics, M.Sc. Mathematics, Ph.D."
                          className="mt-1 h-9 text-xs sm:text-sm bg-white border-slate-200"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-slate-700">
                          Awarding University / Institution <span className="text-orange-600">*</span>
                        </Label>
                        <Input
                          value={eduInstitution}
                          onChange={(e) => setEduInstitution(e.target.value)}
                          placeholder="e.g. LUMS, NUST, FAST, Cambridge, Punjab University"
                          className="mt-1 h-9 text-xs sm:text-sm bg-white border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-bold text-slate-700">Field of Study / Major</Label>
                        <Input
                          value={eduField}
                          onChange={(e) => setEduField(e.target.value)}
                          placeholder="e.g. Computer Science, Applied Mathematics"
                          className="mt-1 h-9 text-xs sm:text-sm bg-white border-slate-200"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-slate-700">Year of Completion / Graduation</Label>
                        <Input
                          value={eduYear}
                          onChange={(e) => setEduYear(e.target.value)}
                          placeholder="e.g. 2024, 2022"
                          className="mt-1 h-9 text-xs sm:text-sm bg-white border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingEdu(false);
                          setEditingEduId(null);
                        }}
                        className="text-xs border-slate-200"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveEducation}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs px-4"
                      >
                        {editingEduId ? "Update Degree" : "Save Degree Entry"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* TEACHER STEP 3: CERTIFICATIONS SECTION                        */}
            {/* ============================================================= */}
            {role === "teacher" && currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Professional Certifications & Licenses</h3>
                    <p className="text-xs text-slate-500">
                      Add any CAIE teacher training, IELTS/TOEFL scores, or verified educational credentials.
                    </p>
                  </div>
                  {!isAddingCert && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={startAddCertificate}
                      className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 text-xs font-semibold shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Certification
                    </Button>
                  )}
                </div>

                {/* List of Certificates */}
                <div className="space-y-3">
                  {certificatesList.length === 0 && !isAddingCert && (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center bg-slate-50/50 flex flex-col items-center justify-center">
                      <Award className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-700">No certifications added yet (Optional)</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
                        If you hold specialized certificates (Cambridge PDQ, IELTS, Microsoft, TEFL), adding them boosts student trust and search ranking.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={startAddCertificate}
                        className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 text-xs font-semibold"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add a Certification
                      </Button>
                    </div>
                  )}

                  {certificatesList.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition-all shadow-2xs flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{cert.title}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Verified Badge
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">Issued by: {cert.issuer}</p>
                          {cert.year && (
                            <p className="text-[11px] text-slate-400 mt-0.5">Issued: {cert.year}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditCertificate(cert)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCertificate(cert.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline Form to Add / Edit Certificate */}
                {isAddingCert && (
                  <div className="p-4 sm:p-5 rounded-2xl border-2 border-amber-200 bg-amber-50/20 space-y-3.5 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-amber-600" />
                        {editingCertId ? "Edit Certification" : "Add Certification"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCert(false);
                          setEditingCertId(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-bold text-slate-700">
                          Certificate Name / Title <span className="text-orange-600">*</span>
                        </Label>
                        <Input
                          value={certTitle}
                          onChange={(e) => setCertTitle(e.target.value)}
                          placeholder="e.g. Cambridge CAIE Certified Teacher, IELTS 8.5, TEFL"
                          className="mt-1 h-9 text-xs sm:text-sm bg-white border-slate-200"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-slate-700">
                          Issuing Authority / Organization <span className="text-orange-600">*</span>
                        </Label>
                        <Input
                          value={certIssuer}
                          onChange={(e) => setCertIssuer(e.target.value)}
                          placeholder="e.g. Cambridge International, British Council, Stanford Online"
                          className="mt-1 h-9 text-xs sm:text-sm bg-white border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-bold text-slate-700">Issue Year</Label>
                        <Input
                          value={certYear}
                          onChange={(e) => setCertYear(e.target.value)}
                          placeholder="e.g. 2023, 2024"
                          className="mt-1 h-9 text-xs sm:text-sm bg-white border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingCert(false);
                          setEditingCertId(null);
                        }}
                        className="text-xs border-slate-200"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveCertificate}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs px-4"
                      >
                        {editingCertId ? "Update Certificate" : "Save Certificate"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* TEACHER STEP 4: EXPERIENCE SECTION                            */}
            {/* ============================================================= */}
            {role === "teacher" && currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Teaching & Tutoring History</h3>
                    <p className="text-xs text-slate-500">
                      Add your past or current teaching positions in schools, colleges, or private academies.
                    </p>
                  </div>
                  {!isAddingExp && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={startAddExperience}
                      className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 text-xs font-semibold shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Experience
                    </Button>
                  )}
                </div>

                {/* Overall Years of Experience Selector */}
                <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="exp-years" className="text-xs font-bold text-orange-950">
                      Total Years of Tutoring Experience
                    </Label>
                    <p className="text-[11px] text-slate-500">Displayed prominently on your tutor badge.</p>
                  </div>
                  <select
                    id="exp-years"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="h-9 rounded-lg border border-orange-200 bg-white px-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="1-2 Years">1 - 2 Years</option>
                    <option value="3-5 Years">3 - 5 Years (Experienced)</option>
                    <option value="6-10 Years">6 - 10 Years (Senior Faculty)</option>
                    <option value="10+ Years">10+ Years (Master Instructor)</option>
                  </select>
                </div>

                {/* List of Experiences */}
                <div className="space-y-3">
                  {experienceList.length === 0 && !isAddingExp && (
                    <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center bg-slate-50/50 flex flex-col items-center justify-center">
                      <Briefcase className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-700">No teaching experience roles added</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
                        Add details about schools, colleges, academies, or independent tutoring you have conducted.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={startAddExperience}
                        className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 text-xs font-semibold"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Teaching Role
                      </Button>
                    </div>
                  )}

                  {experienceList.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-300 transition-all shadow-2xs flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-100/70 border border-orange-200 flex items-center justify-center text-orange-700 shrink-0">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{exp.role}</h4>
                            {exp.duration && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {exp.duration}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">{exp.institution}</p>
                          {exp.description && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditExperience(exp)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline Form to Add / Edit Experience */}
                {isAddingExp && (
                  <div className="p-4 sm:p-5 rounded-2xl border-2 border-orange-200 bg-orange-50/20 space-y-3.5 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-orange-100">
                      <span className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-orange-600" />
                        {editingExpId ? "Edit Experience Entry" : "Add Teaching Experience"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingExp(false);
                          setEditingExpId(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-bold text-slate-700">
                          Role / Teaching Designation <span className="text-orange-600">*</span>
                        </Label>
                        <Input
                          value={expRole}
                          onChange={(e) => setExpRole(e.target.value)}
                          placeholder="e.g. Senior A-Levels Physics Teacher, Math Faculty"
                          className="mt-1 h-9 text-xs sm:text-sm bg-white border-slate-200"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-slate-700">
                          School / Academy / Organization <span className="text-orange-600">*</span>
                        </Label>
                        <Input
                          value={expInstitution}
                          onChange={(e) => setExpInstitution(e.target.value)}
                          placeholder="e.g. Beaconhouse, Roots, LGS, Independent Online"
                          className="mt-1 h-9 text-xs sm:text-sm bg-white border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-bold text-slate-700">Duration</Label>
                        <Input
                          value={expDuration}
                          onChange={(e) => setExpDuration(e.target.value)}
                          placeholder="e.g. 2021 - Present or 3 Years"
                          className="mt-1 h-9 text-xs sm:text-sm bg-white border-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-slate-700">Key Highlights & Student Results (Optional)</Label>
                      <Textarea
                        value={expDescription}
                        onChange={(e) => setExpDescription(e.target.value)}
                        placeholder="e.g. Mentored 120+ students, 85% secured straight A/A* in CAIE exams. Conducted topical past paper marathons."
                        rows={2}
                        className="mt-1 text-xs sm:text-sm bg-white border-slate-200"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingExp(false);
                          setEditingExpId(null);
                        }}
                        className="text-xs border-slate-200"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveExperience}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs px-4"
                      >
                        {editingExpId ? "Update Experience" : "Save Experience"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* TEACHER STEP 5: SUBJECTS & TOPICS                             */}
            {/* ============================================================= */}
            {role === "teacher" && currentStep === 5 && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-bold text-slate-800">
                      Select all academic subjects and topics you tutor on ZuhDemy <span className="text-orange-600">*</span>
                    </Label>
                    <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                      {teacherSubjects.length + customTopics.length} selected
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Click subjects to add/remove. You can also type specific exam topics below.
                  </p>

                  {/* Categorized Subjects */}
                  <div className="space-y-3.5">
                    {EXTENDED_ACADEMIC_SUBJECTS.map((cat) => (
                      <div key={cat.category} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40">
                        <p className="text-xs font-bold text-slate-700 mb-2">{cat.category}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.items.map((sub) => {
                            const isSelected = teacherSubjects.includes(sub);
                            return (
                              <button
                                type="button"
                                key={sub}
                                onClick={() => toggleTeacherSubject(sub)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                  isSelected
                                    ? "bg-orange-600 text-white shadow-xs"
                                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                {sub}
                                {isSelected ? (
                                  <Check className="h-3 w-3 stroke-[3]" />
                                ) : (
                                  <Plus className="h-3 w-3 text-slate-400" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Specialized Topics */}
                <div className="p-4 rounded-xl border border-orange-200/70 bg-orange-50/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                      Add Specialized Topics, Paper Codes, or Exam Drills
                    </Label>
                    <span className="text-[10px] text-slate-400">Press Enter or Add</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomTopic();
                        }
                      }}
                      placeholder="e.g. CAIE Pure Math 1, MDCAT Biology MCQs, Kinematics & Forces"
                      className="h-9 text-xs sm:text-sm bg-white border-slate-200"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomTopic}
                      disabled={!topicInput.trim()}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 shrink-0 h-9"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>

                  {customTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {customTopics.map((topic) => (
                        <span
                          key={topic}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-600 text-white shadow-2xs"
                        >
                          {topic}
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomTopic(topic)}
                            className="hover:bg-orange-700 rounded-full p-0.5 ml-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Student Levels Selection */}
                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-2 block">
                    Curriculum & Student Grade Levels You Tutor <span className="text-orange-600">*</span>
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TEACHER_STUDENT_LEVELS.map((lvl) => {
                      const isSelected = teacherLevels.includes(lvl);
                      return (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() => toggleTeacherLevel(lvl)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/70 text-orange-950 font-bold ring-1 ring-orange-500"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs">{lvl}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-orange-600 shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TEACHER STEP 6: PREFERENCES & TEACHING BIO                    */}
            {/* ============================================================= */}
            {role === "teacher" && currentStep === 6 && (
              <div className="space-y-4">
                {/* Hourly Rate */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="rate" className="text-xs font-bold text-slate-700">
                      Standard Hourly Tuition Rate (PKR) <span className="text-orange-600">*</span>
                    </Label>
                    <span className="text-[11px] text-slate-400 font-medium">Standard 60-Minute 1-on-1 Class</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-orange-600">
                        PKR
                      </span>
                      <Input
                        id="rate"
                        type="number"
                        step="100"
                        min="500"
                        value={hourlyRatePKR}
                        onChange={(e) => setHourlyRatePKR(Number(e.target.value))}
                        className="pl-14 h-10 border-slate-200 font-extrabold text-slate-900 text-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>

                    {/* Quick rate preset chips */}
                    <div className="flex items-center gap-1.5">
                      {PRESET_HOURLY_RATES.map((r) => (
                        <button
                          type="button"
                          key={r}
                          onClick={() => setHourlyRatePKR(r)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold transition-all ${
                            hourlyRatePKR === r
                              ? "bg-orange-600 text-white border-orange-600 shadow-2xs"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          Rs. {r.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Teaching Mode */}
                  <div>
                    <Label className="text-xs font-bold text-slate-700 mb-1.5 block">Delivery Mode</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "100% Online (1-on-1)", label: "Online 1-on-1", desc: "Interactive Classroom" },
                        { id: "Cohort Small Group", label: "Small Group", desc: "Interactive 3-5 Students" },
                      ].map((mode) => (
                        <button
                          type="button"
                          key={mode.id}
                          onClick={() => setTeachingMode(mode.id)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            teachingMode === mode.id
                              ? "border-orange-500 bg-orange-50/70 ring-1 ring-orange-500"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <p className="font-bold text-xs text-slate-800">{mode.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{mode.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meeting Platform */}
                  <div>
                    <Label className="text-xs font-bold text-slate-700 mb-1.5 block">Preferred Video Tool</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "Google Meet", label: "Google Meet", tag: "Recommended" },
                        { id: "Zoom", label: "Zoom Cloud", tag: "Supported" },
                      ].map((plat) => (
                        <button
                          type="button"
                          key={plat.id}
                          onClick={() => setMeetingProvider(plat.id)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            meetingProvider === plat.id
                              ? "border-orange-500 bg-orange-50/70 ring-1 ring-orange-500"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-800">{plat.label}</span>
                            <span className="text-[9px] font-semibold text-orange-700">{plat.tag}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Instruction Languages */}
                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-1.5 block">
                    Languages You Are Fluent Teaching In
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {TEACHER_LANGUAGES.map((lang) => {
                      const isSelected = teachingLanguages.includes(lang);
                      return (
                        <button
                          type="button"
                          key={lang}
                          onClick={() => toggleTeachingLanguage(lang)}
                          className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                            isSelected
                              ? "border-orange-500 bg-orange-50 text-orange-950 font-bold"
                              : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {lang} {isSelected ? "✓" : "+"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="bio" className="text-xs font-bold text-slate-700">
                      About You & Teaching Philosophy <span className="text-orange-600">*</span>
                    </Label>
                    <span
                      className={`text-[11px] font-bold ${
                        bio.trim().length >= 40 ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {bio.trim().length}/40 min chars {bio.trim().length >= 40 ? "✓" : ""}
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Describe your tutoring experience, student exam track record, and how you conduct interactive problem solving..."
                    rows={3}
                    className="border-slate-200 resize-none text-xs sm:text-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>

                {/* Teaching Methodology */}
                <div>
                  <Label htmlFor="methodology" className="text-xs font-bold text-slate-700">
                    Teaching Methodology & Session Structure <span className="text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="methodology"
                    value={teacherMethodology}
                    onChange={(e) => setTeacherMethodology(e.target.value)}
                    placeholder="e.g. Concept-first derivations, whiteboard demos, and live topical past paper drilling"
                    className="mt-1 h-9.5 text-xs sm:text-sm border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* STUDENT FLOW (Steps 1, 2, 3 - Intact)                         */}
            {/* ============================================================= */}
            {role === "student" && currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student-name" className="text-xs font-bold text-slate-700">
                      Full Name
                    </Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="student-name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="pl-9 h-10 text-sm border-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="student-email" className="text-xs font-bold text-slate-700">
                      Email Address (Verified)
                    </Label>
                    <Input
                      id="student-email"
                      value={userEmail}
                      disabled
                      className="mt-1.5 h-10 text-sm bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student-phone" className="text-xs font-bold text-slate-700">
                      WhatsApp / Phone Number <span className="text-orange-600">*</span>
                    </Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                      <Input
                        id="student-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="pl-9 h-10 text-sm border-slate-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="student-city" className="text-xs font-bold text-slate-700">
                      City
                    </Label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600" />
                      <Input
                        id="student-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Lahore, Karachi, Islamabad"
                        className="pl-9 h-10 text-sm border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {role === "student" && currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-2 block">
                    Current Academic Level <span className="text-orange-600">*</span>
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {STUDENT_ACADEMIC_LEVELS.map((lvl) => {
                      const isSelected = academicLevel === lvl.id;
                      return (
                        <button
                          type="button"
                          key={lvl.id}
                          onClick={() => setAcademicLevel(lvl.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/70 ring-1 ring-orange-500"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className={`font-bold text-xs ${isSelected ? "text-orange-950" : "text-slate-800"}`}>
                              {lvl.label}
                            </p>
                            {isSelected && <Check className="h-3.5 w-3.5 text-orange-600" />}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{lvl.sub}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="institution" className="text-xs font-bold text-slate-700">
                    Current School / College Name <span className="text-orange-600">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Beaconhouse, LGS, Roots, KGS, Cedar, Nixor"
                      className="pl-9 h-10 text-sm border-slate-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-bold text-slate-700">
                      Select Subjects You Need Help In <span className="text-orange-600">*</span>
                    </Label>
                    <span className="text-xs font-bold text-orange-700">{studentSubjects.length} selected</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SUBJECTS.map((sub) => {
                      const isSelected = studentSubjects.includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => toggleStudentSubject(sub)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-orange-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {sub} {isSelected ? "✓" : "+"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {role === "student" && currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-orange-600" />
                      Choose Your Learning Goals <span className="text-orange-600">*</span>
                    </Label>
                    <span className="text-xs font-bold text-orange-700">{studentGoals.length} selected</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {STUDENT_GOAL_OPTIONS.map((goal) => {
                      const isSelected = studentGoals.includes(goal.label);
                      return (
                        <button
                          type="button"
                          key={goal.id}
                          onClick={() => toggleStudentGoal(goal.label)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/70 ring-1 ring-orange-500"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className={`font-bold text-xs truncate ${isSelected ? "text-orange-950" : "text-slate-800"}`}>
                              {goal.label}
                            </p>
                            {isSelected && <Check className="h-3.5 w-3.5 text-orange-600 shrink-0 ml-1" />}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{goal.sub}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-1.5 block">Preferred Tutoring Format</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "1-on-1 Focused Session", label: "1-on-1 Focused Session", sub: "Dedicated personal tutor" },
                      { id: "Small Cohort Group", label: "Small Group Cohort", sub: "Interactive 3-5 students" },
                    ].map((fmt) => (
                      <button
                        type="button"
                        key={fmt.id}
                        onClick={() => setPreferredLearningFormat(fmt.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          preferredLearningFormat === fmt.id
                            ? "border-orange-500 bg-orange-50/70 ring-1 ring-orange-500"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <p className="font-bold text-xs text-slate-800">{fmt.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{fmt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-note" className="text-xs font-bold text-slate-700">
                    Specific Exam or Topic Focus <span className="text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="custom-note"
                    value={customGoalNote}
                    onChange={(e) => setCustomGoalNote(e.target.value)}
                    placeholder="e.g. Need help with CAIE Paper 1 topical past papers or NET prep"
                    className="mt-1 h-10 text-sm border-slate-200"
                  />
                </div>
              </div>
            )}
          </CardContent>

          <Separator className="bg-slate-100" />

          {/* Card Footer: Back & Next / Submit Controls */}
          <CardFooter className="flex items-center justify-between py-4 px-5 sm:px-6 bg-slate-50/50">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={isSubmitting}
                className="border-slate-200 text-slate-700 hover:bg-slate-100 h-10 px-4 text-xs font-semibold"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="button"
              size="sm"
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 px-6 h-10 text-sm font-bold ml-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving Profile...
                </>
              ) : currentStep < totalSteps ? (
                <>
                  Next Step <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Complete & Launch Dashboard <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="h-12 w-full border-t border-[#F0E6DE] bg-white/60 flex items-center justify-center text-xs text-slate-400 shrink-0">
        © 2026 ZuhDemy Learning Studio • Safe & Encrypted Education Platform
      </footer>
    </div>
  );
}
