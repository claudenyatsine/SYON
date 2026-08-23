'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { awardGamificationPoints } from './actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const MOCK_QUESTIONS = [
    {
        id: 1,
        text: "Which of the following is a key characteristic of this topic?",
        options: ["Option A (Correct)", "Option B", "Option C", "Option D"],
        correctIndex: 0
    },
    {
        id: 2,
        text: "What is the primary purpose of applying these principles in practice?",
        options: ["To slow down processes", "To increase efficiency (Correct)", "To confuse users", "None of the above"],
        correctIndex: 1
    },
    {
        id: 3,
        text: "When was the foundational theory behind this concept first introduced?",
        options: ["1950s", "1990s (Correct)", "2010s", "1800s"],
        correctIndex: 1
    }
];

export default function QuizPage() {
    const searchParams = useSearchParams();
    const topicId = searchParams.get('topicId');
    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClient();

    const [topicName, setTopicName] = useState<string>('Loading topic...');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!topicId) {
            setTopicName('General Review Quiz');
            return;
        }

        const fetchTopic = async () => {
            const { data } = await supabase
                .from('curriculum_items')
                .select('title')
                .eq('id', topicId)
                .single();
            
            if (data) {
                setTopicName(data.title);
            } else {
                setTopicName('Unknown Topic');
            }
        };

        fetchTopic();
    }, [topicId, supabase]);

    const handleNext = () => {
        const isCorrect = selectedAnswer === MOCK_QUESTIONS[currentQuestionIndex].correctIndex;
        if (isCorrect) setScore(s => s + 1);
        
        if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
            setSelectedAnswer(null);
        } else {
            handleFinish(isCorrect ? score + 1 : score);
        }
    };

    const handleFinish = async (finalScore: number) => {
        setIsFinished(true);
        setIsSubmitting(true);

        const pointsEarned = finalScore * 50; // 50 points per correct answer

        if (pointsEarned > 0) {
            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FF0000', '#00FF00']
            });

            // Call Server Action
            const result = await awardGamificationPoints(pointsEarned);
            
            if (result.error) {
                toast({
                    title: 'Error awarding points',
                    description: result.error,
                    variant: 'destructive'
                });
            } else {
                toast({
                    title: 'Points Awarded!',
                    description: `You earned ${pointsEarned} points!`,
                });
            }
        }
        setIsSubmitting(false);
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-background p-6 flex flex-col items-center justify-center">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="rounded-[2rem] border-border shadow-2xl overflow-hidden bg-white dark:bg-background relative">
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-gold/20 to-transparent" />
                        <CardContent className="p-10 text-center relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gold text-obsidian flex items-center justify-center shadow-lg mb-6">
                                <Award className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black mb-2 tracking-tight">Quiz Complete!</h2>
                            <p className="text-muted-foreground font-medium mb-8">You scored {score} out of {MOCK_QUESTIONS.length}</p>

                            <div className="bg-background/5 dark:bg-muted rounded-2xl p-6 w-full mb-8 relative overflow-hidden">
                                <Sparkles className="absolute top-2 right-2 w-4 h-4 text-gold opacity-50" />
                                <p className="text-sm uppercase tracking-widest font-bold text-muted-foreground mb-1">Points Earned</p>
                                <p className="text-4xl font-black text-gold">+{score * 50}</p>
                            </div>

                            <Button asChild className="w-full h-14 rounded-xl text-lg font-bold bg-background text-foreground hover:bg-background/90 dark:bg-white dark:text-obsidian dark:hover:bg-muted">
                                <Link href="/student/study-panel">Return to Study Panel</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const question = MOCK_QUESTIONS[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-background p-6 flex flex-col">
            <header className="flex items-center justify-between mb-12 max-w-4xl mx-auto w-full">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Quick Review</p>
                    <h1 className="font-bold text-lg">{topicName}</h1>
                </div>
                <div className="w-10" />
            </header>

            <main className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full pb-20">
                <div className="w-full mb-8 flex items-center gap-2">
                    {MOCK_QUESTIONS.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-2 flex-1 rounded-full transition-colors ${idx <= currentQuestionIndex ? 'bg-gold' : 'bg-gold/20'}`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="w-full"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold mb-8 leading-tight">
                            {question.text}
                        </h2>

                        <div className="space-y-4">
                            {question.options.map((opt, idx) => {
                                const isSelected = selectedAnswer === idx;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedAnswer(idx)}
                                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ${
                                            isSelected 
                                                ? 'border-gold bg-gold/10 shadow-md scale-[1.01]' 
                                                : 'border-border bg-muted hover:border-border hover:bg-muted'
                                        }`}
                                    >
                                        <span className="font-medium">{opt}</span>
                                        {isSelected && <CheckCircle2 className="w-5 h-5 text-gold" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-12 w-full flex justify-end">
                    <Button 
                        size="lg"
                        disabled={selectedAnswer === null} 
                        onClick={handleNext}
                        className="rounded-xl px-10 h-14 font-bold text-lg bg-background text-foreground hover:bg-background/90 dark:bg-white dark:text-obsidian dark:hover:bg-muted shadow-xl"
                    >
                        {currentQuestionIndex === MOCK_QUESTIONS.length - 1 ? 'Finish' : 'Next Question'}
                    </Button>
                </div>
            </main>
        </div>
    );
}
