'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Check, 
  Plus, 
  Minus, 
  Menu, 
  X, 
  BarChart3, 
  BookOpen, 
  GraduationCap, 
  Zap, 
  Globe,
  Brain,
  Video,
  Library,
  Trophy,
  MessageCircle,
  MoreHorizontal
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

// --- Components ---

const AnimatedNumber = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return spring.onChange((latest) => {
      setDisplayValue(latest);
    });
  }, [spring]);

  return <span>{displayValue.toFixed(displayValue > 100 ? 0 : 1)}{suffix}</span>;
};

const Navbar = () => {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(scrollY, [0, 100], ['rgba(0,0,0,0)', 'rgba(27, 43, 31, 0.8)']);
  const backdropBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(12px)']);

  return (
    <motion.nav 
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-12 transition-all"
    >
      {/* Left: Nav Links in Pill */}
      <div className="flex-1 hidden lg:flex items-center">
        <div className="bg-background/20 backdrop-blur-md border border-border rounded-full px-4 py-1.5 flex gap-8 text-[10px] font-semibold text-foreground/">
            <a href="#methodology" className="hover:text-foreground transition-colors">Methodology</a>
            <a href="#curriculum" className="hover:text-foreground transition-colors">Curriculum</a>
            <a href="#resources" className="hover:text-foreground transition-colors">Resources</a>
        </div>
      </div>
      
      {/* Center: Logo */}
      <div className="flex flex-col items-center gap-0 absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <Image 
          src="/logo.png" 
          alt="Dr Max Online School Logo" 
          width={64} 
          height={24} 
          className="object-contain" 
          priority
        />
      </div>

      {/* Right: Auth & Menu */}
      <div className="flex-1 flex items-center justify-end gap-6">
        <Link href="/login" className="text-foreground text-xs font-bold hover:opacity-80 transition-opacity">Login</Link>
        <Button className="bg-white text-background hover:bg-muted font-bold px-5 h-8 rounded-full text-xs" asChild>
            <Link href="/login?mode=signup">Enroll now</Link>
        </Button>
        {/* aria-label required: icon-only button must have an accessible name */}
        <Button variant="ghost" size="icon" className="text-foreground" aria-label="Toggle navigation menu">
            <Menu className="w-6 h-6" />
        </Button>
      </div>
    </motion.nav>
  );
};

const Hero = () => {
  return (
    <section className="relative h-screen flex items-end overflow-hidden bg-background">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://picsum.photos/seed/edu-hero-precise/1920/1080"
          alt="Student learning"
          fill
          className="object-cover brightness-90"
          priority
          sizes="100vw"
          data-ai-hint="student learning"
        />
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        {/* Left Side Content - Bottom-aligned */}
        <div className="lg:col-span-8 mb-4">
          <motion.h1
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-[74px] font-headline font-bold text-foreground leading-[0.85] tracking-tight"
          >
            The future of <br /> learning together
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-8 text-base md:text-lg text-foreground/ max-w-xl leading-relaxed"
          >
            Empowering students with AI-driven paths, expert tutors, and a world-class curriculum designed for digital excellence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-10 flex items-center gap-4"
          >
            <Button size="lg" className="bg-gold text-background hover:bg-gold/90 font-bold px-7 h-11 rounded-full text-base group shadow-xl shadow-black/20" asChild>
              <Link href="/login?mode=signup">
                Start learning <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-border bg-muted backdrop-blur-md text-foreground hover:bg-muted font-bold px-7 h-11 rounded-full text-base shadow-xl shadow-black/20" asChild>
                <Link href="/login">Role Preview</Link>
            </Button>
          </motion.div>
        </div>

        {/* Right Side Floating Card - Resized smaller */}
        <div className="lg:col-span-4 flex justify-end">
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 0.6 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            className="relative z-10 origin-bottom-right"
          >
            <div className="bg-muted backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl shadow-black/20 min-w-[380px]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-foreground font-headline font-bold text-3xl">Academic Growth</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-gold" />
                    <p className="text-foreground/ text-xs font-bold uppercase tracking-widest">Average student mastery levels</p>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center">
                  <BarChart3 className="text-background w-8 h-8" />
                </div>
              </div>
              
              <div className="flex items-end gap-4 h-40">
                {[40, 65, 35, 95, 55, 80, 75].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1.2 + i * 0.1, duration: 0.8 }}
                    className={`flex-1 ${i === 3 ? 'bg-foreground' : 'bg-muted'} rounded-2xl relative group overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform" />
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-border grid grid-cols-2 gap-4">
                <div>
                  <p className="text-foreground/ text-[10px] uppercase tracking-widest font-bold">Retention Rate</p>
                  <p className="text-2xl text-foreground font-bold mt-1">98.4%</p>
                </div>
                <div>
                  <p className="text-foreground/ text-[10px] uppercase tracking-widest font-bold">Pass Velocity</p>
                  <p className="text-2xl text-foreground font-bold mt-1">+24.5%</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 text-foreground/ text-[10px] font-bold italic">
                <Plus className="w-3 h-3" />
                <span>Updated every semester</span>
              </div>
            </div>
            {/* Shadow for separation */}
            <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-background/40 blur-[120px] rounded-full -z-10 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Marquee = () => {
  const brands = ["EduCore", "ThinkLab", "LearnGrid", "SkillPath", "StudyFlow", "EduNova", "Academiq"];
  
  return (
    <div className="bg-background pt-24 pb-12 overflow-hidden">


      <div className="flex whitespace-nowrap">
        <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="flex gap-20 items-center px-10"
        >
            {[...brands, ...brands].map((item, i) => (
            <span key={i} className="text-2xl font-headline font-bold text-background/30 uppercase tracking-tighter italic">
                {item}
            </span>
            ))}
        </motion.div>
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <section id="methodology" className="py-24 px-6 md:px-12 bg-[#F8F9FA] relative">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-stretch">
        {/* Left Column: Massive Headline & Text */}
        <div className="lg:col-span-5 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-7xl font-headline font-bold text-background leading-[1] tracking-tight">
              Build for your <br /> next gen of <br /> learning
            </h2>
            <div className="mt-10 flex flex-wrap gap-4">
               <Button size="lg" className="bg-background text-foreground hover:bg-background/90 font-bold px-8 h-14 rounded-full text-md group">
                  Start learning <ArrowRight className="ml-2 w-4 h-4" />
               </Button>
               <Button size="lg" variant="outline" className="border-background/10 text-foreground hover:bg-muted font-bold px-8 h-14 rounded-full text-md">
                  Learn more
               </Button>
            </div>
            
            <div className="mt-16 space-y-6 max-w-md">
              <p className="text-background/60 text-lg leading-relaxed">
                Experience seamless integration of technology and education, built for your success and convenience.
              </p>
              <p className="text-background/60 text-lg leading-relaxed font-bold">
                The power of an AI-driven school, with none of the legacy baggage. Dr Max gives modern learners and tutors an intuitive platform for exam-readiness and mastery.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Bento Feature Cards - Exact Stagger and Scale */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative h-full">
            {/* Card 1: Landscape (Wide/Short) - Light Background */}
            <motion.div 
                initial={{ opacity: 0, y: 40, scale: 0.93 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0 }}
                className="bg-[#F1F3F5] border border-border rounded-[2.5rem] p-7 flex flex-col justify-between md:col-span-3 lg:col-span-2 min-h-[224px] absolute bottom-[10px] left-0 w-[57%]"
            >
                <div className="space-y-6">
                    <h3 className="text-2xl font-headline font-bold text-background tracking-tight leading-tight">
                        Control study <br /> effortlessly at any pace
                    </h3>
                    <ul className="space-y-4 text-background/60 font-medium">
                        <li className="flex items-center gap-3">
                            <ArrowRight className="w-4 h-4" /> 
                            <span>Adaptive learning paths</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <ArrowRight className="w-4 h-4" /> 
                            <span>24/7 AI tutor support</span>
                        </li>
                    </ul>
                </div>
                <Button variant="ghost" className="mt-7 w-fit bg-background text-foreground hover:bg-background/90 rounded-full px-5 h-9 font-bold flex gap-2 text-sm">
                    Manage studies <ArrowRight className="w-4 h-4" />
                </Button>
            </motion.div>

            {/* Card 2: Portrait (Narrow/Tall) - Dark Background */}
            <motion.div 
                initial={{ opacity: 0, y: 40, scale: 0.93 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="bg-background rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden absolute bottom-[10px] right-0 w-[40%] min-h-[380px]"
            >
                <div className="space-y-8 relative z-10">
                    {/* UI Mockup Snippets */}
                    <div className="space-y-4">
                        <div className="bg-muted backdrop-blur-md rounded-2xl p-4 border border-border w-full flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-gold" />
                                </div>
                                <span className="text-foreground text-sm font-bold">Ask AI Buddy</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Plus className="w-4 h-4 text-foreground" />
                            </div>
                        </div>

                        <div className="bg-muted backdrop-blur-md rounded-2xl p-4 border border-border w-fit ml-auto flex items-center gap-4">
                             <span className="text-foreground/ text-xs font-bold uppercase tracking-widest">Ongoing session</span>
                             <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full border-2 border-background bg-gold overflow-hidden">
                                    <Image src="https://picsum.photos/seed/face1/40/40" alt="user" width={40} height={40} />
                                </div>
                                <div className="w-6 h-6 rounded-full border-2 border-background bg-gold overflow-hidden">
                                    <Image src="https://picsum.photos/seed/face2/40/40" alt="user" width={40} height={40} />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 relative z-10">
                    <h3 className="text-3xl font-headline font-bold text-gold tracking-tight leading-tight">
                        Fuel your future with <br /> world-class certified <br /> expert tutors
                    </h3>
                </div>

                {/* Abstract Shadow Style Overlay */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-150">
                        <path fill="#D1F366" d="M44.7,-76.4C58.1,-69.2,70.1,-58.5,77.4,-45.3C84.7,-32.1,87.3,-16,85.1,-0.6C82.9,14.8,75.9,29.5,67,42.5C58.1,55.5,47.3,66.8,34.4,73.5C21.5,80.2,6.5,82.3,-8.4,79.5C-23.3,76.7,-38.1,69,-50.2,58.4C-62.3,47.8,-71.7,34.3,-76.5,19.3C-81.3,4.3,-81.5,-12.3,-75.7,-26.8C-69.9,-41.3,-58.1,-53.7,-44.6,-61C-31.1,-68.3,-15.5,-70.5,-0.1,-70.3C15.3,-70.1,31.2,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
                    </svg>
                </div>
            </motion.div>
        </div>
      </div>
    </section>
  );
};

const StudySimulator = () => {
  const [hours, setHours] = useState(10);
  // Base 60% + 2% per hour, max 99%
  const projectedGrade = Math.min(60 + (hours * 3), 99);
  const masteryBoost = hours * 1.5;

  return (
    <section className="py-32 px-6 md:px-12 bg-white">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-5xl md:text-7xl font-headline font-bold text-background leading-[0.9] tracking-tight">Visualize your <br /> success.</h2>
          <p className="mt-8 text-2xl text-background/60 max-w-md leading-relaxed">Our algorithm projects your performance based on commitment and resource engagement.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gold p-12 rounded-[3rem] text-background shadow-2xl shadow-gold/20"
        >
          <div className="space-y-12">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-sm uppercase tracking-widest">Weekly Study Hours</span>
                <span className="text-2xl font-bold font-headline">{hours} hrs</span>
              </div>
              {/* aria-label required: no visible <label> is associated with this input */}
              <input 
                type="range" 
                min="1" 
                max="40" 
                step="1"
                value={hours}
                aria-label="Select weekly study hours"
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full h-2.5 bg-background/10 rounded-full appearance-none cursor-pointer accent-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-background/10 pt-12">
              <div>
                <p className="text-background/40 text-xs uppercase font-bold tracking-widest">Projected Grade</p>
                <div className="text-4xl font-headline font-bold mt-4 tracking-tighter">
                  <AnimatedNumber value={projectedGrade} suffix="%" />
                </div>
              </div>
              <div>
                <p className="text-background/40 text-xs uppercase font-bold tracking-widest">Mastery Velocity</p>
                <div className="text-4xl font-headline font-bold mt-4 text-background tracking-tighter">
                  <AnimatedNumber value={masteryBoost} suffix="x" />
                </div>
              </div>
            </div>

            <Button className="w-full bg-background text-foreground hover:bg-background/90 h-[60px] rounded-2xl font-bold text-base transition-all active:scale-95" asChild>
              <Link href="/login?mode=signup">Unlock Full Potential</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start start"]
  });

  const backgroundColor = useTransform(scrollYProgress, [0.5, 1], ["#242424", "#1A1A1A"]);
  const textColor = useTransform(scrollYProgress, [0.5, 1], ["#FFFFFF", "#FFFFFF"]);

  return (
    <motion.section 
      ref={containerRef}
      style={{ backgroundColor }}
      className="py-32 px-6 md:px-12 transition-colors duration-500"
    >
      <div className="container mx-auto max-w-4xl">
        <motion.h2 
          style={{ color: textColor }}
          className="text-5xl md:text-8xl font-headline font-bold mb-20 text-center leading-[0.85] tracking-tight"
        >
          Frequently Asked <br /> Questions
        </motion.h2>

        {mounted ? (
          <Accordion type="single" collapsible className="space-y-6">
            {[
              { q: "Is Dr Max Online School accredited?", a: "Yes, our curriculum is fully aligned with national standards and our certificates are recognized globally for further education." },
              { q: "How do the AI tutors work?", a: "Our AI Study Buddy uses advanced Gemini LLMs to analyze your specific learning gaps and generate personalized summaries, quizzes, and study paths." },
              { q: "Can I switch between subjects?", a: "Absolutely. Our platform is designed for flexible learning. You can enroll in multiple courses and manage them all from a single dashboard." },
              { q: "What role do parents play?", a: "Parents have a dedicated portal to monitor attendance, real-time progress, and academic milestones, ensuring a collaborative approach to education." }
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b-0">
                <motion.div 
                  style={{ backgroundColor: i % 2 === 0 ? 'rgba(128, 0, 0, 0.15)' : 'transparent' }}
                  className="rounded-3xl border border-border overflow-hidden"
                >
                  <AccordionTrigger className="px-10 py-8 text-foreground hover:no-underline group">
                    <span className="text-left font-headline font-bold text-2xl tracking-tight">{item.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-10 pb-10 text-foreground/ text-xl leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </motion.div>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="space-y-6">
            {[
              { q: "Is Dr Max Online School accredited?", a: "Yes, our curriculum is fully aligned with national standards and our certificates are recognized globally for further education." },
              { q: "How do the AI tutors work?", a: "Our AI Study Buddy uses advanced Gemini LLMs to analyze your specific learning gaps and generate personalized summaries, quizzes, and study paths." },
              { q: "Can I switch between subjects?", a: "Absolutely. Our platform is designed for flexible learning. You can enroll in multiple courses and manage them all from a single dashboard." },
              { q: "What role do parents play?", a: "Parents have a dedicated portal to monitor attendance, real-time progress, and academic milestones, ensuring a collaborative approach to education." }
            ].map((item, i) => (
              <div key={i} className="rounded-3xl border border-border overflow-hidden px-10 py-8">
                <span className="text-left font-headline font-bold text-2xl tracking-tight">{item.q}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

const ParallaxTestimonial = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -300]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      <motion.div style={{ y }} className="absolute -inset-y-40 inset-x-0">
        <Image 
          src="https://picsum.photos/seed/edu-parallax-exact/1600/900"
          alt="Student Success"
          fill
          className="object-cover brightness-50"
          sizes="100vw"
          data-ai-hint="graduated student"
        />
      </motion.div>
      
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-32 bg-gradient-to-t from-background to-transparent">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-gold p-10 rounded-[2.5rem] max-w-2xl shadow-2xl shadow-black/40"
        >
          <p className="text-2xl md:text-4xl font-headline font-bold text-background leading-[1] tracking-tight">
            "Since joining Dr Max, my grade in Mathematics jumped from a C to an A+. The AI tutor changed how I study forever."
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center">
                <Trophy className="text-gold w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-background text-lg">Sarah Jenkins</p>
              <p className="text-background/60 text-xs font-bold uppercase tracking-widest">Grade 11 Student</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-background text-foreground py-32 px-6 md:px-12 border-t border-border">
      <div className="container mx-auto">
        <div className="flex flex-col items-center text-center mb-32">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl md:text-[140px] font-headline font-bold mb-16 leading-[0.8] tracking-tighter"
          >
            Start your digital <br /> learning journey
          </motion.h2>
          <Button size="lg" className="bg-gold text-background hover:bg-gold/90 font-bold px-16 h-24 rounded-full text-3xl group transition-all duration-500 shadow-2xl shadow-gold/20" asChild>
            <Link href="/login?mode=signup">
                Enroll Today <ArrowRight className="ml-6 w-10 h-10 group-hover:translate-x-3 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-16 pt-32 border-t border-border">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2">
                <Image src="/logo.png" alt="Dr Max Logo" width={48} height={48} className="object-contain" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-headline font-bold text-3xl">Dr Max</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold/80">Online School</span>
              </div>
            </div>
            <p className="text-foreground/ max-w-xs text-lg leading-relaxed font-medium">
              Pioneering the future of digital education with AI-powered personalized learning systems.
            </p>
          </div>
          
          {[
            { title: "Methodology", links: [{label: "AI Tutoring", href: "#"}, {label: "Virtual Labs", href: "#"}, {label: "Hybrid Learning", href: "#"}, {label: "Assessment", href: "#"}] },
            { title: "Portals", links: [{label: "Students", href: "/login/student"}, {label: "Tutors", href: "/login/tutor"}, {label: "Parents", href: "/login/parent"}, {label: "Administrators", href: "/login/admin"}] },
            { title: "Resources", links: [{label: "Library", href: "#"}, {label: "Forums", href: "#"}, {label: "Live Archive", href: "#"}, {label: "Support", href: "#"}] },
            { title: "Institution", links: [{label: "About", href: "#"}, {label: "Faculty", href: "#"}, {label: "Contact", href: "#"}, {label: "Privacy", href: "#"}] }
          ].map((section, i) => (
            <div key={i}>
              <h4 className="font-bold mb-8 text-xs uppercase tracking-[0.2em] text-gold">{section.title}</h4>
              <ul className="space-y-5 text-foreground/ font-medium">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="hover:text-foreground transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-32 pt-10 border-t border-border flex flex-col md:row justify-between items-center gap-10 text-foreground/ text-sm font-bold uppercase tracking-widest">
          <p>© 2024 Dr Max Online School. All rights reserved.</p>
          <div className="flex gap-12">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const LandingClient = () => {
  return (
    <div className="dark min-h-screen bg-background text-foreground selection:bg-gold selection:text-background">
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <StudySimulator />
      <FAQ />
      <ParallaxTestimonial />
      <Footer />
    </div>
  );
};
