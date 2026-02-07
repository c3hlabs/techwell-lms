"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { courseApi, interviewApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    GraduationCap,
    Video,
    TrendingUp,
    Calendar,
    Loader2,
    LogOut,
    BookOpen,
    Download,
    Award,
    Clock,
    PlayCircle,
    Briefcase
} from 'lucide-react'

// Interface definitions (Mocking locally for dashboard view if needed, or inferred)
interface Enrollment {
    id: string
    course: {
        id: string
        title: string
        thumbnail?: string
        category: string
        difficulty: string
    }
    progress?: number // Mock progress
    hasInterviewAccess?: boolean
}

interface Interview {
    id: string
    domain: string
    role: string
    status: string
    createdAt: string
    score?: number
}

export default function DashboardPage() {
    const router = useRouter()
    const { user, isLoading: authLoading, logout } = useAuth()

    const [activeTab, setActiveTab] = React.useState<'overview' | 'learning' | 'interviews' | 'applications' | 'certificates'>('overview')
    const [stats, setStats] = React.useState<{
        enrollments: number;
        interviews: { total: number; completed: number; averageScore: number };
    } | null>(null)

    const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
    const [interviews, setInterviews] = React.useState<Interview[]>([])
    const [jobInterviews, setJobInterviews] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login')
            } else if (user.role === 'EMPLOYER') {
                router.push('/employer/dashboard')
            } else if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
                router.push('/admin')
            } else if (user.role === 'INSTRUCTOR') {
                router.push('/instructor')
            }
        }
    }, [authLoading, user, router])

    React.useEffect(() => {
        const fetchData = async () => {
            if (!user) return

            try {
                const [enrollmentsRes, interviewStatsRes, interviewsRes, jobInterviewsRes] = await Promise.all([
                    courseApi.getMyEnrollments(),
                    interviewApi.getStats(),
                    interviewApi.getAll({ page: 1 }),
                    interviewApi.getJobInterviews ? interviewApi.getJobInterviews() : Promise.resolve({ data: { interviews: [] } })
                ])

                setEnrollments(enrollmentsRes.data.enrollments || [])
                setInterviews(interviewsRes.data.interviews || [])
                setJobInterviews(jobInterviewsRes.data.interviews || [])

                setStats({
                    enrollments: enrollmentsRes.data.enrollments?.length || 0,
                    interviews: interviewStatsRes.data.stats || { total: 0, completed: 0, averageScore: 0 },
                })
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (user) {
            fetchData()
        }
    }, [user])

    const downloadCertificate = (courseTitle: string) => {
        alert(`Downloading Certificate for ${courseTitle}... (Mock Function)`)
    }

    if (authLoading || !user) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] opacity-40 animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] opacity-40" />
                </div>
                <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-background overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container py-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            Welcome, <span className="text-gradient">{user.name}</span>!
                        </h1>
                        <p className="text-muted-foreground mt-1 text-lg">Track your progress and manage your learning journey.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="glass hover:bg-white/20" onClick={() => router.push('/profile')}>
                            Profile Settings
                        </Button>
                        <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50/50" onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Glass Tabs */}
                <div className="flex gap-2 mb-8 p-1 glass rounded-xl overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'learning', label: 'My Learning', icon: BookOpen },
                        { id: 'interviews', label: 'Interviews', icon: Video },
                        { id: 'applications', label: 'Applications', icon: Briefcase },
                        { id: 'certificates', label: 'Certificates', icon: Award },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Enrolled Courses</p>
                                                <h3 className="text-3xl font-bold mt-2">{stats?.enrollments || 0}</h3>
                                            </div>
                                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
                                                <GraduationCap className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                                                <h3 className="text-3xl font-bold mt-2">{stats?.interviews.total || 0}</h3>
                                            </div>
                                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600">
                                                <Video className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                                <h3 className="text-3xl font-bold mt-2">{stats?.interviews.completed || 0}</h3>
                                            </div>
                                            <div className="p-3 bg-teal-500/10 rounded-xl text-teal-600">
                                                <Calendar className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                                                <h3 className="text-3xl font-bold mt-2">{Math.round(stats?.interviews.averageScore || 0)}%</h3>
                                            </div>
                                            <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
                                                <TrendingUp className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>

                                {/* Recent Activity / Quick Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                                        <div className="flex flex-col gap-1 mb-6">
                                            <h3 className="text-xl font-bold">Continue Learning</h3>
                                            <p className="text-sm text-muted-foreground">Pick up where you left off</p>
                                        </div>

                                        <div className="space-y-4">
                                            {enrollments.length > 0 ? (
                                                <>
                                                    {enrollments.slice(0, 3).map((enrollment) => (
                                                        <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                                    <BookOpen className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium line-clamp-1">{enrollment.course.title}</h4>
                                                                    <p className="text-xs text-muted-foreground">{enrollment.course.category}</p>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={() => router.push(`/courses/${enrollment.course.id}`)}>
                                                                <PlayCircle className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button variant="link" className="px-0 w-full text-primary" onClick={() => setActiveTab('learning')}>
                                                        View All Courses
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <p className="text-muted-foreground mb-4">No courses enrolled yet.</p>
                                                    <Button onClick={() => router.push('/courses')} className="glass">Browse Courses</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                                        <div className="flex flex-col gap-1 mb-6">
                                            <h3 className="text-xl font-bold">Interview Practice</h3>
                                            <p className="text-sm text-muted-foreground">Recent mock interviews</p>
                                        </div>

                                        <div className="space-y-4">
                                            {interviews.length > 0 ? (
                                                <>
                                                    {interviews.slice(0, 3).map((interview) => (
                                                        <div key={interview.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                                                            <div>
                                                                <h4 className="font-medium">{interview.role}</h4>
                                                                <p className="text-xs text-muted-foreground">{interview.domain} • {new Date(interview.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${interview.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {interview.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <Button variant="link" className="px-0 w-full text-primary" onClick={() => setActiveTab('interviews')}>
                                                        View All Interviews
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <p className="text-muted-foreground mb-4">No interviews taken yet.</p>
                                                    <Button variant="outline" className="glass" onClick={() => router.push('/interviews')}>Start Interview</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MY LEARNING TAB */}
                        {activeTab === 'learning' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {enrollments.map((enrollment) => (
                                    <div key={enrollment.id} className="glass-card p-0 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                        <div className="p-6 pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                                    <GraduationCap className="h-5 w-5 text-primary" />
                                                </div>
                                                <span className="text-xs px-2 py-1 bg-muted/50 rounded-full border border-white/10">
                                                    {enrollment.course.difficulty}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold line-clamp-1 mb-1">{enrollment.course.title}</h3>
                                            <p className="text-sm text-muted-foreground">{enrollment.course.category}</p>
                                        </div>
                                        <div className="p-6 pt-2">
                                            <div className="w-full bg-secondary/30 h-2 rounded-full mb-4 overflow-hidden">
                                                <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm mb-4">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">0%</span>
                                            </div>

                                            {enrollment.hasInterviewAccess && (
                                                <div className="mb-4 pt-4 border-t border-white/10">
                                                    <div className="flex justify-between items-center text-sm mb-2">
                                                        <span className="text-muted-foreground flex items-center gap-1">
                                                            <Video className="h-3 w-3" /> Interview Readiness
                                                        </span>
                                                        <span className="font-medium text-purple-600">
                                                            75%
                                                        </span>
                                                    </div>
                                                    <Button variant="secondary" size="sm" className="w-full text-xs h-8 glass" onClick={() => router.push('/interviews')}>
                                                        Practice Now
                                                    </Button>
                                                </div>
                                            )}
                                            <Button className="w-full shadow-lg shadow-primary/20" onClick={() => router.push(`/courses/${enrollment.course.id}`)}>
                                                <PlayCircle className="mr-2 h-4 w-4" />
                                                Continue
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {enrollments.length === 0 && (
                                    <div className="col-span-full text-center py-20">
                                        <GraduationCap className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                        <h3 className="text-xl font-medium mb-2">No Courses Yet</h3>
                                        <p className="text-muted-foreground mb-6">Start your learning journey today.</p>
                                        <Button size="lg" onClick={() => router.push('/courses')} className="glass">Browse Catalog</Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* INTERVIEWS TAB */}
                        {activeTab === 'interviews' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">Interview History</h2>
                                    <Button onClick={() => router.push('/interviews')} className="glass">New Mock Interview</Button>
                                </div>

                                {/* Scheduled Job Interviews Section */}
                                {jobInterviews.length > 0 && (
                                    <div className="glass-card rounded-xl p-6 border-l-4 border-l-blue-500 mb-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Calendar className="w-24 h-24" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-blue-500" />
                                            Upcoming Scheduled Interviews
                                        </h3>
                                        <div className="grid gap-4">
                                            {jobInterviews.map((interview) => (
                                                <div key={interview.id} className="bg-background/40 backdrop-blur-sm p-4 rounded-lg border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                    <div>
                                                        <h4 className="font-bold text-lg">{interview.roundName}</h4>
                                                        <p className="text-muted-foreground">{interview.application.job.title} at <span className="text-foreground font-medium">{interview.application.job.employer.employerProfile?.companyName || 'Company'}</span></p>
                                                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4 text-blue-400" />
                                                                {new Date(interview.scheduledAt).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-4 w-4 text-blue-400" />
                                                                {new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({interview.duration} mins)
                                                            </div>
                                                            {interview.location && (
                                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                                    <span>📍 {interview.location}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-medium border border-blue-500/20">
                                                            {interview.roundType}
                                                        </span>
                                                        {interview.meetingLink && (
                                                            <Button size="sm" onClick={() => window.open(interview.meetingLink, '_blank')}>
                                                                Join Meeting
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="glass-card rounded-2xl p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {interviews.map(interview => (
                                            <div key={interview.id} className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-xs text-muted-foreground">{new Date(interview.createdAt).toLocaleDateString()}</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${interview.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                                                        }`}>
                                                        {interview.status}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-base mb-1">{interview.role}</h3>
                                                <p className="text-xs text-muted-foreground mb-3">{interview.domain}</p>

                                                {interview.status === 'COMPLETED' && (
                                                    <div className="mb-4 flex items-baseline gap-1">
                                                        <span className="text-2xl font-bold text-primary">{interview.score || 0}%</span>
                                                        <span className="text-xs text-muted-foreground">Score</span>
                                                    </div>
                                                )}
                                                <Button variant="outline" className="w-full glass" size="sm" onClick={() => router.push(`/interviews/${interview.id}${interview.status === 'COMPLETED' ? '/report' : ''}`)}>
                                                    {interview.status === 'COMPLETED' ? 'View Report' : 'Resume'}
                                                </Button>
                                            </div>
                                        ))}
                                        {interviews.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                                No interviews found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* APPLICATIONS TAB */}
                        {activeTab === 'applications' && (
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle>Job Applications</CardTitle>
                                    <CardDescription>Track the status of your job applications</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                                        <div className="p-4 bg-primary/10 rounded-full">
                                            <Briefcase className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold">Manage Your Applications</h3>
                                            <p className="text-muted-foreground max-w-sm mx-auto">
                                                View details, check status, and manage all your job applications in one place.
                                            </p>
                                        </div>
                                        <Button onClick={() => router.push('/dashboard/applications')}>
                                            View My Applications
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* CERTIFICATES TAB */}
                        {activeTab === 'certificates' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {enrollments.map((enrollment) => (
                                    <div key={enrollment.id} className="glass-card p-6 rounded-2xl border-l-[6px] border-l-yellow-500 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Award className="w-24 h-24" />
                                        </div>
                                        <div className="h-12 w-12 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                                            <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-1">{enrollment.course.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Certificate of Completion</p>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 bg-muted/30 p-2 rounded">
                                            <Clock className="h-3 w-3" />
                                            Issued: Mock Date
                                        </div>

                                        <Button size="sm" variant="outline" className="w-full glass" onClick={() => router.push(`/certificate/${enrollment.id}`)}>
                                            <Download className="h-4 w-4 mr-2" />
                                            View Certificate
                                        </Button>
                                    </div>
                                ))}
                                {enrollments.length === 0 && (
                                    <div className="col-span-full text-center py-20">
                                        <Award className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No Certificates Yet</h3>

                                        <p className="text-muted-foreground">Complete courses to earn certificates.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
