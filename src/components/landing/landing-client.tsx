'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Play, 
  Check, 
  ArrowRight, 
  Star, 
  Calendar, 
  Users, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  ChevronRight, 
  ChevronLeft,
  Video, 
  BookOpen, 
  MessageSquare, 
  Award, 
  Laptop, 
  Send,
  X,
  Clock,
  BarChart3,
  Layers,
  HelpCircle,
  Menu
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// --- Subcomponents & Floating Badges ---

function SyonLogo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F48C06] to-[#FFB74D] rotate-45 flex items-center justify-center shadow-[0_4px_14px_rgba(244,140,6,0.35)]">
        <span className="-rotate-45 font-extrabold text-white text-sm tracking-tighter">S</span>
      </div>
    </div>
  );
}

// 1. Navigation Bar
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-sm py-3.5' 
          : 'bg-[#FFF2E1]/80 backdrop-blur-sm py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <SyonLogo />
          <span className="text-2xl font-black tracking-tight text-[#2F327D] group-hover:text-[#F48C06] transition-colors">
            SYON
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-[#2F327D]">
          <a href="#home" className="hover:text-[#F48C06] transition-colors">Home</a>
          <a href="#about" className="hover:text-[#F48C06] transition-colors">About</a>
          <a href="#portals" className="hover:text-[#F48C06] transition-colors">Portals</a>
          <a href="#features" className="hover:text-[#F48C06] transition-colors">Features</a>
          <a href="#tools" className="hover:text-[#F48C06] transition-colors">Tools</a>
          <a href="#testimonials" className="hover:text-[#F48C06] transition-colors">Testimonials</a>
          <a href="#blog" className="hover:text-[#F48C06] transition-colors">Blog</a>
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="text-[#2F327D] hover:text-[#F48C06] hover:bg-transparent font-semibold text-sm px-4 h-11"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>

          <Button 
            className="bg-[#F48C06] hover:bg-[#E07E00] text-white font-bold text-sm px-6 h-11 rounded-full shadow-[0_4px_16px_rgba(244,140,6,0.3)] transition-all hover:scale-105 active:scale-95"
            asChild
          >
            <Link href="/login?mode=signup">Sign Up Free</Link>
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button 
          className="lg:hidden p-2 text-[#2F327D] hover:text-[#F48C06]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-gray-100 px-6 py-5 shadow-lg space-y-4"
          >
            <nav className="flex flex-col space-y-3 text-base font-semibold text-[#2F327D]">
              <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
              <a href="#portals" onClick={() => setMobileMenuOpen(false)}>Portals</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#tools" onClick={() => setMobileMenuOpen(false)}>Tools</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
            </nav>
            <div className="flex flex-col gap-2.5 pt-3 border-t border-gray-100">
              <Button variant="outline" className="w-full justify-center rounded-full font-semibold" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="w-full justify-center bg-[#F48C06] hover:bg-[#E07E00] text-white rounded-full font-bold" asChild>
                <Link href="/login?mode=signup">Sign Up Free</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// 2. Hero Section
const Hero = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section id="home" className="relative bg-[#FFF2E1] pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden rounded-b-[3rem] lg:rounded-b-[4.5rem]">
      {/* Background Subtle Blobs */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#F48C06]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#23BDEE]/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column Text */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-orange-200/50 shadow-sm text-xs font-bold text-[#F48C06]"
          >
            <Sparkles className="w-4 h-4 text-[#F48C06]" />
            Next-Generation Cloud LMS Platform
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2F327D] leading-[1.15] tracking-tight"
          >
            <span className="text-[#F48C06]">Studying</span> Online is now much easier with SYON
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#696984] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            SYON is an all-in-one educational platform that teaches you in a more interactive way. Real-time classrooms, automated grading, audio/video broadcasting, and AI study mentors.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
          >
            <Button 
              className="bg-[#F48C06] hover:bg-[#E07E00] text-white font-bold text-base px-8 h-14 rounded-full shadow-[0_8px_25px_rgba(244,140,6,0.35)] transition-all hover:scale-105"
              asChild
            >
              <Link href="/login?mode=signup">Join for free</Link>
            </Button>

            <button 
              onClick={() => setVideoOpen(true)}
              className="inline-flex items-center gap-3.5 text-[#2F327D] hover:text-[#F48C06] font-semibold text-base px-4 py-3 group transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-[#23BDEE] fill-[#23BDEE] translate-x-0.5" />
              </div>
              <span>Watch how it works</span>
            </button>
          </motion.div>
        </div>

        {/* Right Column Hero Graphic with Floating Cards */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative w-full max-w-[460px]"
          >
            {/* Main Hero Image */}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
              <Image 
                src="/landing/landing_asset_13.png" 
                alt="Student learning online with SYON" 
                width={544} 
                height={892} 
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* Floating Badge 1: 250k+ Assisted Students */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="absolute top-12 -left-6 sm:-left-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3.5 z-20"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-[#F48C06]">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-black text-[#2F327D] leading-tight">250k+</p>
                <p className="text-xs text-[#696984] font-medium">Assisted Students</p>
              </div>
            </motion.div>

            {/* Floating Badge 2: User Experience Class / Live Session */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="absolute -bottom-6 -left-4 sm:-left-8 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-20 max-w-[280px]"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-[#D8587E]">
                <Image 
                  src="/landing/landing_asset_14.jpg" 
                  alt="Tutor avatar" 
                  width={60} 
                  height={60} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#2F327D] leading-snug">User Experience Class</p>
                <p className="text-[11px] text-[#696984]">Today at 12:00 PM</p>
                <span className="inline-block px-2 py-0.5 bg-[#D8587E] text-white text-[10px] font-bold rounded-full">
                  Join Now
                </span>
              </div>
            </motion.div>

            {/* Floating Badge 3: Admission Completed */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="absolute top-1/2 -right-4 sm:-right-8 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2F327D]">Congratulations</p>
                <p className="text-[11px] text-[#696984]">Your admission completed</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal Preview */}
      <AnimatePresence>
        {videoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setVideoOpen(false)}
          >
            <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setVideoOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="aspect-video w-full">
                <video autoPlay loop controls className="w-full h-full object-cover">
                  <source src="/make_it_a_male_voice___the_ui.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// 3. Companies / Trust Section
const TrustSection = () => {
  const companies = [
    { name: 'Google', logo: 'Google' },
    { name: 'Netflix', logo: 'NETFLIX' },
    { name: 'Airbnb', logo: 'airbnb' },
    { name: 'Amazon', logo: 'amazon' },
    { name: 'Facebook', logo: 'facebook' },
    { name: 'Grab', logo: 'Grab' },
  ];

  return (
    <section className="py-14 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
        <p className="text-[#696984] text-sm font-semibold tracking-wider uppercase">
          Trusted by 5,000+ Schools & Companies Worldwide
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
          {companies.map((c, i) => (
            <span key={i} className="text-xl md:text-2xl font-extrabold tracking-tight text-[#2F327D]/70 hover:text-[#2F327D]">
              {c.logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. "What is SYON?" / Pillars Section
const WhatIsSection = () => {
  const pillars = [
    {
      title: "Online Billing, Invoicing, & Contracts",
      desc: "Simple and secure payments. Manage tuition fees, subscription plans, and contract generation automatically.",
      color: "#545AE8",
      bg: "bg-[#545AE8]/10",
      icon: FileText,
    },
    {
      title: "Easy Scheduling & Attendance Tracking",
      desc: "Schedule interactive live sessions, timetable synchronization, and automated student attendance reports.",
      color: "#F48C06",
      bg: "bg-[#F48C06]/10",
      icon: Calendar,
    },
    {
      title: "Customer Tracking & Gamification",
      desc: "Track student submissions, assign badges, celebrate milestones, and boost motivation with leaderboard scores.",
      color: "#23BDEE",
      bg: "bg-[#23BDEE]/10",
      icon: Users,
    }
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2F327D] tracking-tight">
            All-in-One <span className="text-[#F48C06]">Cloud LMS</span> Software.
          </h2>
          <p className="text-[#696984] text-base sm:text-lg leading-relaxed">
            SYON is a complete digital learning platform that enables educators to manage course material, host interactive live classrooms, evaluate assignments, and monitor real-time student progress in one place.
          </p>
        </div>

        {/* 3 Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[2rem] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-orange-200 transition-all"
            >
              <div className="space-y-5">
                <div className={`w-14 h-14 rounded-2xl ${p.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <p.icon className="w-7 h-7" style={{ color: p.color }} />
                </div>
                <h3 className="text-xl font-bold text-[#2F327D] leading-snug">
                  {p.title}
                </h3>
                <p className="text-[#696984] text-sm leading-relaxed">
                  {p.desc}
                </p>
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:gap-2.5 transition-all" style={{ color: p.color }}>
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 5. Dual Role Portals (Instructors vs Students)
const PortalsSection = () => {
  return (
    <section id="portals" className="py-20 bg-[#FBFBFB]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2F327D] tracking-tight">
            Everything you can do in a physical classroom, <br />
            <span className="text-[#F48C06]">you can do with SYON</span>
          </h2>
          <p className="text-[#696984] text-base leading-relaxed">
            SYON's school management suite empowers traditional schools, independent tutors, and online academies to manage curricula, grading, and interactive live classes seamlessly.
          </p>
        </div>

        {/* 2 Banner Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Instructor Card */}
          <div className="relative isolate rounded-[2.5rem] overflow-hidden group shadow-xl min-h-[380px] flex flex-col justify-end p-8 sm:p-10 bg-[#171B41]">
            <Image 
              src="/landing/landing_asset_11.png" 
              alt="Instructor in virtual classroom" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700 -z-10 opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171B41] via-[#171B41]/60 to-transparent -z-10" />

            <div className="relative z-10 space-y-4 text-white">
              <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                FOR INSTRUCTORS
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-snug">
                Start a class today & empower learners
              </h3>
              <p className="text-white/80 text-sm max-w-md">
                Create structured modules, broadcast interactive whiteboard sessions, and use AI-assisted grading to give personalized feedback.
              </p>
              <Button 
                className="bg-transparent border border-white text-white hover:bg-white hover:text-[#171B41] font-bold rounded-full px-6 h-11 transition-all"
                asChild
              >
                <Link href="/login?role=tutor&mode=signup">Start a Class Today</Link>
              </Button>
            </div>
          </div>

          {/* Student Card */}
          <div className="relative isolate rounded-[2.5rem] overflow-hidden group shadow-xl min-h-[380px] flex flex-col justify-end p-8 sm:p-10 bg-[#171B41]">
            <Image 
              src="/landing/landing_asset_12.png" 
              alt="Students learning together" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700 -z-10 opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171B41] via-[#171B41]/60 to-transparent -z-10" />

            <div className="relative z-10 space-y-4 text-white">
              <span className="px-3.5 py-1 rounded-full bg-[#23BDEE]/30 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-[#23BDEE]">
                FOR STUDENTS
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-snug">
                Enter your classroom & excel in exams
              </h3>
              <p className="text-white/80 text-sm max-w-md">
                Access curated subjects, past exam papers, peer discussion boards, and real-time live tutoring sessions.
              </p>
              <Button 
                className="bg-[#23BDEE] hover:bg-[#1CA8D6] text-white font-bold rounded-full px-6 h-11 shadow-[0_4px_15px_rgba(35,189,238,0.4)] transition-all"
                asChild
              >
                <Link href="/login?role=student&mode=signup">Enter Access Code</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 6. Our Features Showcase (Classroom Interface)
const FeaturesShowcase = () => {
  const features = [
    {
      title: "Teachers don't get lost in the grid view and have a dedicated podium",
      color: "#2F327D",
    },
    {
      title: "TA's and presenters can be moved to the front-row for seamless collaboration",
      color: "#F48C06",
    },
    {
      title: "Teachers can see all students and their engagement data at the same time",
      color: "#23BDEE",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Feature Highlights */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#F48C06]">
              OUR FEATURES
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2F327D] tracking-tight leading-tight">
              A user interface designed <br />
              <span className="text-[#F48C06]">for the modern classroom</span>
            </h2>
          </div>

          <div className="space-y-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-1">
                  <Check className="w-4 h-4 text-[#F48C06] stroke-[3]" />
                </div>
                <p className="text-[#696984] text-base leading-relaxed font-medium">
                  {f.title}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button 
              className="bg-[#2F327D] hover:bg-[#1E2052] text-white font-bold text-sm px-8 h-12 rounded-full transition-all"
              asChild
            >
              <Link href="/login?mode=signup">Explore Classroom Demo</Link>
            </Button>
          </div>
        </div>

        {/* Right Column: Classroom UI Mockup */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="relative w-full max-w-[580px]">
            {/* Colored background squares matching Figma */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#23BDEE] rounded-3xl -z-10" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#F3AC50] rounded-3xl -z-10" />

            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              <Image 
                src="/landing/landing_asset_10.jpg" 
                alt="SYON Classroom Interface Mockup" 
                width={705} 
                height={471} 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 7. Interactive Teaching Tools (Agora / Whiteboard / Media)
const ToolsSection = () => {
  return (
    <section id="tools" className="py-24 bg-[#FFF9F0]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">
        
        {/* Tool 1: Tools For Teachers And Learners */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-[500px] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <Image 
                src="/landing/landing_asset_3.jpg" 
                alt="Tools for teachers and learners" 
                width={600} 
                height={400} 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-3xl sm:text-4xl font-black text-[#2F327D] tracking-tight leading-tight">
              <span className="text-[#F48C06]">Tools</span> For Teachers And Learners
            </h3>
            <p className="text-[#696984] text-base leading-relaxed">
              Class has a dynamic set of teaching tools built to be deployed easily. Facilitate teamwork, organize breakout rooms, and broadcast interactive whiteboard exercises without extra software.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-[#2F327D] font-bold text-sm">
                <Video className="w-5 h-5 text-[#F48C06]" /> Real-time Video
              </div>
              <div className="flex items-center gap-2 text-[#2F327D] font-bold text-sm">
                <Laptop className="w-5 h-5 text-[#23BDEE]" /> Live Whiteboard
              </div>
            </div>
          </div>
        </div>

        {/* Tool 2: Assessments, Quizzes, Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 lg:order-2 relative flex justify-center">
            <div className="relative w-full max-w-[420px] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white">
              <Image 
                src="/landing/landing_asset_8.png" 
                alt="Assessments and quizzes" 
                width={396} 
                height={611} 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1 space-y-6">
            <h3 className="text-3xl sm:text-4xl font-black text-[#2F327D] tracking-tight leading-tight">
              Assessments, <span className="text-[#F48C06]">Quizzes</span>, Tests
            </h3>
            <p className="text-[#696984] text-base leading-relaxed">
              Easily launch quizzes and automated knowledge checks directly within the virtual classroom. Student results are automatically graded and recorded into the gradebook.
            </p>
            <Button 
              className="bg-[#F48C06] hover:bg-[#E07E00] text-white font-bold rounded-full px-6 h-11"
              asChild
            >
              <Link href="/login?mode=signup">Explore Test Engine</Link>
            </Button>
          </div>
        </div>

        {/* Tool 3: Class Management & Forum */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-[500px] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <Image 
                src="/landing/landing_asset_9.png" 
                alt="Class management and discussion forum" 
                width={518} 
                height={290} 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-3xl sm:text-4xl font-black text-[#2F327D] tracking-tight leading-tight">
              <span className="text-[#F48C06]">Class Management</span> Tools for Educators
            </h3>
            <p className="text-[#696984] text-base leading-relaxed">
              Never worry about disorganized lesson plans again. Grade submissions, mark assignments, organize forum discussions, and communicate in real-time with parents and students.
            </p>
            <div className="pt-2">
              <Button 
                variant="outline"
                className="border-[#2F327D] text-[#2F327D] hover:bg-[#2F327D] hover:text-white font-bold rounded-full px-6 h-11 transition-all"
                asChild
              >
                <Link href="/login?role=tutor">Tutor Portal Tour</Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

// 8. Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Gloria Rose",
      role: "A-Level Student & Parent",
      rating: 5,
      reviewsCount: 12,
      quote: "Thank you so much for your help. SYON is exactly what I've been looking for. It really saves me time and effort. The live tutoring and instant quizzes helped me score straight A's in my Cambridge & ZIMSEC exams!",
      avatar: "/landing/landing_asset_0.jpg",
    },
    {
      name: "Marcus Vance",
      role: "Senior Mathematics Tutor",
      rating: 5,
      reviewsCount: 28,
      quote: "The automated grading and collaborative whiteboard have transformed how I teach calculus online. My students are 3x more engaged during live sessions.",
      avatar: "/landing/landing_asset_0.jpg",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Side: Header & Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2">
            <span className="w-12 h-0.5 bg-[#525596]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#525596]">
              TESTIMONIAL
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2F327D] tracking-tight leading-tight">
            What They Say <br /> About Us
          </h2>

          <p className="text-[#696984] text-base leading-relaxed">
            SYON has got more than 100k positive ratings from our students, tutors, and school administrators around the world.
          </p>

          <p className="text-[#696984] text-sm">
            Here is what our learners have to say about their daily learning journey with SYON.
          </p>

          <div className="pt-2">
            <Button 
              variant="outline" 
              className="border-[#F48C06] text-[#F48C06] hover:bg-[#F48C06] hover:text-white font-bold rounded-full px-6 h-11 transition-all"
              asChild
            >
              <Link href="/login?mode=signup">Write a review</Link>
            </Button>
          </div>
        </div>

        {/* Right Side: Active Review Card */}
        <div className="lg:col-span-7 relative">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 bg-white p-8 sm:p-12">
            <div className="space-y-6">
              {/* Stars */}
              <div className="flex items-center gap-1.5 text-[#F48C06]">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#F48C06]" />
                ))}
                <span className="text-xs font-semibold text-[#696984] ml-2">
                  ({testimonials[currentIndex].reviewsCount} reviews)
                </span>
              </div>

              {/* Quote */}
              <p className="text-[#696984] text-base sm:text-lg italic leading-relaxed">
                "{testimonials[currentIndex].quote}"
              </p>

              {/* User profile */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-orange-200">
                    <Image 
                      src={testimonials[currentIndex].avatar} 
                      alt={testimonials[currentIndex].name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#2F327D] text-lg">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-xs text-[#696984]">
                      {testimonials[currentIndex].role}
                    </p>
                  </div>
                </div>

                {/* Slider controls */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentIndex((currentIndex - 1 + testimonials.length) % testimonials.length)}
                    className="w-10 h-10 rounded-full border border-gray-200 hover:bg-[#F48C06] hover:text-white hover:border-[#F48C06] flex items-center justify-center transition-colors text-[#2F327D]"
                    aria-label="Previous review"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setCurrentIndex((currentIndex + 1) % testimonials.length)}
                    className="w-10 h-10 rounded-full border border-gray-200 hover:bg-[#F48C06] hover:text-white hover:border-[#F48C06] flex items-center justify-center transition-colors text-[#2F327D]"
                    aria-label="Next review"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 9. Educational News & Blog Section
const BlogSection = () => {
  const posts = [
    {
      title: "Class adds $30 million to its balance sheet for a Zoom-friendly future",
      desc: "Class Technologies Inc., the maker of software for teachers to manage remote classrooms, announces a major expansion.",
      tag: "PRESS RELEASE",
      tagBg: "bg-[#F48C06]/10 text-[#F48C06]",
      image: "/landing/landing_asset_3.jpg",
    },
    {
      title: "Zoom's earliest investors are betting $100M on remote learning tech",
      desc: "How next-gen learning management systems are turning video conferencing into real interactive schools.",
      tag: "NEWS",
      tagBg: "bg-[#23BDEE]/10 text-[#23BDEE]",
      image: "/landing/landing_asset_11.png",
    },
    {
      title: "Former Blackboard CEO joins SYON to lead global digital school expansion",
      desc: "Bringing decades of higher education and secondary school learning management to the next frontier.",
      tag: "LEADERSHIP",
      tagBg: "bg-[#545AE8]/10 text-[#545AE8]",
      image: "/landing/landing_asset_12.png",
    }
  ];

  return (
    <section id="blog" className="py-24 bg-[#FBFBFB]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2F327D] tracking-tight">
            Latest News and Resources
          </h2>
          <p className="text-[#696984] text-base">
            See the developments that have occurred in education, pedagogy, and online classroom innovations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <div 
              key={i}
              className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col group"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image 
                  src={post.image} 
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${post.tagBg}`}>
                    {post.tag}
                  </span>
                  <h3 className="text-lg font-bold text-[#2F327D] leading-snug group-hover:text-[#F48C06] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[#696984] text-xs leading-relaxed line-clamp-3">
                    {post.desc}
                  </p>
                </div>

                <div className="pt-2">
                  <a href="#blog" className="text-xs font-bold text-[#2F327D] group-hover:text-[#F48C06] flex items-center gap-1.5 transition-colors">
                    Read full article <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 10. Dark Slate Footer & Newsletter
const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast({
      title: "Subscribed!",
      description: "Thank you for subscribing to the SYON educational newsletter.",
    });
    setEmail('');
  };

  return (
    <footer className="bg-[#252641] text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        
        {/* Header Branding + Newsletter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-gray-700/60">
          <div className="flex items-center gap-4 text-center md:text-left">
            <SyonLogo />
            <div>
              <span className="text-2xl font-black tracking-tight text-white">SYON</span>
              <p className="text-xs text-[#B2B3CF]">Virtual LMS & Classroom Engine</p>
            </div>
          </div>

          {/* Newsletter Box */}
          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your Email" 
              required
              className="bg-white/10 border border-white/20 text-white placeholder:text-gray-400 px-5 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#545AE8] min-w-[260px]"
            />
            <Button 
              type="submit"
              className="bg-[#545AE8] hover:bg-[#4349D6] text-white font-bold text-sm px-6 h-11 rounded-full shadow-[0_4px_14px_rgba(84,90,232,0.4)]"
            >
              Subscribe
            </Button>
          </form>
        </div>

        {/* Links + Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#B2B3CF]">
          <div className="flex items-center gap-6 font-medium">
            <Link href="/login" className="hover:text-white transition-colors">Portals</Link>
            <Link href="/login?mode=signup" className="hover:text-white transition-colors">Careers</Link>
            <a href="#about" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#features" className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>

          <p>© {new Date().getFullYear()} SYON Technologies Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// --- Main Landing Page Component ---

export function LandingClient() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#F48C06] selection:text-white">
      <Navbar />
      <Hero />
      <TrustSection />
      <WhatIsSection />
      <PortalsSection />
      <FeaturesShowcase />
      <ToolsSection />
      <TestimonialsSection />
      <BlogSection />
      <Footer />
    </div>
  );
}
