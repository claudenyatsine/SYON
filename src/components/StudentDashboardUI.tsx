import React from 'react';
import { 
  Search, ChevronDown, LayoutDashboard, BookOpen, Users, 
  GraduationCap, Plus, Calendar as CalendarIcon, MessageSquare, 
  ClipboardList, Clock, BarChart2, Paperclip, Smile, Send
} from 'lucide-react';

export default function StudentDashboardUI() {
  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* 1. Left Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-border bg-background/95">
        <div className="p-6">
          <div className="flex items-center gap-2 text-foreground font-bold text-xl mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-black">
              DR
            </div>
            DrMax LMS
          </div>

          <div className="space-y-1 mb-8">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem icon={<BookOpen size={20} />} label="My Courses" />
            <NavItem icon={<Users size={20} />} label="My Students" active />
            <NavItem icon={<GraduationCap size={20} />} label="Gradebook" />
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
            <button className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c29f2f] text-black font-semibold py-2.5 px-4 rounded-xl transition-colors">
              <Plus size={18} />
              Create New Task
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-muted/50 hover:bg-muted text-foreground font-medium py-2.5 px-4 rounded-xl transition-colors border border-slate-700">
              <CalendarIcon size={18} />
              Schedule Reminder
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Middle Column ("My Students" List) */}
      <section className="w-80 flex-shrink-0 flex flex-col border-r border-border bg-background">
        <div className="p-6 pb-4">
          <h2 className="text-[#D4AF37] text-2xl font-semibold mb-1">My Students</h2>
          <p className="text-sm text-muted-foreground mb-6">Manage tasks, track progress, and support your students.</p>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          <button className="w-full flex items-center justify-between bg-card border border-border rounded-xl py-2.5 px-4 text-sm text-muted-foreground hover:bg-muted transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 flex items-center justify-center">≡</span>
              All Subjects
            </div>
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
          <StudentCard 
            name="Pelaiah Tadiwanashe Tapera Ngarande" 
            level="A-Level Student"
            progress="84%"
            active
          />
          <StudentCard 
            name="Tafadzwa Chikomo" 
            level="A-Level Student"
            progress="72%"
            status="away"
          />
          <StudentCard 
            name="Ruvimbo Moyo" 
            level="A-Level Student"
            progress="63%"
            status="away"
          />
          <StudentCard 
            name="Tatenda Chisango" 
            level="A-Level Student"
            progress="91%"
            status="online"
          />
          <StudentCard 
            name="Nyasha Rakotoni" 
            level="A-Level Student"
            progress="78%"
            status="away"
          />
        </div>

        <div className="p-4 border-t border-border">
          <button className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Users size={16} />
            View All Students
          </button>
        </div>
      </section>

      {/* 3. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background p-6 overflow-hidden">
        
        {/* Top Header Card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pelaiah" 
                alt="Pelaiah" 
                className="w-16 h-16 rounded-full bg-muted border-2 border-[#D4AF37]"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-[#0B0C10] rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground mb-1">Pelaiah Tadiwanashe Tapera Ngarande</h1>
              <p className="text-sm text-muted-foreground mb-3">iampelaiah.n@gmail.com</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5">
                  <BookOpen size={12} /> A-Level Student
                </span>
                <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5">
                  <Clock size={12} /> Joined Jan 2025
                </span>
                <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Last active: Today
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-4 min-w-[200px]">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-green-400">84%</span>
                <span className="text-green-400 text-sm flex items-center">↗</span>
              </div>
              <p className="text-xs text-muted-foreground">9 of 11 tasks completed</p>
            </div>
            <div className="w-24 h-12 opacity-80">
              <Sparkline color="#4ade80" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-px">
          <Tab active icon={<MessageSquare size={16} />} label="Chat" />
          <Tab icon={<ClipboardList size={16} />} label="Assignments" />
          <Tab icon={<CalendarIcon size={16} />} label="Deadlines" />
          <Tab icon={<BarChart2 size={16} />} label="Performance Review" />
        </div>

        {/* Lower Split Grid */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 gap-6 min-h-0 overflow-hidden">
          
          {/* Left Side (Chat & Progress) */}
          <div className="xl:col-span-3 flex flex-col gap-6 min-h-0">
            {/* Chat Interface */}
            <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden min-h-0">
              <div className="p-4 border-b border-border flex justify-between items-center bg-card">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <MessageSquare size={18} className="text-muted-foreground" />
                  Chat with Pelaiah
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Search size={18} className="cursor-pointer hover:text-foreground" />
                  <span className="text-xl leading-none mb-1 cursor-pointer hover:text-foreground">⋮</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="flex justify-center">
                  <span className="text-xs text-muted-foreground bg-card px-3 py-1 rounded-full border border-border">Today</span>
                </div>

                <div className="flex items-start gap-3">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pelaiah" alt="Student" className="w-8 h-8 rounded-full bg-muted" />
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div className="bg-muted text-foreground p-3.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm">
                      Good morning sir, I have a question about the heritage studies assignment.
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-1">09:15 AM</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 flex-row-reverse">
                  <div className="flex flex-col gap-1 max-w-[80%] items-end">
                    <div className="bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] p-3.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
                      Good morning Pelaiah! Sure, what would you like to know?
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mr-1">
                      09:17 AM <span className="text-[#D4AF37]">✓✓</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pelaiah" alt="Student" className="w-8 h-8 rounded-full bg-muted" />
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div className="bg-muted text-foreground p-3.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm">
                      I'm not sure how to structure the analysis section.
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-1">09:18 AM</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 flex-row-reverse">
                  <div className="flex flex-col gap-1 max-w-[80%] items-end">
                    <div className="bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] p-3.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
                      Let's discuss it. How about a quick call in 10 minutes?
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mr-1">
                      09:20 AM <span className="text-[#D4AF37]">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-card border-t border-border">
                <div className="relative flex items-center bg-muted/50 border border-slate-700/50 rounded-xl overflow-hidden focus-within:border-slate-500 transition-colors">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent py-3 pl-4 pr-12 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
                  />
                  <div className="absolute right-3 flex items-center gap-3">
                    <Paperclip size={18} className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                    <Smile size={18} className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                    <button className="w-8 h-8 bg-[#D4AF37] hover:bg-[#c29f2f] rounded-lg flex items-center justify-center text-black ml-1 transition-colors">
                      <Send size={14} className="-ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Progress Overview */}
            <div className="bg-card border border-border rounded-2xl p-6 shrink-0">
              <div className="flex items-center gap-2 font-medium text-foreground mb-5">
                <BookOpen size={18} className="text-[#D4AF37]" />
                Subject Progress Overview
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <ProgressBar label="Divinity" percent={90} color="bg-green-500" />
                <ProgressBar label="Heritage Studies" percent={85} color="bg-green-500" />
                <ProgressBar label="Geography" percent={75} color="bg-[#D4AF37]" />
                <ProgressBar label="History" percent={70} color="bg-[#D4AF37]" />
              </div>
            </div>
          </div>

          {/* Right Side (Widgets) */}
          <div className="xl:col-span-2 flex flex-col gap-6 min-h-0 overflow-y-auto custom-scrollbar pr-1">
            
            {/* Upcoming Deadlines */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <CalendarIcon size={18} className="text-purple-400" />
                  Upcoming Deadlines
                </div>
                <button className="text-xs text-[#D4AF37] hover:underline">View all</button>
              </div>
              
              <div className="space-y-4">
                <DeadlineItem dotColor="bg-red-500" title="Heritage Studies Essay" date="May 10, 2026" timeLeft="2 days left" timeColor="text-red-400" />
                <DeadlineItem dotColor="bg-[#D4AF37]" title="Geography Field Report" date="May 15, 2026" timeLeft="7 days left" timeColor="text-[#D4AF37]" />
                <DeadlineItem dotColor="bg-[#D4AF37]" title="Divinity Reflection" date="May 22, 2026" timeLeft="14 days left" timeColor="text-[#D4AF37]" />
                <DeadlineItem dotColor="bg-green-500" title="History Timeline Project" date="May 30, 2026" timeLeft="22 days left" timeColor="text-green-400" />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 font-medium text-foreground mb-5">
                <ActivityIcon />
                Recent Activity
              </div>
              
              <div className="space-y-5 relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-muted">
                <ActivityItem 
                  title="Submitted: Geography Field Notes" 
                  time="Today, 08:45 AM" 
                  iconColor="bg-green-500/20 text-green-500" 
                  icon="✓"
                />
                <ActivityItem 
                  title="Completed: Divinity Quiz" 
                  time="Yesterday, 04:30 PM" 
                  iconColor="bg-green-500/20 text-green-500"
                  icon="✓" 
                />
                <ActivityItem 
                  title="Joined: Study Group Session" 
                  time="May 2, 2026" 
                  iconColor="bg-indigo-500/20 text-indigo-400"
                  icon="→" 
                />
              </div>
            </div>

            {/* Quick Notes */}
            <div className="bg-[#1A1810]/80 border border-[#D4AF37]/20 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 font-medium text-[#D4AF37]">
                  <ClipboardList size={18} />
                  Quick Notes
                </div>
                <button className="text-xs text-[#D4AF37] hover:underline">Add Note</button>
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Pelaiah is showing great improvement in analytical thinking. Encourage more class participation.
              </p>
              
              <p className="text-[10px] text-muted-foreground">Last updated: Today, 09:30 AM</p>
            </div>

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}} />
    </div>
  );
}

// Helper Components

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm ${
      active 
        ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium' 
        : 'text-muted-foreground hover:bg-card hover:text-foreground'
    }`}>
      {icon}
      {label}
    </button>
  );
}

function StudentCard({ name, level, progress, active = false, status = 'online' }: { name: string, level: string, progress: string, active?: boolean, status?: 'online' | 'away' }) {
  return (
    <div className={`p-4 rounded-xl border transition-all cursor-pointer ${
      active 
        ? 'bg-[#D4AF37]/5 border-[#D4AF37]/50' 
        : 'bg-card border-border hover:border-slate-700'
    }`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} className="w-10 h-10 rounded-full bg-muted" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <h4 className="text-sm font-medium text-foreground truncate pr-2">{name}</h4>
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${status === 'online' ? 'bg-green-500' : 'bg-[#D4AF37]'}`}></div>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{level}</p>
          <div className="flex items-center justify-between">
            <span className={active ? 'text-green-400 text-xs font-medium' : 'text-muted-foreground text-xs font-medium'}>
              {progress}
            </span>
            <div className="w-12 h-4 opacity-70">
              <Sparkline color={active || progress > '80' ? '#4ade80' : '#D4AF37'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tab({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors text-sm ${
      active 
        ? 'border-[#D4AF37] text-[#D4AF37] font-medium bg-[#D4AF37]/5 rounded-t-lg' 
        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-card rounded-t-lg'
    }`}>
      {icon}
      {label}
    </button>
  );
}

function ProgressBar({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function DeadlineItem({ dotColor, title, date, timeLeft, timeColor }: { dotColor: string, title: string, date: string, timeLeft: string, timeColor: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-2 h-2 rounded-full mt-2 ${dotColor}`}></div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-foreground mb-0.5">{title}</h4>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <div className={`text-xs font-medium ${timeColor} mt-0.5`}>{timeLeft}</div>
    </div>
  );
}

function ActivityItem({ title, time, iconColor, icon }: { title: string, time: string, iconColor: string, icon: string }) {
  return (
    <div className="relative pl-8 flex items-start gap-3">
      <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-[#0B0C10] ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm text-foreground mb-0.5">{title}</h4>
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
      <path 
        d="M0,25 C10,20 20,28 30,15 C40,5 50,22 60,10 C70,0 80,18 90,8 L100,5" 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
