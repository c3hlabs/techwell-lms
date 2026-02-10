"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Plus, Users, Briefcase, Video, Check, ExternalLink, MoreHorizontal,
    Clock, ArrowRight, TrendingUp, Target, AlertTriangle, Activity,
    Calendar, BarChart3, Loader2, UserCheck, UserX, Zap
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Application {
    id: string
    status: string
}

interface Job {
    id: string
    title: string
    location: string
    type: string
    status: 'PUBLISHED' | 'DRAFT' | 'CLOSED' | 'PAUSED' | 'OPEN'
    applications?: Application[]
    _count?: {
        applications: number
    }
}

interface ActivityItem {
    id: string
    message: string
    icon: string
    action: string
    entityType: string
    timestamp: string
    details: Record<string, unknown> | null
}

interface FunnelData {
    applied: number
    screened: number
    shortlisted: number
    interviewScheduled: number
    interviewed: number
    hired: number
    rejected: number
}

interface AnalyticsSummary {
    totalJobs: number
    activeJobs: number
    totalApplications: number
    hiredCount: number
    rejectedCount: number
    avgTimeToHire: number
    avgAtsScore: number
    selectionRate: string | number
}

interface AnalyticsData {
    summary: AnalyticsSummary
    funnel: FunnelData
    sourceBreakdown: { internal: number; external: number }
}

export default function EmployerDashboard() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [activities, setActivities] = useState<ActivityItem[]>([])
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [jobsRes, activityRes, analyticsRes] = await Promise.allSettled([
                api.get('/jobs/my/listings'),
                api.get('/ats/activity?limit=10'),
                api.get('/ats/analytics')
            ])

            if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data)
            if (activityRes.status === 'fulfilled') setActivities(activityRes.value.data)
            if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data)
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }

    const stats = useMemo(() => {
        if (analytics) return analytics.summary

        let selected = 0
        let interviewPending = 0
        let shortlisted = 0
        let totalApplications = 0
        let newApplications = 0

        jobs.forEach(job => {
            job.applications?.forEach((app) => {
                totalApplications++
                if (app.status === 'APPLIED') newApplications++
                if (app.status === 'SELECTED' || app.status === 'APPOINTED' || app.status === 'HIRED') selected++
                if (app.status === 'INTERVIEW_SCHEDULED' || app.status === 'INTERVIEW_PENDING') interviewPending++
                if (app.status === 'SHORTLISTED') shortlisted++
            })
        })
        return {
            totalJobs: jobs.length,
            activeJobs: jobs.filter(j => j.status === 'PUBLISHED').length,
            totalApplications,
            hiredCount: selected,
            rejectedCount: 0,
            avgTimeToHire: 0,
            avgAtsScore: 0,
            selectionRate: totalApplications > 0 ? ((selected / totalApplications) * 100).toFixed(1) : 0
        }
    }, [jobs, analytics])

    const getActivityIcon = (icon: string) => {
        switch (icon) {
            case 'status': return <TrendingUp className="h-4 w-4 text-blue-600" />
            case 'interview': return <Video className="h-4 w-4 text-purple-600" />
            case 'note': return <Activity className="h-4 w-4 text-amber-600" />
            case 'feedback': return <Check className="h-4 w-4 text-green-600" />
            case 'apply': return <Users className="h-4 w-4 text-indigo-600" />
            default: return <Activity className="h-4 w-4 text-gray-500" />
        }
    }

    const getActivityBg = (icon: string) => {
        switch (icon) {
            case 'status': return 'bg-blue-100'
            case 'interview': return 'bg-purple-100'
            case 'note': return 'bg-amber-100'
            case 'feedback': return 'bg-green-100'
            case 'apply': return 'bg-indigo-100'
            default: return 'bg-gray-100'
        }
    }

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        return `${days}d ago`
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                        Hiring Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">Your recruitment command center — track, hire, grow.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/employer/reports')}>
                        <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                    </Button>
                    <Button onClick={() => router.push('/employer/jobs/new')} className="shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" /> Post a Job
                    </Button>
                </div>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Applicants</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalApplications}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-blue-500" />
                            Avg ATS Score: {stats.avgAtsScore || '—'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Briefcase className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeJobs}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 cursor-pointer hover:underline" onClick={() => router.push('/employer/jobs')}>
                            of {stats.totalJobs} total <ArrowRight className="w-3 h-3" />
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Hired</CardTitle>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <UserCheck className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.hiredCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.selectionRate}% selection rate
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Time-to-Hire</CardTitle>
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgTimeToHire || '—'}</div>
                        <p className="text-xs text-muted-foreground mt-1">avg days to hire</p>
                    </CardContent>
                </Card>
            </div>

            {/* Hiring Funnel */}
            {analytics?.funnel && (
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" /> Hiring Funnel
                        </CardTitle>
                        <CardDescription>Pipeline progression across all jobs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { label: 'Applied', value: analytics.funnel.applied, color: 'bg-blue-500' },
                                { label: 'Screened', value: analytics.funnel.screened, color: 'bg-indigo-500' },
                                { label: 'Shortlisted', value: analytics.funnel.shortlisted, color: 'bg-purple-500' },
                                { label: 'Interview', value: analytics.funnel.interviewScheduled, color: 'bg-violet-500' },
                                { label: 'Interviewed', value: analytics.funnel.interviewed, color: 'bg-amber-500' },
                                { label: 'Hired', value: analytics.funnel.hired, color: 'bg-green-500' },
                            ].map((stage) => {
                                const pct = analytics.funnel.applied > 0 ? (stage.value / analytics.funnel.applied) * 100 : 0
                                return (
                                    <div key={stage.label} className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-muted-foreground w-28">{stage.label}</span>
                                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden relative">
                                            <div className={`h-full ${stage.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.max(pct, 2)}%` }} />
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground/80">
                                                {stage.value}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground w-12 text-right">{pct.toFixed(0)}%</span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Source breakdown */}
                        {analytics.sourceBreakdown && (
                            <div className="mt-6 pt-4 border-t flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-sm text-muted-foreground">Internal: <span className="font-bold text-foreground">{analytics.sourceBreakdown.internal}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                                    <span className="text-sm text-muted-foreground">External: <span className="font-bold text-foreground">{analytics.sourceBreakdown.external}</span></span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Job Listings Table */}
                <Card className="lg:col-span-2 glass-card">
                    <CardHeader>
                        <CardTitle>Recent Job Listings</CardTitle>
                        <CardDescription>Monitor your active job posts and applicant pipelines.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Job Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Pipeline</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jobs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                                No jobs posted yet.{' '}
                                                <Button variant="link" className="px-0" onClick={() => router.push('/employer/jobs/new')}>
                                                    Post your first job
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ) : jobs.slice(0, 5).map((job) => (
                                        <TableRow key={job.id} className="hover:bg-muted/30">
                                            <TableCell className="font-medium min-w-[180px]">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{job.title}</span>
                                                    <span className="text-xs text-muted-foreground">{job.location} • {job.type?.replace('_', ' ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={job.status === 'PUBLISHED' || job.status === 'OPEN' ? 'default' : 'secondary'}
                                                    className={job.status === 'PUBLISHED' || job.status === 'OPEN' ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25 border-hidden' : ''}
                                                >
                                                    {job.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{job._count?.applications || job.applications?.length || 0}</span>
                                                    <div className="hidden sm:flex h-1.5 w-16 bg-muted rounded-full ml-2 overflow-hidden">
                                                        <div className="bg-primary h-full" style={{ width: `${Math.min(((job._count?.applications || job.applications?.length || 0) / 50) * 100, 100)}%` }} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => router.push(`/employer/jobs/${job.id}`)}>
                                                            <Users className="mr-2 h-4 w-4" /> View Applicants
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => router.push(`/employer/jobs/${job.id}/edit`)}>
                                                            <ExternalLink className="mr-2 h-4 w-4" /> Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">
                                                            Close Job
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {jobs.length > 0 && (
                            <div className="p-4 border-t text-center">
                                <Button variant="ghost" className="text-sm text-muted-foreground hover:text-primary" onClick={() => router.push('/employer/jobs')}>
                                    View All Jobs
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Side - Real Activity Feed */}
                <div className="space-y-6">
                    <Card className="glass-card">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" /> Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activities.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">No recent activity yet. Start posting jobs to see updates here.</p>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                            <div className={`h-8 w-8 rounded-full ${getActivityBg(activity.icon)} flex items-center justify-center mt-0.5 shrink-0`}>
                                                {getActivityIcon(activity.icon)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium leading-snug">{activity.message}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(activity.timestamp)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Profile Status */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold">Complete Profile</h3>
                                <p className="text-xs text-muted-foreground">Boost your visibility</p>
                            </div>
                            <Button size="sm" onClick={() => router.push('/employer/profile')}>Update</Button>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    {analytics?.sourceBreakdown && (
                        <Card className="glass-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Candidate Sources</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-muted-foreground">Internal (Platform)</span>
                                            <span className="text-xs font-bold">{analytics.sourceBreakdown.internal}</span>
                                        </div>
                                        <Progress value={
                                            (analytics.sourceBreakdown.internal + analytics.sourceBreakdown.external) > 0
                                                ? (analytics.sourceBreakdown.internal / (analytics.sourceBreakdown.internal + analytics.sourceBreakdown.external)) * 100
                                                : 0
                                        } className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-muted-foreground">External</span>
                                            <span className="text-xs font-bold">{analytics.sourceBreakdown.external}</span>
                                        </div>
                                        <Progress value={
                                            (analytics.sourceBreakdown.internal + analytics.sourceBreakdown.external) > 0
                                                ? (analytics.sourceBreakdown.external / (analytics.sourceBreakdown.internal + analytics.sourceBreakdown.external)) * 100
                                                : 0
                                        } className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
