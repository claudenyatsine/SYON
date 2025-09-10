
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger, PopoverPortal } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Bell,
  Calendar,
  ChevronLeft,
  Download,
  Expand,
  FileText,
  Hand,
  Headphones,
  ImageIcon,
  Maximize,
  Mic,
  MicOff,
  MoreVertical,
  PhoneOff,
  Pin,
  PinOff,
  Send,
  Settings,
  Shield,
  Shrink,
  Upload,
  Video,
  VideoOff,
  Volume2,
  MessageSquare,
  X,
  Smile,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const participants = [
  { name: 'Johnnie B.', avatar: 'https://placehold.co/100x100.png', isPinned: false, isHandRaised: false },
  { name: 'Ethan C.', avatar: 'https://placehold.co/100x100.png', isPinned: false, isHandRaised: false },
  { name: 'Andy T.', avatar: 'https://placehold.co/100x100.png', isPinned: false, isHandRaised: false },
  { name: 'Jordan K.', avatar: 'https://placehold.co/100x100.png', isPinned: true, isHandRaised: false },
  { name: 'Marta E.', avatar: 'https://placehold.co/100x100.png', isPinned: false, isHandRaised: true },
  { name: 'Cristina', avatar: 'https://placehold.co/100x100.png', isPinned: false, isHandRaised: false },
  { name: 'David L.', avatar: 'https://placehold.co/100x100.png', isPinned: false, isHandRaised: false },
  { name: 'Sophia R.', avatar: 'https://placehold.co/100x100.png', isPinned: false, isHandRaised: false },
];

const chatMessages = [
    { sender: 'Jonathan Milton', time: '2:30 pm', text: 'Does anyone have the updated presentation? @the_assistant', avatar: 'https://placehold.co/100x100.png' },
    { sender: 'You', time: '2:31 pm', text: 'I\'ll share it shortly.', isMe: true, avatar: 'https://placehold.co/100x100.png' },
    { sender: 'AI Assistant', time: '2:31 pm', text: 'Q1_Strategy.pptx', isFile: true, avatar: 'https://placehold.co/100x100.png' },
    { sender: 'Jonathan Milton', time: '2:33 pm', text: 'Thanks! Let\'s review slide 5 together.', avatar: 'https://placehold.co/100x100.png' },
    { sender: 'Marta E.', time: '2:34 pm', text: 'We need to update the sales figures.', avatar: 'https://placehold.co/100x100.png' },
    { sender: 'You', time: '2:35 pm', text: 'Agreed. I\'ll provide the updated data by tomorrow.', isMe: true, avatar: 'https://placehold.co/100x100.png' },
];

const meetingInsights = [
    { title: 'PM & Designers Sync Meeting', duration: '30 min', tasks: 5, accomplished: 8, total: 9 },
    { title: 'Strategic Planning Meeting', duration: '1h', tasks: 8, accomplished: 4, total: 10 },
]

const initialResources = [
    { name: 'Syllabus.pdf', size: '1.2MB' },
    { name: 'Lecture_Notes_Week_1.docx', size: '3.4MB' },
    { name: 'Chapter_3_Problems.pdf', size: '850KB' },
]

const reactions = ['👍', '❤️', '😂', '👏', '🎉', '🤔'];

type FloatingEmoji = {
  id: number;
  emoji: string;
  left: string;
  name: string;
}

export default function LiveClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const classId = params?.classId;
  const className = (classId as string)?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const videoRef = useRef<HTMLVideoElement>(null);
  const fullScreenRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [resources, setResources] = useState(initialResources);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);


  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          if (!isCameraOn) {
            stream.getVideoTracks().forEach(track => track.enabled = false);
          }
           if (!isMicOn) {
            stream.getAudioTracks().forEach(track => track.enabled = false);
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this app.',
          });
        }
      } else {
        setHasCameraPermission(false);
      }
    };
    getCameraPermission();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [isCameraOn, isMicOn, toast]);

  const handleFullScreenChange = () => {
    const isFs = !!document.fullscreenElement;
    setIsFullScreen(isFs);
    if (!isFs) {
        setIsChatVisible(false); // Close chat when exiting fullscreen
    }
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);
  
  const toggleFullScreen = () => {
    const elem = fullScreenRef.current;
    if (!elem) return;

    if (!isFullScreen) {
      elem.requestFullscreen().catch(err => {
        toast({
          variant: 'destructive',
          title: 'Fullscreen Error',
          description: `Error attempting to enable full-screen mode: ${err.message}`,
        });
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };


  const toggleCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => track.enabled = !isCameraOn);
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleMic = () => {
     if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const handleEndCall = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    router.push('/live-classes');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newResource = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
      setResources(prev => [...prev, newResource]);
      toast({
        title: 'Upload Successful',
        description: `${file.name} has been uploaded.`,
      });
    }
  };

  const handleReaction = (emoji: string) => {
    const newEmoji: FloatingEmoji = {
      id: new Date().getTime(),
      emoji: emoji,
      left: `${Math.random() * 80 + 10}%`,
      name: 'You',
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 4000); // Remove after 4 seconds (animation duration)
  }

  return (
    <div className="bg-background text-foreground h-full flex flex-col p-4 md:p-6 lg:p-8">
      <header className={cn("flex items-center justify-between mb-4", isFullScreen && 'hidden')}>
        <div>
           <Link href="/live-classes" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Classes
           </Link>
          <h1 className="font-headline text-2xl font-bold tracking-tight">Hello, Cristina!</h1>
          <p className="text-muted-foreground text-sm">{className} | <span className="text-green-500">Live Now</span></p>
        </div>
      </header>
      <div ref={fullScreenRef} className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 bg-background relative">
        
        {/* Main Content */}
        <main className={cn(
          "lg:col-span-9 flex flex-col gap-6 min-h-0", 
          isFullScreen && "lg:col-span-12 items-center justify-center"
        )}>
            <div className={cn(
              "relative rounded-lg overflow-hidden bg-card p-2 w-full",
              isFullScreen ? "h-2/3" : "flex-grow"
            )}>
              <div className="relative flex-grow rounded-md overflow-hidden bg-black/80 h-full">
                {floatingEmojis.map((item) => (
                  <div key={item.id} className="floating-emoji" style={{ left: item.left }}>
                    <span className="emoji">{item.emoji}</span>
                    <span className="name-tag">{item.name}</span>
                  </div>
                ))}
                <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src="https://placehold.co/100x100.png" alt="Cristina" />
                            <AvatarFallback>C</AvatarFallback>
                        </Avatar>
                    </div>
                )}
                
                {/* Controls */}
                <div className={cn(
                    "absolute", 
                    isFullScreen 
                    ? "top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 p-2 rounded-full"
                    : "left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-black/50 p-2 rounded-full"
                )}>
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                               <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => toast({ title: 'Audio settings opened' })}><Headphones /></Button>
                            </TooltipTrigger>
                            <TooltipContent side={isFullScreen ? "bottom" : "right"}><p>Audio Settings</p></TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                               <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => toast({ title: 'Security panel opened' })}><Shield /></Button>
                            </TooltipTrigger>
                            <TooltipContent side={isFullScreen ? "bottom" : "right"}><p>Security</p></TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                               <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => toast({ title: 'Calendar opened' })}><Calendar /></Button>
                            </TooltipTrigger>
                            <TooltipContent side={isFullScreen ? "bottom" : "right"}><p>Calendar</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                               <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => toast({ title: 'Notifications opened' })}><Bell /></Button>
                            </TooltipTrigger>
                            <TooltipContent side={isFullScreen ? "bottom" : "right"}><p>Notifications</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                               <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => toast({ title: 'Settings panel opened' })}><Settings /></Button>
                            </TooltipTrigger>
                            <TooltipContent side={isFullScreen ? "bottom" : "right"}><p>Settings</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>


                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <Badge variant="destructive" className="bg-red-500 text-white animate-pulse">Live</Badge>
                     {isFullScreen && (
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsChatVisible(!isChatVisible)}>
                            <MessageSquare />
                        </Button>
                    )}
                     <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullScreen}>
                        {isFullScreen ? <Shrink/> : <Expand/>}
                     </Button>
                 </div>
                 <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/50 p-1 rounded-md">
                    <Popover>
                        <PopoverTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-white h-6 w-6 hover:bg-white/20">
                                <Volume2 className="h-4 w-4"/>
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" side="top" align="center">
                            <Slider
                                defaultValue={[80]}
                                max={100}
                                step={1}
                                orientation="vertical"
                                className="h-24"
                                onValueChange={setVolume}
                            />
                        </PopoverContent>
                    </Popover>
                 </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
                  <Button variant={isMicOn ? "secondary" : "destructive"} size="icon" className="rounded-full h-12 w-12" onClick={toggleMic}>
                    {isMicOn ? <Mic /> : <MicOff />}
                  </Button>
                   <Button variant={isCameraOn ? "secondary" : "destructive"} size="icon" className="rounded-full h-12 w-12" onClick={toggleCamera}>
                    {isCameraOn ? <Video /> : <VideoOff />}
                  </Button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">
                        <Smile />
                      </Button>
                    </PopoverTrigger>
                    <PopoverPortal container={fullScreenRef.current}>
                      <PopoverContent side="top" className="w-auto p-2 bg-background/80 backdrop-blur-sm border-none">
                        <div className="flex gap-2">
                          {reactions.map((emoji) => (
                            <Button key={emoji} variant="ghost" size="icon" className="text-2xl" onClick={() => handleReaction(emoji)}>
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </PopoverPortal>
                  </Popover>

                  <Button variant={isHandRaised ? "primary" : "secondary"} size="icon" className="rounded-full h-12 w-12" onClick={() => setIsHandRaised(!isHandRaised)}>
                    <Hand />
                  </Button>

                  <Button variant="destructive" size="icon" className="rounded-full h-12 w-12 bg-red-600" onClick={handleEndCall}>
                    <PhoneOff />
                  </Button>
              </div>

               {isFullScreen && (
                  <>
                    <div className="absolute bottom-4 left-4 w-full max-w-xs">
                         <Card className="bg-black/30 backdrop-blur-sm border-white/20 text-white h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Class Insight</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {meetingInsights.slice(0,1).map(insight => (
                                <div key={insight.title} className="flex items-center gap-2 p-2 rounded-lg">
                                    <div className="bg-primary/20 text-primary p-2 rounded-full">
                                        <Calendar className="h-4 w-4"/>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-white">{insight.title}</p>
                                        <p className="text-xs text-white/70">{insight.duration}</p>
                                    </div>
                                    <Progress value={(insight.accomplished / insight.total) * 100} className="w-16 h-1" />
                                </div>
                                ))}
                            </CardContent>
                        </Card>
                     </div>
                     <div className="absolute bottom-4 right-4 w-full max-w-xs">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Card className="bg-black/30 backdrop-blur-sm border-white/20 text-white h-full cursor-pointer hover:bg-black/50">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-base">Participants</CardTitle>
                                        <Users className="h-4 w-4 text-white/70" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center -space-x-2">
                                            {participants.slice(0, 5).map((p, i) => (
                                                <Avatar key={i} className="h-8 w-8 border-2 border-black/50">
                                                    <AvatarImage src={p.avatar} alt={p.name} />
                                                    <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                        <p className="text-sm text-white/70 mt-2">{participants.length} people in the class</p>
                                    </CardContent>
                                </Card>
                            </PopoverTrigger>
                            <PopoverPortal container={fullScreenRef.current}>
                                <PopoverContent side="top" align="end" className="w-80 bg-black/50 backdrop-blur-sm border-white/20 text-white">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold">Participants ({participants.length})</h3>
                                    </div>
                                    <ScrollArea className="h-72">
                                        <div className="space-y-4">
                                            {participants.map((p) => (
                                                <div key={p.name} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={p.avatar} alt={p.name} />
                                                            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm">{p.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {p.isHandRaised && <Hand className="h-4 w-4 text-yellow-400" />}
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20"><MoreVertical className="h-4 w-4" /></Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </PopoverContent>
                            </PopoverPortal>
                        </Popover>
                    </div>
                  </>
              )}
            </div>

            <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4", isFullScreen && 'hidden')}>
                {participants.map((p) => (
                    <Card key={p.name} className="relative aspect-video overflow-hidden">
                        <Image src={p.avatar} alt={p.name} fill objectFit="cover" />
                        <div className="absolute inset-0 bg-black/30" />
                        <p className="absolute bottom-2 left-2 text-white text-xs font-medium">{p.name}</p>
                        {p.isPinned && <Pin className="absolute top-2 right-2 h-4 w-4 text-white" />}
                        {p.isHandRaised && <Hand className="absolute top-2 right-2 h-4 w-4 text-yellow-400" />}
                    </Card>
                ))}
            </div>
             {hasCameraPermission === false && (
                <Alert variant="destructive" className={cn(isFullScreen && 'hidden')}>
                  <VideoOff className="h-4 w-4" />
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera and microphone access to use the live class feature.
                  </AlertDescription>
                </Alert>
            )}

             <Card className={cn(isFullScreen && 'hidden')}>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Class Insight</CardTitle>
                        <Button variant="link" size="sm">View all</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {meetingInsights.map(insight => (
                    <div key={insight.title} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                        <div className="bg-primary/20 text-primary p-2 rounded-full">
                           <Calendar className="h-5 w-5"/>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{insight.title}</p>
                            <p className="text-sm text-muted-foreground">{insight.duration}</p>
                        </div>
                         <div className="flex-1 hidden md:block">
                            <p className="text-sm text-muted-foreground">Follow-Up Tasks: {insight.tasks}</p>
                            <p className="text-sm text-muted-foreground">Accomplished: {insight.accomplished}/{insight.total}</p>
                        </div>
                        <Progress value={(insight.accomplished / insight.total) * 100} className="w-24 h-2 hidden md:block" />
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                    </div>
                  ))}
                </CardContent>
             </Card>
        </main>
        
        {/* Right Sidebar */}
        <aside className={cn(
          "flex-col gap-6 min-h-0", 
          isFullScreen 
            ? "absolute top-0 right-0 h-full w-full max-w-sm p-4 bg-black/30 backdrop-blur-sm transition-transform duration-300 ease-in-out"
            : "lg:col-span-3 flex",
          isFullScreen && !isChatVisible && "translate-x-full",
          isFullScreen && isChatVisible && "translate-x-0"
        )}>
          <Card className={cn(
            "flex-1 flex-col min-h-0 flex",
            isFullScreen && "bg-transparent border-none shadow-none text-white"
          )}>
             <CardHeader className={cn("flex-row items-center justify-between", isFullScreen && "text-white")}>
                <CardTitle>Chat Room</CardTitle>
                 {isFullScreen && (
                    <Button variant="ghost" size="icon" onClick={() => setIsChatVisible(false)} className="text-white hover:bg-white/20">
                        <X className="h-5 w-5" />
                    </Button>
                 )}
             </CardHeader>
             <ScrollArea className="flex-1 px-4">
                <div className="space-y-4">
                    {chatMessages.map((msg, index) => (
                         <div key={index} className={cn("flex items-start gap-3", msg.isMe && "justify-end")}>
                            {!msg.isMe && <Avatar className="h-8 w-8"><AvatarImage src={msg.avatar} /><AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback></Avatar>}
                            <div className={cn(
                              "max-w-[75%] rounded-lg p-3 text-sm", 
                              msg.isMe ? "bg-primary text-primary-foreground" : "bg-muted",
                              isFullScreen && !msg.isMe && "bg-white/20 text-white"
                            )}>
                                {!msg.isMe && <p className="font-semibold text-xs mb-1">{msg.sender}</p>}
                                <p>{msg.text}</p>
                            </div>
                         </div>
                    ))}
                </div>
             </ScrollArea>
             <div className={cn("p-4 border-t", isFullScreen && "border-white/20")}>
                <div className="relative">
                    <Input 
                      placeholder="Type your message..." 
                      className={cn(
                        "pr-10",
                        isFullScreen && "bg-white/20 border-white/30 placeholder:text-white/70"
                      )}
                    />
                    <Button variant="ghost" size="icon" className={cn("absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8", isFullScreen && "text-white hover:bg-white/20")}><Send className="h-4 w-4"/></Button>
                </div>
             </div>
          </Card>

           <Card className={cn("flex-shrink-0 flex flex-col", isFullScreen && 'hidden')}>
               <CardHeader>
                  <CardTitle>Class Resources</CardTitle>
                  <CardDescription>Upload or download class materials.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                   <Button onClick={handleUploadClick} className="w-full">
                       <Upload className="mr-2 h-4 w-4" />
                       Upload Resource
                   </Button>
                   <div className="space-y-2 pt-2">
                       {resources.map((resource, index) => (
                           <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm">
                               <div className="flex items-center gap-2 truncate">
                                   <FileText className="h-4 w-4 flex-shrink-0" />
                                   <span className="truncate" title={resource.name}>{resource.name}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">{resource.size}</span>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                       <Download className="h-4 w-4" />
                                   </Button>
                               </div>
                           </div>
                       ))}
                   </div>
                </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  );
}
