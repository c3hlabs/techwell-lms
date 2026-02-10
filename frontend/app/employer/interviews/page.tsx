"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Video, Calendar, User, CheckCircle2, MoreHorizontal, Clock, ArrowRight,
    VideoOff, Star, MessageSquare, ExternalLink, Loader2, Send
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface AiInterview {
    id: string
    role: string
    difficulty: string
    score: number | null
    status: string
    user: {
        name: string
        email: string
    }
}

interface JobInterview {
    id: string
    roundName: string
    roundType: string
    scheduledAt: string
    duration: number
    status: string
    meetingLink: string | null
    feedback: string | null
    score: number | null
    result: string | null
    application: {
        id: string
        externalName: string | null
        externalEmail: string | null
        applicant: {
            name: string
            email: string
        } | null
        job: {
            title: string
        }
    }
}

export default function EmployerInterviewsPage() {
    const [aiInterviews, setAiInterviews] = useState<AiInterview[]>([])
    const [jobInterviews, setJobInterviews] = useState<JobInterview[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("scheduled")
    const [feedbackDialog, setFeedbackDialog] = useState<JobInterview | null>(null)
    const [feedbackData, setFeedbackData] = useState({ feedback: '', score: '', result: '' })
    const [submittingFeedback, setSubmittingFeedback] = useState(false)
    const router = useRouter()

    const fetchInterviews = useCallback(async () => {
        try {
            const [aiRes, jobRes] = await Promise.allSettled([
                api.get('/interviews/job-interviews'),
                api.get('/jobs/my/listings')
            ])

            if (aiRes.status === 'fulfilled') {
                setAiInterviews(aiRes.value.data || [])
            }

            // Fetch job interviews from all employer's jobs
            if (jobRes.status === 'fulfilled') {
                const jobs = jobRes.value.data || []
                const allInterviews: JobInterview[] = []

                for (const job of jobs) {
                    try {
                        const appsRes = await api.get(`/ats/applications/${job.id}`)
                        const apps = appsRes.data || []
                        for (const app of apps) {
                            if (app.interviews && app.interviews.length > 0) {
                                for (const interview of app.interviews) {
                                    allInterviews.push({
                                        ...interview,
                                        application: {
                                            id: app.id,
                                            externalName: app.externalName,
                                            externalEmail: app.externalEmail,
                                            applicant: app.applicant,
                                            job: { title: job.title }
                                        }
                                    })
                                }
                            }
                        }
                    } catch {
                        // Skip jobs with errors
                    }
                }

                setJobInterviews(allInterviews.sort((a, b) =>
                    new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
                ))
            }
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchInterviews()
    }, [fetchInterviews])

    const handleSubmitFeedback = async () => {
        if (!feedbackDialog) return
        setSubmittingFeedback(true)
        try {
            await api.patch(`/ats/interviews/${feedbackDialog.id}/feedback`, {
                feedback: feedbackData.feedback,
                score: feedbackData.score ? parseInt(feedbackData.score) : undefined,
                result: feedbackData.result || undefined
            })
            setFeedbackDialog(null)
            setFeedbackData({ feedback: '', score: '', result: '' })
            fetchInterviews()
        } catch (error) {
            console.error('Failed to submit feedback:', error)
            alert('Failed to submit feedback')
        } finally {
            setSubmittingFeedback(false)
        }
    }

    const getCandidateName = (interview: JobInterview) => {
        return interview.application?.applicant?.name || interview.application?.externalName || 'Unknown'
    }

    const getCandidateEmail = (interview: JobInterview) => {
        return interview.application?.applicant?.email || interview.application?.externalEmail || ''
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-green-500/15 text-green-700 border-none">Completed</Badge>
            case 'SCHEDULED':
                return <Badge className="bg-blue-500/15 text-blue-700 border-none">Scheduled</Badge>
            case 'IN_PROGRESS':
                return <Badge className="bg-amber-500/15 text-amber-700 border-none">In Progress</Badge>
            case 'CANCELLED':
                return <Badge className="bg-red-500/15 text-red-700 border-none">Cancelled</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getResultBadge = (result: string | null) => {
        if (!result) return null
        switch (result) {
            case 'PASSED':
                return <Badge className="bg-emerald-500/15 text-emerald-700 border-none text-[10px]">Passed</Badge>
            case 'FAILED':
                return <Badge className="bg-red-500/15 text-red-700 border-none text-[10px]">Failed</Badge>
            case 'ON_HOLD':
                return <Badge className="bg-amber-500/15 text-amber-700 border-none text-[10px]">On Hold</Badge>
            default:
                return null
        }
    }

    const scheduledInterviews = jobInterviews.filter(i => i.status === 'SCHEDULED' && new Date(i.scheduledAt) >= new Date())
    const pastInterviews = jobInterviews.filter(i => i.status === 'COMPLETED' || new Date(i.scheduledAt) < new Date())
    const needsFeedback = jobInterviews.filter(i => !i.feedback && (i.status === 'COMPLETED' || new Date(i.scheduledAt) < new Date()))

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                        Interview Pipeline
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage scheduled interviews, submit feedback, and review AI screenings.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card hover:-translate-y-0.5 transition-transform">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{scheduledInterviews.length}</div>
                        <p className="text-xs text-muted-foreground font-medium">Upcoming</p>
                    </CardContent>
                </Card>
                <Card className="glass-card hover:-translate-y-0.5 transition-transform">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-amber-600">{needsFeedback.length}</div>
                        <p className="text-xs text-muted-foreground font-medium">Needs Feedback</p>
                    </CardContent>
                </Card>
                <Card className="glass-card hover:-translate-y-0.5 transition-transform">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{pastInterviews.length}</div>
                        <p className="text-xs text-muted-foreground font-medium">Completed</p>
                    </CardContent>
                </Card>
                <Card className="glass-card hover:-translate-y-0.5 transition-transform">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-600">{aiInterviews.length}</div>
                        <p className="text-xs text-muted-foreground font-medium">AI Screenings</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="scheduled" className="gap-2">
                        <Calendar className="h-4 w-4" /> Scheduled ({scheduledInterviews.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Completed ({pastInterviews.length})
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="gap-2">
                        <Video className="h-4 w-4" /> AI Screenings ({aiInterviews.length})
                    </TabsTrigger>
                </TabsList>

                {/* Scheduled Interviews */}
                <TabsContent value="scheduled">
                    <Card className="glass-card border-none shadow-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent border-muted/20">
                                        <TableHead className="font-bold">Candidate</TableHead>
                                        <TableHead className="font-bold">Job / Round</TableHead>
                                        <TableHead className="font-bold">Date & Time</TableHead>
                                        <TableHead className="font-bold">Duration</TableHead>
                                        <TableHead className="text-right font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [1, 2, 3].map(i => (
                                            <TableRow key={i}>
                                                <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                                                <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                                                <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                                <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                                                <TableCell className="text-right"><div className="h-8 w-24 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : scheduledInterviews.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                                                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                                <p className="font-medium">No upcoming interviews</p>
                                                <p className="text-sm mt-1">Schedule interviews from the job pipeline view</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : scheduledInterviews.map((interview) => (
                                        <TableRow key={interview.id} className="hover:bg-muted/20 transition-colors border-muted/10">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                        {getCandidateName(interview).charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{getCandidateName(interview)}</div>
                                                        <div className="text-[10px] text-muted-foreground">{getCandidateEmail(interview)}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-sm">{interview.application?.job?.title}</div>
                                                    <div className="text-xs text-muted-foreground">{interview.roundName} • {interview.roundType}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm">{new Date(interview.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {new Date(interview.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px]">
                                                    <Clock className="h-3 w-3 mr-1" /> {interview.duration}min
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {interview.meetingLink && (
                                                        <Button size="sm" variant="outline" className="text-xs"
                                                            onClick={() => window.open(interview.meetingLink!, '_blank')}>
                                                            <Video className="h-3 w-3 mr-1" /> Join
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="ghost" className="text-xs"
                                                        onClick={() => {
                                                            setFeedbackDialog(interview)
                                                            setFeedbackData({
                                                                feedback: interview.feedback || '',
                                                                score: interview.score?.toString() || '',
                                                                result: interview.result || ''
                                                            })
                                                        }}>
                                                        <MessageSquare className="h-3 w-3 mr-1" /> Feedback
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Completed Interviews */}
                <TabsContent value="completed">
                    <Card className="glass-card border-none shadow-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent border-muted/20">
                                        <TableHead className="font-bold">Candidate</TableHead>
                                        <TableHead className="font-bold">Job / Round</TableHead>
                                        <TableHead className="font-bold">Score</TableHead>
                                        <TableHead className="font-bold">Result</TableHead>
                                        <TableHead className="font-bold">Feedback</TableHead>
                                        <TableHead className="text-right font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pastInterviews.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                                                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                                <p className="font-medium">No completed interviews yet</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : pastInterviews.map((interview) => (
                                        <TableRow key={interview.id} className="hover:bg-muted/20 transition-colors border-muted/10">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                                                        {getCandidateName(interview).charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{getCandidateName(interview)}</div>
                                                        <div className="text-[10px] text-muted-foreground">{getCandidateEmail(interview)}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-sm">{interview.application?.job?.title}</div>
                                                    <div className="text-xs text-muted-foreground">{interview.roundName}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {interview.score !== null ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                                                            <div className="bg-primary h-full" style={{ width: `${interview.score}%` }} />
                                                        </div>
                                                        <span className="text-sm font-bold">{interview.score}%</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Not scored</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getResultBadge(interview.result) || (
                                                    <span className="text-xs text-amber-600 font-medium">Pending</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {interview.feedback ? (
                                                    <p className="text-xs text-muted-foreground max-w-[200px] truncate" title={interview.feedback}>
                                                        {interview.feedback}
                                                    </p>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-200 text-[10px]">
                                                        Needs feedback
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" className="text-xs"
                                                    onClick={() => {
                                                        setFeedbackDialog(interview)
                                                        setFeedbackData({
                                                            feedback: interview.feedback || '',
                                                            score: interview.score?.toString() || '',
                                                            result: interview.result || ''
                                                        })
                                                    }}>
                                                    <MessageSquare className="h-3 w-3 mr-1" />
                                                    {interview.feedback ? 'Edit' : 'Add'} Feedback
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI Screenings Tab */}
                <TabsContent value="ai">
                    <Card className="glass-card border-none shadow-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent border-muted/20">
                                        <TableHead className="font-bold">Candidate</TableHead>
                                        <TableHead className="font-bold">Position</TableHead>
                                        <TableHead className="font-bold">AI Score</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="text-right font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {aiInterviews.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                                                <VideoOff className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                                <p className="font-medium">No AI interviews recorded yet</p>
                                                <p className="text-sm mt-1">Candidates complete AI mock interviews on the platform.</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : aiInterviews.map((interview) => (
                                        <TableRow key={interview.id} className="hover:bg-muted/20 transition-colors border-muted/10 group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {interview.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-foreground">{interview.user?.name}</span>
                                                        <div className="text-[10px] text-muted-foreground">{interview.user?.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <span className="text-sm font-medium">{interview.role}</span>
                                                    <div className="text-[10px] text-muted-foreground uppercase">{interview.difficulty} Level</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                                                        <div className="bg-primary h-full" style={{ width: `${interview.score || 0}%` }} />
                                                    </div>
                                                    <span className="text-sm font-bold">{interview.score || 0}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(interview.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                                    onClick={() => router.push(`/employer/interviews/${interview.id}`)}
                                                >
                                                    View Report <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Feedback Dialog */}
            <Dialog open={!!feedbackDialog} onOpenChange={(open) => !open && setFeedbackDialog(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" /> Interview Feedback
                        </DialogTitle>
                        <DialogDescription>
                            {feedbackDialog && (
                                <>Submit feedback for {getCandidateName(feedbackDialog)} — {feedbackDialog.roundName}</>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="feedback-score">Score (0-100)</Label>
                            <Input
                                id="feedback-score"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="e.g. 75"
                                value={feedbackData.score}
                                onChange={(e) => setFeedbackData(prev => ({ ...prev, score: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feedback-result">Result</Label>
                            <Select
                                value={feedbackData.result}
                                onValueChange={(val) => setFeedbackData(prev => ({ ...prev, result: val }))}
                            >
                                <SelectTrigger id="feedback-result">
                                    <SelectValue placeholder="Select result" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PASSED">Passed</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feedback-text">Detailed Feedback</Label>
                            <Textarea
                                id="feedback-text"
                                rows={4}
                                placeholder="Share your assessment of the candidate's performance, strengths, and areas for improvement..."
                                value={feedbackData.feedback}
                                onChange={(e) => setFeedbackData(prev => ({ ...prev, feedback: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFeedbackDialog(null)}>Cancel</Button>
                        <Button onClick={handleSubmitFeedback} disabled={submittingFeedback}>
                            {submittingFeedback ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Submit Feedback
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
