import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* ============================================================
          NAVIGATION BAR
      ============================================================ */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                E
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Edu<span className="text-blue-600">Sync</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#pathways" className="hover:text-blue-600 transition-colors">
                Portals
              </a>
              <a href="#courses" className="hover:text-blue-600 transition-colors">
                Courses
              </a>
              <a href="#testimonials" className="hover:text-blue-600 transition-colors">
                Testimonials
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              id="nav-login-btn"
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100"
            >
              Sign In
            </Link>
            <Link
              id="nav-signup-btn"
              href="/signup"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40 transition active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================
          HERO SECTION
      ============================================================ */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-purple-400/20 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-12 right-10 w-72 h-72 bg-orange-400/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            Next-Gen Learning Platform • Student & Teacher Dual Hub
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl mx-auto text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Empowering <span className="text-blue-600">Students</span>. Elevating{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Teachers
            </span>.
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
            The all-in-one collaborative academic workspace. Real-time assignments,
            interactive course material, automated grading, and transparent progress insights.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              id="hero-student-cta"
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Student</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              id="hero-teacher-cta"
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-200 shadow-sm hover:border-slate-300 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Teacher</span>
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">45k+</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-0.5">Active Learners</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">1,200+</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-0.5">Verified Instructors</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">98.4%</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-0.5">Assignment On-Time Rate</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">4.9/5</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-0.5">Student Rating</div>
            </div>
          </div>

          {/* ============================================================
              HERO UI PREVIEW MOCKUP
          ============================================================ */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xl shadow-blue-900/10 backdrop-blur-xl p-4 sm:p-6 lg:p-8 text-left">
            {/* Window Topbar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-medium text-slate-400">edusync.internal/dashboard/overview</span>
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Sync Active
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Course Progress Widget */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/70 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded">
                    Current Module
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Due in 2 days</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">Full Stack Web Architecture</h3>
                <p className="text-xs text-slate-500 mt-1">Instructor: Dr. Sarah Chen</p>

                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Course Completion</span>
                    <span className="text-blue-600">82%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full w-[82%]" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Assignment 04: Supabase SSR</span>
                  <span className="text-emerald-600 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                    Graded: 98/100
                  </span>
                </div>
              </div>

              {/* Real-time Announcements Widget */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/70 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded">
                    Class Feed
                  </span>
                  <span className="text-xs text-slate-400">Just now</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">Midterm Project Office Hours</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  &ldquo;Office hours for reviewing team projects will be held today from 3:00 PM to 5:00 PM. Drop by via the live link!&rdquo;
                </p>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    SC
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">Prof. Marcus Vance</div>
                    <div className="text-slate-400 text-[10px]">Head of Computer Science</div>
                  </div>
                </div>
              </div>

              {/* Teacher Insights Widget */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/70 hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded">
                    Cohort Analytics
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">+14% Growth</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">Section A-102 Performance</h3>

                <div className="mt-4 space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Quiz Submissions</span>
                      <span className="font-semibold text-slate-800">48 / 50 Students</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[96%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Attendance Avg</span>
                      <span className="font-semibold text-slate-800">92%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-[92%]" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Need review</span>
                  <span className="text-orange-600 font-bold bg-orange-100/60 px-2 py-0.5 rounded">
                    2 Pending Reviews
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          PORTAL PATHWAYS (FOR STUDENTS VS FOR TEACHERS)
      ============================================================ */}
      <section id="pathways" className="py-20 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Tailored Experiences</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Built specifically for both sides of the classroom
            </p>
            <p className="mt-3 text-base text-slate-600">
              Switching between student assignments and instructor grading has never been this seamless.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Pathway Card */}
            <div className="relative rounded-3xl bg-gradient-to-b from-blue-50/70 to-white border border-blue-100 p-8 sm:p-10 hover:shadow-xl hover:shadow-blue-500/10 transition group">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/30">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-3">Student Hub</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Never miss an assignment again. View syllabi, submit work with instant feedback,
                take interactive quizzes, and track academic milestones on a visual timeline.
              </p>

              <ul className="space-y-3 mb-8 text-sm text-slate-700">
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">✓</span>
                  Centralized assignments & real-time deadline warnings
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">✓</span>
                  Interactive quizzes with instant scoring and explanations
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">✓</span>
                  Personal grade book and skill progression badges
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">✓</span>
                  Direct student-to-teacher messaging and discussion forums
                </li>
              </ul>

              <Link
                id="pathway-student-btn"
                href="/signup"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:text-blue-700"
              >
                <span>Enter Student Portal</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Teacher Pathway Card */}
            <div className="relative rounded-3xl bg-gradient-to-b from-indigo-50/70 to-white border border-indigo-100 p-8 sm:p-10 hover:shadow-xl hover:shadow-indigo-500/10 transition group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/30">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-3">Teacher Workspace</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Automate your routine workflows so you can focus on teaching. Build custom syllabi,
                grade assignments with rubrics, monitor struggling students, and publish announcements in seconds.
              </p>

              <ul className="space-y-3 mb-8 text-sm text-slate-700">
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">✓</span>
                  Course builder with rich modules, video lectures, and docs
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">✓</span>
                  SpeedGrader tool with customizable rubric matrices
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">✓</span>
                  Cohort attendance, participation trackers, and risk alerts
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">✓</span>
                  One-click grade exporting to CSV, Excel, and institutional SIS
                </li>
              </ul>

              <Link
                id="pathway-teacher-btn"
                href="/signup"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700"
              >
                <span>Enter Educator Portal</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES SECTION
      ============================================================ */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Core Capabilities</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Engineered for academic excellence
            </p>
            <p className="mt-3 text-base text-slate-600">
              Modern infrastructure powered by Supabase Realtime, Next.js Server Components, and intuitive design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 font-bold">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time Synchronization</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Live feedback, grade notifications, and discussion threads update instantly without refreshing pages.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-5 font-bold">
                📊
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Cohort Analytics</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Visual insights on class averages, difficult quiz questions, and submission timeliness to spot gaps early.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 font-bold">
                🔒
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Role-Based Security</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Supabase Row-Level Security protects grades and sensitive academic records. Students only view their own data.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 font-bold">
                📝
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Rubric-Based Grading</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Standardize grading criteria across multiple instructors with click-to-assign rubric matrices.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-5 font-bold">
                📱
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Seamless Mobile Experience</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Submit assignments on the go, review lecture notes from tablets, or grade papers from anywhere.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5 font-bold">
                💬
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Classroom Discussions</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Topic-based discussion threads encourage student engagement, peer-to-peer assistance, and teacher Q&A.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          POPULAR COURSES SHOWCASE
      ============================================================ */}
      <section id="courses" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Curriculum Highlights</h2>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                Explore active course modules
              </p>
            </div>
            <Link
              href="/signup"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Browse all 120+ courses <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white hover:shadow-lg transition">
              <div className="h-36 bg-gradient-to-tr from-blue-600 to-indigo-700 p-6 flex flex-col justify-between text-white">
                <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full w-fit">
                  Computer Science
                </span>
                <span className="text-xs opacity-90">14 Weeks • 24 Modules</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Full-Stack Cloud Development</h3>
                <p className="text-xs text-slate-500 mb-4">Instructor: Prof. Elena Rostova</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Master Next.js, Supabase, server-side data caching, and production cloud architecture.
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">★ 4.9 (420 reviews)</span>
                  <span className="font-medium text-blue-600">Enrollment Open</span>
                </div>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white hover:shadow-lg transition">
              <div className="h-36 bg-gradient-to-tr from-indigo-600 to-purple-700 p-6 flex flex-col justify-between text-white">
                <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full w-fit">
                  Data Science & AI
                </span>
                <span className="text-xs opacity-90">12 Weeks • 18 Modules</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Applied Machine Learning & NLP</h3>
                <p className="text-xs text-slate-500 mb-4">Instructor: Dr. Dev Patel</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Hands-on neural networks, statistical inference, model evaluation, and modern GenAI applications.
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">★ 4.8 (380 reviews)</span>
                  <span className="font-medium text-blue-600">Enrollment Open</span>
                </div>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white hover:shadow-lg transition">
              <div className="h-36 bg-gradient-to-tr from-orange-500 to-rose-600 p-6 flex flex-col justify-between text-white">
                <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full w-fit">
                  Design Systems
                </span>
                <span className="text-xs opacity-90">8 Weeks • 16 Modules</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Modern UI/UX Design & Prototyping</h3>
                <p className="text-xs text-slate-500 mb-4">Instructor: Sarah Montgomery</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  From user research to design tokens, wireframing, component architecture, and micro-interactions.
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">★ 5.0 (290 reviews)</span>
                  <span className="font-medium text-blue-600">Enrollment Open</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS
      ============================================================ */}
      <section id="testimonials" className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Community Feedback</h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Loved by students and professors alike
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-blue-600 text-lg mb-3">★★★★★</div>
              <p className="text-sm text-slate-600 leading-relaxed italic mb-6">
                &ldquo;EduSync has completely eliminated the confusion around assignment deadlines. The instant feedback on quizzes helps me know where to study before midterms.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  AJ
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Alex Johnson</div>
                  <div className="text-xs text-slate-500">Junior, Software Engineering</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-blue-600 text-lg mb-3">★★★★★</div>
              <p className="text-sm text-slate-600 leading-relaxed italic mb-6">
                &ldquo;Grading 150 student assignments used to take me entire weekends. With EduSync&apos;s rubric grader and automated submission checks, my grading time was cut in half.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  DK
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Dr. Karen Williams</div>
                  <div className="text-xs text-slate-500">Professor of Mathematics</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-blue-600 text-lg mb-3">★★★★★</div>
              <p className="text-sm text-slate-600 leading-relaxed italic mb-6">
                &ldquo;The real-time synchronization is incredible. My professor posted an announcement and my dashboard updated right away with no reloading. Highly recommend!&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                  ML
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Maya Lin</div>
                  <div className="text-xs text-slate-500">Sophomore, Data Science</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          BOTTOM CALL TO ACTION BANNER
      ============================================================ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Ready to elevate your academic experience?
              </h2>
              <p className="mt-4 text-base text-slate-300 leading-relaxed">
                Join thousands of students and educators already achieving better grades and streamlined classrooms on EduSync.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  id="footer-cta-signup"
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition active:scale-[0.98]"
                >
                  Create Free Account
                </Link>
                <Link
                  id="footer-cta-login"
                  href="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition active:scale-[0.98]"
                >
                  Sign In to Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  E
                </span>
                <span className="text-base font-bold text-white tracking-tight">EduSync</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Next-generation learning management ecosystem connecting students and teachers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Portals</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/login" className="hover:text-white transition">Student Login</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Teacher Portal</Link></li>
                <li><Link href="/signup" className="hover:text-white transition">Register Account</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition">Live Sync</a></li>
                <li><a href="#pathways" className="hover:text-white transition">Grading System</a></li>
                <li><a href="#courses" className="hover:text-white transition">Curriculum</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-3 text-xs uppercase tracking-wider">System</h4>
              <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </div>
              <p className="text-xs text-slate-500">
                Powered by Next.js & Supabase SSR
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>© {new Date().getFullYear()} EduSync Inc. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400 transition">Terms of Service</a>
              <a href="#" className="hover:text-slate-400 transition">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
