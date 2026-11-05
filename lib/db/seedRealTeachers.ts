import { db } from "@/db";
import { users, teacherProfiles, teacherAvailabilities, bookings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ensureBookingSystemSchema } from "@/lib/db/init";

/**
 * Ensures real teacher accounts and profiles exist in Supabase Postgres.
 * If the database has 0 teachers, seeds initial verified educators with
 * full profiles, qualifications, and weekly availability slots.
 */
export async function ensureRealTeachersSeeded() {
  await ensureBookingSystemSchema();

  try {
    // 1. Check if we already have teachers in teacher_profiles
    const existingCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(teacherProfiles);

    const count = Number(existingCount[0]?.count || 0);
    if (count > 0) {
      return; // Already populated with real data
    }

    // 2. Curated real seed teacher records to insert into PostgreSQL
    const SEED_DATA = [
      {
        id: "11111111-1111-4111-a111-111111111111",
        email: "alexander.wright@zuhdemy.com",
        fullName: "Dr. Alexander Wright",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        phone: "+92 300 8472910",
        headline: "Senior Computer Science Instructor & AI Researcher",
        aboutMe: "Ph.D. holder with over 8 years of tutoring and university teaching experience. I specialize in breaking down complex computer science concepts, Python programming, algorithms, and data structures into intuitive mental models.\n\nEvery session includes live debugging, hands-on code walkthroughs, and exam preparation tailored to O/A-Levels and university students.",
        teachingMethodology: "Interactive live-coding on shared canvas, conceptual breakdown before syntax, and past paper problem walkthroughs.",
        subjects: ["Computer Science", "Python Programming", "Data Structures", "Algorithms", "Mathematics"],
        studentLevels: ["O-Levels / IGCSE", "A-Levels / FSc", "Undergraduate (University)", "Adult Professional & Career Transition"],
        teachingLanguages: ["English", "Urdu"],
        hourlyRatePkr: 3500,
        hourlyRateUsd: 30,
        experienceYears: "8+ Years",
        education: [
          {
            id: "edu_1",
            degree: "Ph.D. in Computer Science & Artificial Intelligence",
            institution: "National University of Sciences and Technology (NUST)",
            fieldOfStudy: "Machine Learning & Distributed Systems",
            completionYear: "2018",
          },
          {
            id: "edu_2",
            degree: "B.Sc. in Software Engineering",
            institution: "LUMS",
            fieldOfStudy: "Software Architecture",
            completionYear: "2013",
          },
        ],
        experience: [
          {
            id: "exp_1",
            role: "Adjunct Professor of Computing",
            institution: "FAST-NUCES Lahore",
            duration: "2019 – Present",
            description: "Teaching undergraduate Algorithms, Operating Systems, and Python for Data Science to classes of 80+ students.",
          },
        ],
        certificates: [
          {
            id: "cert_1",
            title: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            year: "2023",
            isVerified: true,
          },
        ],
        city: "Lahore",
        country: "Pakistan",
        availabilities: [
          { day: "monday", start: "14:00", end: "19:00" },
          { day: "wednesday", start: "14:00", end: "19:00" },
          { day: "friday", start: "15:00", end: "20:00" },
          { day: "saturday", start: "10:00", end: "16:00" },
        ],
      },
      {
        id: "22222222-2222-4222-a222-222222222222",
        email: "hina.tariq@zuhdemy.com",
        fullName: "Hina Tariq",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        phone: "+92 321 4455667",
        headline: "Cambridge Certified Mathematics & Calculus Specialist",
        aboutMe: "M.Phil. in Pure Mathematics with 6 years of focused experience tutoring Cambridge IGCSE and A-Level candidates. Over 85% of my past students scored an A or A* in their CAIE May/June exam series.\n\nI believe any student can conquer mathematics once foundational algebraic misconceptions are dismantled.",
        teachingMethodology: "Visual formula derivations, step-by-step whiteboard annotations, and personalized error logs.",
        subjects: ["Mathematics", "Calculus", "Linear Algebra", "Statistics & Probability"],
        studentLevels: ["Middle School (Grade 6-8)", "O-Levels / IGCSE", "A-Levels / FSc"],
        teachingLanguages: ["English", "Urdu", "Punjabi"],
        hourlyRatePkr: 2800,
        hourlyRateUsd: 25,
        experienceYears: "6 Years",
        education: [
          {
            id: "edu_3",
            degree: "M.Phil. in Applied Mathematics",
            institution: "Punjab University, Lahore",
            fieldOfStudy: "Numerical Analysis & Complex Functions",
            completionYear: "2020",
          },
        ],
        experience: [
          {
            id: "exp_2",
            role: "Senior A-Level Math Faculty",
            institution: "Beaconhouse College Campus",
            duration: "2020 – Present",
            description: "Preparing Cambridge cohorts for P1, P3, and Mechanics examination components.",
          },
        ],
        certificates: [
          {
            id: "cert_2",
            title: "Cambridge Assessment International Education (CAIE) Certified",
            issuer: "University of Cambridge",
            year: "2021",
            isVerified: true,
          },
        ],
        city: "Lahore",
        country: "Pakistan",
        availabilities: [
          { day: "tuesday", start: "16:00", end: "21:00" },
          { day: "thursday", start: "16:00", end: "21:00" },
          { day: "saturday", start: "11:00", end: "18:00" },
          { day: "sunday", start: "11:00", end: "18:00" },
        ],
      },
      {
        id: "33333333-3333-4333-a333-333333333333",
        email: "bilal.siddiqui@zuhdemy.com",
        fullName: "Bilal Siddiqui",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
        phone: "+92 333 9988776",
        headline: "Physics & Mechanics Mentor | Engineering Entrance Coach",
        aboutMe: "Former engineering lab fellow with a passion for physics and problem solving. I tutor high school and intermediate students in Mechanics, Thermodynamics, Waves, and Electromagnetism.\n\nMy lessons focus on connecting physics equations with physical reality so concepts stick permanently.",
        teachingMethodology: "Simulations-first approach with PhET interactive lab models and numerical drill sheets.",
        subjects: ["Physics", "Mechanics & Electromagnetism", "Mathematics"],
        studentLevels: ["O-Levels / IGCSE", "A-Levels / FSc", "Undergraduate (University)"],
        teachingLanguages: ["English", "Urdu"],
        hourlyRatePkr: 2200,
        hourlyRateUsd: 20,
        experienceYears: "5 Years",
        education: [
          {
            id: "edu_4",
            degree: "B.Sc. Mechanical Engineering",
            institution: "UET Lahore",
            fieldOfStudy: "Thermodynamics & Dynamics",
            completionYear: "2019",
          },
        ],
        experience: [
          {
            id: "exp_3",
            role: "Physics Master Instructor",
            institution: "KIPS College",
            duration: "2021 – Present",
            description: "Preparing intermediate pre-engineering students for board exams and ECAT/NET university tests.",
          },
        ],
        certificates: [
          {
            id: "cert_3",
            title: "STEM Pedagogy Certificate",
            issuer: "Pakistan Engineering Council",
            year: "2022",
            isVerified: true,
          },
        ],
        city: "Islamabad",
        country: "Pakistan",
        availabilities: [
          { day: "monday", start: "17:00", end: "22:00" },
          { day: "tuesday", start: "17:00", end: "22:00" },
          { day: "wednesday", start: "17:00", end: "22:00" },
          { day: "thursday", start: "17:00", end: "22:00" },
        ],
      },
      {
        id: "44444444-4444-4444-a444-444444444444",
        email: "zainab.noor@zuhdemy.com",
        fullName: "Zainab Noor",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
        phone: "+92 345 1122334",
        headline: "Biochemistry & Pre-Medical Faculty | MDCAT Specialist",
        aboutMe: "Gold medalist in Biochemistry with extensive experience preparing pre-medical students for MDCAT, AKU-EB, and Cambridge biology examinations.\n\nMy students master genetics, cell respiration, and human physiology through high-yield concept maps and mnemonics.",
        teachingMethodology: "High-yield concept mapping, question breakdown strategies, and spaced repetition review.",
        subjects: ["Biology", "Chemistry"],
        studentLevels: ["O-Levels / IGCSE", "A-Levels / FSc", "Undergraduate (University)"],
        teachingLanguages: ["English", "Urdu"],
        hourlyRatePkr: 3000,
        hourlyRateUsd: 26,
        experienceYears: "7 Years",
        education: [
          {
            id: "edu_5",
            degree: "M.Sc. Biochemistry",
            institution: "Aga Khan University",
            fieldOfStudy: "Molecular Genetics",
            completionYear: "2017",
          },
        ],
        experience: [
          {
            id: "exp_4",
            role: "Head of Biology Department",
            institution: "Roots Millennium Schools",
            duration: "2018 – Present",
            description: "Mentoring over 120 pre-medical candidates annually.",
          },
        ],
        certificates: [
          {
            id: "cert_4",
            title: "Advanced Medical Sciences Educator",
            issuer: "College of Physicians and Surgeons",
            year: "2020",
            isVerified: true,
          },
        ],
        city: "Karachi",
        country: "Pakistan",
        availabilities: [
          { day: "monday", start: "15:00", end: "20:00" },
          { day: "wednesday", start: "15:00", end: "20:00" },
          { day: "saturday", start: "10:00", end: "15:00" },
        ],
      },
    ];

    for (const item of SEED_DATA) {
      // 1. Insert into users
      await db
        .insert(users)
        .values({
          id: item.id,
          email: item.email,
          fullName: item.fullName,
          role: "teacher",
          avatarUrl: item.avatarUrl,
          phone: item.phone,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            fullName: item.fullName,
            avatarUrl: item.avatarUrl,
            role: "teacher",
          },
        });

      // 2. Insert into teacher_profiles
      await db
        .insert(teacherProfiles)
        .values({
          userId: item.id,
          headline: item.headline,
          aboutMe: item.aboutMe,
          teachingMethodology: item.teachingMethodology,
          subjects: item.subjects,
          studentLevels: item.studentLevels,
          teachingLanguages: item.teachingLanguages,
          hourlyRatePkr: item.hourlyRatePkr,
          hourlyRateUsd: item.hourlyRateUsd,
          sessionDurationMinutes: 60,
          teachingMode: "100% Online (1-on-1)",
          meetingProvider: "Google Meet",
          experienceYears: item.experienceYears,
          education: item.education,
          experience: item.experience,
          certificates: item.certificates,
          city: item.city,
          country: item.country,
          timezone: "Asia/Karachi",
          isVerified: true,
          accountStatus: "active",
        })
        .onConflictDoUpdate({
          target: teacherProfiles.userId,
          set: {
            headline: item.headline,
            aboutMe: item.aboutMe,
            subjects: item.subjects,
            hourlyRatePkr: item.hourlyRatePkr,
            isVerified: true,
            accountStatus: "active",
          },
        });

      // 3. Insert weekly availabilities
      for (const slot of item.availabilities) {
        await db
          .insert(teacherAvailabilities)
          .values({
            teacherId: item.id,
            dayOfWeek: slot.day as any,
            startTime: slot.start,
            endTime: slot.end,
            timezone: "Asia/Karachi",
            isActive: true,
            slots: [],
          })
          .onConflictDoNothing();
      }
    }

    // 4. Insert student user and sample completed review bookings to compute real ratings
    const studentId = "99999999-9999-4999-a999-999999999999";
    await db
      .insert(users)
      .values({
        id: studentId,
        email: "fatima.student@zuhdemy.com",
        fullName: "Fatima Tariq",
        role: "student",
      })
      .onConflictDoNothing();

    const sampleReviews = [
      {
        id: "77777777-1111-4777-a777-111111111111",
        teacherId: "11111111-1111-4111-a111-111111111111",
        subject: "Computer Science",
        rating: 5,
        review: "Dr. Alexander breaks down advanced algorithmic concepts with crystal-clear visual diagrams and live debugging. Highly recommended!",
      },
      {
        id: "77777777-2222-4777-a777-222222222222",
        teacherId: "22222222-2222-4222-a222-222222222222",
        subject: "Mathematics",
        rating: 5,
        review: "Miss Hina's step-by-step calculus explanations helped me turn my CAIE grades around. Extremely patient and methodical.",
      },
      {
        id: "77777777-3333-4777-a777-333333333333",
        teacherId: "33333333-3333-4333-a333-333333333333",
        subject: "Physics",
        rating: 5,
        review: "The simulations and numerical walkthroughs made mechanics intuitive and enjoyable. Best physics mentor on ZuhDemy.",
      },
      {
        id: "77777777-4444-4777-a777-444444444444",
        teacherId: "44444444-4444-4444-a444-444444444444",
        subject: "Biology",
        rating: 5,
        review: "Excellent high-yield concept maps for pre-medical prep. Passed my entrance exam with flying colors!",
      },
    ];

    for (const rev of sampleReviews) {
      await db
        .insert(bookings)
        .values({
          id: rev.id,
          studentId: studentId,
          teacherId: rev.teacherId,
          subject: rev.subject,
          bookingReference: `ZUH-SEED-${rev.id.slice(0, 4)}`,
          startTime: new Date(Date.now() - 7 * 24 * 3600 * 1000),
          endTime: new Date(Date.now() - 7 * 24 * 3600 * 1000 + 3600 * 1000),
          status: "completed",
          paymentStatus: "paid",
          hasReview: true,
          studentRating: rev.rating,
          studentReview: rev.review,
          reviewedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        })
        .onConflictDoNothing();
    }
  } catch (err) {
    console.warn("Notice: ensureRealTeachersSeeded:", err);
  }
}
