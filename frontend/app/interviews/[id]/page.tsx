"use client"

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { interviewApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    Phone,
    ChevronRight,
    MessageSquare,
    Clock,
    User,
    Bot,
    Loader2,
    CheckCircle2,
    ArrowLeft,
    Send,
    Briefcase
} from 'lucide-react'

interface Message {
    id: string
    role: 'interviewer' | 'user'
    content: string
    timestamp: Date
}

interface Question {
    id: string
    question: string
    type: string
    avatarRole: string // 'Technical', 'HR', etc.
}

const AVATARS: Record<string, any> = {
    'tech-1': { name: "Alex Chen", role: "Technical Lead", color: "from-blue-500/20 to-cyan-500/20", icon: Bot },
    'tech-2': { name: "Sarah Johnson", role: "Senior Engineer", color: "from-indigo-500/20 to-blue-500/20", icon: Bot },
    'hr-1': { name: "Emma Williams", role: "HR Manager", color: "from-purple-500/20 to-pink-500/20", icon: Briefcase },
    'hr-2': { name: "David Smith", role: "Talent Acquisition", color: "from-slate-500/20 to-gray-500/20", icon: Briefcase },
    // Fallbacks
    'Technical': { name: "AI Interviewer", role: "Technical", color: "from-blue-500/20 to-cyan-500/20", icon: Bot },
    'HR': { name: "AI Recruiter", role: "HR", color: "from-purple-500/20 to-pink-500/20", icon: Briefcase }
}

export default function InterviewRoomPage() {
    const router = useRouter()
    const params = useParams()
    const { isAuthenticated, isLoading: authLoading } = useAuth()

    const videoRef = React.useRef<HTMLVideoElement>(null)
    const [stream, setStream] = React.useState<MediaStream | null>(null)
    const [isVideoOn, setIsVideoOn] = React.useState(true)
    const [isMicOn, setIsMicOn] = React.useState(true)

    // AI State
    const [currentQuestion, setCurrentQuestion] = React.useState<Question | null>(null)
    const [questionCount, setQuestionCount] = React.useState(0)

    const [messages, setMessages] = React.useState<Message[]>([])
    const [userResponse, setUserResponse] = React.useState('')
    const [isThinking, setIsThinking] = React.useState(false)
    const [isAIProcessing, setIsAIProcessing] = React.useState(false)

    const [interview, setInterview] = React.useState<any>(null)
    const [timeLeft, setTimeLeft] = React.useState(0) // Seconds
    const [isCompleted, setIsCompleted] = React.useState(false)

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    // Load Interview & Init Timer
    React.useEffect(() => {
        const fetchInterview = async () => {
            try {
                const res = await interviewApi.getById(params.id as string)
                setInterview(res.data.interview)
                // Initialize timer (default 30 mins if missing)
                if (res.data.interview.duration) {
                    setTimeLeft(res.data.interview.duration * 60)
                } else {
                    setTimeLeft(30 * 60)
                }
            } catch (error) {
                console.error('Failed to fetch interview:', error)
            }
        }
        if (params.id) {
            fetchInterview()
        }
    }, [params.id])

    // Countdown Timer
    React.useEffect(() => {
        if (!isCompleted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        handleEndInterview() // Auto-end
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [isCompleted, timeLeft])

    // Initialize camera stream
    React.useEffect(() => {
        const initCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })
                setStream(mediaStream)
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                }
            } catch (error) {
                console.error('Failed to access camera:', error)
            }
        }
        initCamera()

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    // Initial Question Fetch
    React.useEffect(() => {
        const startInterview = async () => {
            if (messages.length === 0 && !isCompleted && !currentQuestion) {
                await fetchNextQuestion();
            }
        }
        startInterview();
    }, [messages.length, isCompleted])

    const handleEndInterview = async () => {
        try {
            await interviewApi.complete(params.id as string, { score: Math.floor(Math.random() * 20) + 80 })
        } catch (error) {
            console.error('Failed to complete interview:', error)
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }
        router.push(`/interviews/${params.id}/report`)
    }

    // Timer
    React.useEffect(() => {
        if (!isCompleted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        handleEndInterview() // Auto-end
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [isCompleted, timeLeft])

    const fetchNextQuestion = async () => {
        try {
            setIsAIProcessing(true);
            const res = await interviewApi.nextQuestion(params.id as string);
            const questionData = res.data.question;

            setCurrentQuestion({
                id: questionData.id || 'temp',
                question: questionData.question,
                type: questionData.type,
                avatarRole: questionData.avatarId?.includes('hr') ? 'HR' : 'Technical' // Simple mapping based on mock ID
            });

            setQuestionCount(prev => prev + 1);

            // Add to chat
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'interviewer',
                content: questionData.question,
                timestamp: new Date()
            }]);

            // Speak the question
            speakText(questionData.question);
        } catch (error) {
            console.error("Failed to fetch next question:", error);
            // Fallback for demo if backend not ready
            if (!currentQuestion) {
                setMessages(prev => [...prev, {
                    id: 'error',
                    role: 'interviewer',
                    content: "Connecting to AI Interviewer... (Please ensure backend is restarted)",
                    timestamp: new Date()
                }]);
            }
        } finally {
            setIsAIProcessing(false);
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const [isWaitingNext, setIsWaitingNext] = React.useState(false)
    const [nextQuestionTimer, setNextQuestionTimer] = React.useState(10)
    const [isRecording, setIsRecording] = React.useState(false)
    const recognitionRef = React.useRef<any>(null)
    const speechTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    // Handle Speech Recognition
    React.useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = true
            recognitionRef.current.interimResults = true

            recognitionRef.current.onresult = (event: any) => {
                let transcript = ''
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript
                }
                setUserResponse(prev => transcript)
            }

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error)
                setIsRecording(false)
            }

            recognitionRef.current.onend = () => {
                setIsRecording(false)
            }
        }
    }, [])

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop()
        } else {
            setUserResponse('')
            recognitionRef.current?.start()
            setIsRecording(true)
        }
    }

    const speakText = (text: string) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 0.95
            utterance.pitch = 1

            // Get voices and find a good one (prefer female for HR, male for Tech maybe)
            const voices = window.speechSynthesis.getVoices()
            const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium'))
            if (preferredVoice) utterance.voice = preferredVoice

            utterance.onend = () => {
                // Start 10s timeout after speaking is done
                startResponseTimer()
                // Auto-start recording
                toggleRecording()
            }

            window.speechSynthesis.speak(utterance)
        }
    }

    const startResponseTimer = () => {
        setNextQuestionTimer(10)
        if (speechTimeoutRef.current) clearInterval(speechTimeoutRef.current)

        speechTimeoutRef.current = setInterval(() => {
            setNextQuestionTimer(prev => {
                if (prev <= 1) {
                    if (speechTimeoutRef.current) clearInterval(speechTimeoutRef.current)
                    handleAutoSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleAutoSubmit = () => {
        if (isRecording) recognitionRef.current?.stop()
        handleSendResponse(true)
    }

    // Re-attach stream when video toggles back on
    React.useEffect(() => {
        if (isVideoOn && videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [isVideoOn, stream])

    // Gap Timer
    React.useEffect(() => {
        if (isWaitingNext) {
            if (nextQuestionTimer <= 0) {
                setIsWaitingNext(false)
                fetchNextQuestion()
                return
            }
            const timer = setInterval(() => {
                setNextQuestionTimer(prev => prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [isWaitingNext, nextQuestionTimer])

    // ... existing initialization ...

    const handleSendResponse = async (isAuto = false) => {
        if (!currentQuestion) return
        if (!userResponse.trim() && !isAuto) return // Don't allow manual empty submit

        const finalResponse = userResponse.trim() || "(No verbal response recorded)";

        // Add user message if there was a response or if it's auto-submit
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: finalResponse,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        setUserResponse('')
        setIsThinking(true)

        // Clear auto-submit timer
        if (speechTimeoutRef.current) clearInterval(speechTimeoutRef.current)
        if (isRecording) recognitionRef.current?.stop()

        // Submit to AI
        try {
            await interviewApi.submitResponse(params.id as string, {
                questionId: currentQuestion.id,
                answer: finalResponse
            });

            // Decide to continue or end
            if (questionCount >= 5) {
                setIsCompleted(true);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'interviewer',
                    content: "Thank you! The interview is complete. Generating your feedback report...",
                    timestamp: new Date()
                }]);
            } else {
                setNextQuestionTimer(10)
                setIsWaitingNext(true)
            }
        } catch (error) {
            console.error("Error submitting response:", error);
            // Even on error, try to move forward if it was an auto-submit to prevent hang
            if (isAuto && questionCount < 5) {
                setNextQuestionTimer(10)
                setIsWaitingNext(true)
            }
        } finally {
            setIsThinking(false);
        }
    }



    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const getActiveAvatar = () => {
        // 1. If question has specific avatar role/id, use it
        if (currentQuestion?.avatarRole && AVATARS[currentQuestion.avatarRole]) {
            return AVATARS[currentQuestion.avatarRole]
        }
        // 2. Use interview selected avatar
        const primaryAvatarId = interview?.selectedAvatars?.[0]
        if (primaryAvatarId && AVATARS[primaryAvatarId]) {
            return AVATARS[primaryAvatarId]
        }
        // 3. Fallback
        return AVATARS['tech-1'] || AVATARS['Technical']
    }

    const activeAvatar = getActiveAvatar()

    const AvatarIcon = activeAvatar.icon;

    return (
        <div className="min-h-screen bg-background">
            {/* Header Bar */}
            <div className="h-14 bg-muted/50 border-b flex items-center justify-between px-4 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/interviews')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Exit
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm">
                            <Bot className="h-4 w-4 text-primary" />
                            <span className="font-bold">{interview?.role || 'Interview'}</span>
                            {interview?.technology && (
                                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">
                                    {interview.technology}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {interview?.company || 'Mock Interview'} • {interview?.difficulty} Level
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm bg-background/50 px-3 py-1 rounded-full border">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Progress:</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(step => (
                                <div
                                    key={step}
                                    className={`h-1.5 w-6 rounded-full ${step <= questionCount ? 'bg-primary' : 'bg-muted'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
                {/* Left Sidebar: Panel visualization */}
                <div className="w-64 border-r bg-muted/30 flex flex-col p-4 gap-4 hidden md:flex">
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2">Interviewer Panel</h3>
                        <p className="text-[10px] text-muted-foreground pl-2">{interview?.panelCount || 1} Experts Conducting</p>
                    </div>

                    <div className="space-y-2">
                        {/* List only avatars selected for this panel */}
                        {Object.entries(AVATARS)
                            .filter(([id]) => interview?.selectedAvatars?.includes(id))
                            .map(([id, avatar]) => {
                                const isActive = activeAvatar?.name === avatar.name;
                                return (
                                    <div
                                        key={id}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 border-2 ${isActive
                                            ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10 scale-105'
                                            : 'bg-white/5 border-transparent opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg bg-gradient-to-br ${avatar.color}`}>
                                            <avatar.icon className={`h-5 w-5 ${isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center gap-1.5">
                                                <p className={`text-sm font-bold truncate ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{avatar.name}</p>
                                                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider truncate">{avatar.role}</p>
                                        </div>
                                        {isActive && (
                                            <div className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-black uppercase tracking-tighter">
                                                Active
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>

                    <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold">Live Mentoring</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Interviewer is analyzing your STAR method utilization and technical depth in real-time.
                        </p>
                    </div>
                </div>

                {/* Video Section */}
                <div className="flex-1 p-4 flex flex-col gap-4 bg-muted/10">
                    {/* Main Video Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-0">
                        {/* AI Interviewer - Dynamic Avatar */}
                        <Card className={`relative overflow-hidden border-2 transition-all duration-500 flex flex-col ${isAIProcessing ? 'border-primary/50' : 'border-transparent shadow-xl'}`}>
                            <CardContent className={`h-full flex items-center justify-center p-0 bg-gradient-to-br ${activeAvatar.color}`}>
                                <div className="text-center">
                                    <div className="h-32 w-32 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-2xl animate-in zoom-in duration-500">
                                        {activeAvatar && <activeAvatar.icon className="h-16 w-16 text-primary" />}
                                    </div>
                                    <h2 className="font-bold text-2xl tracking-tight">{activeAvatar.name}</h2>
                                    <p className="text-sm font-medium text-muted-foreground bg-background/50 px-3 py-1 rounded-full inline-block mt-2 border">
                                        {activeAvatar.role}
                                    </p>
                                </div>

                                {isAIProcessing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md z-30">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                            <span className="text-sm font-bold uppercase tracking-widest text-primary">Generating Insights...</span>
                                        </div>
                                    </div>
                                )}

                                {isWaitingNext && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-40">
                                        <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-background shadow-2xl border text-center max-w-xs">
                                            <div className="h-16 w-16 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                                                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin-slow" />
                                                <span className="font-mono font-bold text-2xl">{nextQuestionTimer}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold">Excellent Response!</p>
                                                <p className="text-xs text-muted-foreground">Preparing follow-up question...</p>
                                            </div>
                                            <Button size="sm" variant="outline" className="w-full rounded-full" onClick={() => { setIsWaitingNext(false); fetchNextQuestion() }}>
                                                Skip to Next
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {!isAIProcessing && currentQuestion && !isCompleted && (
                                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full z-10 backdrop-blur-md">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-green-600 uppercase">Live Discussion</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* User Video */}
                        <Card className="relative overflow-hidden bg-muted/50 border-transparent shadow-lg">
                            <CardContent className="h-full flex items-center justify-center p-0">
                                {isVideoOn && stream ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover scale-x-[-1]"
                                    />
                                ) : (
                                    <div className="text-center p-8">
                                        <div className="h-28 w-28 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-muted">
                                            {isVideoOn ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : <VideoOff className="h-8 w-8 text-muted-foreground" />}
                                        </div>
                                        <p className="font-bold">You</p>
                                        <p className="text-xs text-muted-foreground">{isVideoOn ? 'Camera loading...' : 'Camera is disabled'}</p>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-white">
                                    {isMicOn ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5 items-end h-3">
                                                <div className="w-0.5 h-1 bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-0.5 h-2 bg-green-400 animate-bounce" style={{ animationDelay: '100ms' }} />
                                                <div className="w-0.5 h-3 bg-green-400 animate-bounce" style={{ animationDelay: '200ms' }} />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Audio Active</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <MicOff className="h-3 w-3 text-red-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Microphone Muted</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Controls */}
                    <div className="bg-background/80 backdrop-blur-md p-4 rounded-3xl border shadow-xl flex items-center justify-center gap-6 max-w-md mx-auto w-full">
                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant={isRecording ? "destructive" : "outline"}
                                size="icon"
                                className={`h-12 w-12 rounded-2xl transition-all ${isRecording ? 'animate-pulse' : ''}`}
                                onClick={toggleRecording}
                            >
                                {isRecording ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                            </Button>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{isRecording ? 'Recording...' : 'Voice Off'}</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant={isVideoOn ? "outline" : "destructive"}
                                size="icon"
                                className="h-12 w-12 rounded-2xl transition-all"
                                onClick={() => setIsVideoOn(!isVideoOn)}
                            >
                                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                            </Button>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
                        </div>

                        <div className="h-10 w-px bg-border mx-2" />

                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-12 w-12 rounded-2xl shadow-lg shadow-red-500/20 hover:scale-110 active:scale-95 transition-all"
                                onClick={handleEndInterview}
                            >
                                <Phone className="h-5 w-5 rotate-[135deg]" />
                            </Button>
                            <span className="text-[10px] font-bold text-red-600 uppercase">End Session</span>
                        </div>
                    </div>
                </div>

                {/* Chat Section */}
                <div className="w-96 border-l flex flex-col bg-background/50 backdrop-blur-xl shrink-0">
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <MessageSquare className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-bold text-sm">Session Log</h3>
                        </div>
                        <div className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">Live</div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 grayscale">
                                <Bot className="h-12 w-12 mb-2" />
                                <p className="text-xs font-medium">Interviewer is connecting...</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 relative ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10'
                                    : 'bg-muted/50 border rounded-tl-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <div className={`mt-2 flex items-center justify-between gap-4 ${msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                        <p className="text-[9px] font-bold uppercase tracking-wider">
                                            {msg.role === 'user' ? 'You' : activeAvatar?.name}
                                        </p>
                                        <p className="text-[9px] font-mono">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(isThinking || isAIProcessing) && (
                            <div className="flex justify-start">
                                <div className="bg-muted/30 border rounded-2xl rounded-tl-none px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {activeAvatar?.name} is speaking
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    {!isCompleted ? (
                        <div className="p-4 border-t space-y-3 bg-background">
                            <div className="relative">
                                <textarea
                                    value={userResponse}
                                    onChange={(e) => setUserResponse(e.target.value)}
                                    placeholder="Click to type your response..."
                                    className="w-full min-h-[100px] p-4 text-sm rounded-2xl border bg-muted/20 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 font-medium"
                                    disabled={isAIProcessing || isThinking}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendResponse()
                                        }
                                    }}
                                />
                                <div className="absolute bottom-3 right-3 text-[9px] font-bold text-muted-foreground uppercase opacity-50">
                                    Press Enter ↵
                                </div>
                            </div>
                            <Button
                                className="w-full h-11 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                onClick={() => handleSendResponse(false)}
                                disabled={!userResponse.trim() || isThinking || isAIProcessing}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Submit Answer
                            </Button>
                        </div>
                    ) : (
                        <div className="p-6 border-t text-center bg-green-500/5 space-y-4">
                            <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-lg">Interview Concluded</p>
                                <p className="text-xs text-muted-foreground">Detailed feedback and scoring ready</p>
                            </div>
                            <Button
                                className="w-full rounded-full h-11 bg-green-600 hover:bg-green-700 font-bold"
                                onClick={handleEndInterview}
                            >
                                Generate Full Report
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
