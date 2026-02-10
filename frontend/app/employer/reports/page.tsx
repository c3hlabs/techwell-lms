"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
    ArrowLeft, Printer, Download, Briefcase, Users, CheckCircle, XCircle,
    TrendingUp, BarChart3, Clock, Target, Zap, PieChart, Loader2
} from "lucide-react"

interface AnalyticsData {
    summary: {
        totalJobs: number
        activeJobs: number
        totalApplications: number
        hiredCount: number
        rejectedCount: number
        avgTimeToHire: number
        avgAtsScore: number
        selectionRate: string | number
    }
    funnel: {
        applied: number
        screened: number
        shortlisted: number
        interviewScheduled: number
        interviewed: number
        hired: number
        rejected: number
    }
    sourceBreakdown: { internal: number; external: number }
    jobStats: {
        id: string
        title: string
        status: string
        applications: number
        shortlisted: number
        interviewed: number
        hired: number
        rejected: number
        avgScore: number
    }[]
}

export default function EmployerReportsPage() {
    const router = useRouter()
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/ats/analytics')
                setData(res.data)
            } catch (error) {
                console.error(error)
                // Fallback to old API
                try {
                    const res = await api.get('/reports/employer')
                    setData(res.data)
                } catch {
                    // No data available
                }
            } finally {
                setIsLoading(false)
            }
        }
        fetchReports()
    }, [])

    const handlePrint = () => {
        window.print()
    }

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary/40" /></div>
    }

    if (!data) return <div className="p-20 text-center text-muted-foreground font-medium">No analytics data available at this moment.</div>

    const { summary, funnel, sourceBreakdown, jobStats } = data

    // Calculate funnel drop-off rates
    const funnelStages = [
        { label: 'Applied', key: 'applied', value: funnel?.applied || 0, color: 'bg-blue-500', textColor: 'text-blue-600' },
        { label: 'Screened', key: 'screened', value: funnel?.screened || 0, color: 'bg-indigo-500', textColor: 'text-indigo-600' },
        { label: 'Shortlisted', key: 'shortlisted', value: funnel?.shortlisted || 0, color: 'bg-purple-500', textColor: 'text-purple-600' },
        { label: 'Interview', key: 'interviewScheduled', value: funnel?.interviewScheduled || 0, color: 'bg-violet-500', textColor: 'text-violet-600' },
        { label: 'Interviewed', key: 'interviewed', value: funnel?.interviewed || 0, color: 'bg-amber-500', textColor: 'text-amber-600' },
        { label: 'Hired', key: 'hired', value: funnel?.hired || 0, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
    ]

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 print:p-0 print:space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                            Hiring Analytics & Insights
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm font-medium">Complete recruitment performance dashboard.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print Report
                    </Button>
                    <Button className="rounded-xl bg-primary shadow-xl shadow-primary/20">
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block mb-8 border-b pb-4">
                <h1 className="text-2xl font-bold">TechWell Talent Acquisition Report</h1>
                <p className="text-sm text-gray-500">Analytics Summary • Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card border-none shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Open Roles</CardTitle>
                        <Briefcase className="h-4 w-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{summary.totalJobs}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] px-1.5 h-4">{summary.activeJobs} Active</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Applicants</CardTitle>
                        <Users className="h-4 w-4 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{summary.totalApplications}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                            <Zap className="h-3 w-3" /> Avg Score: {summary.avgAtsScore || '—'}
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Success Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">{summary.hiredCount}</div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                            {summary.selectionRate}% Selection Ratio
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Time to Hire</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{summary.avgTimeToHire || '—'}</div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                            Average Days
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Funnel + Source Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hiring Funnel Visualization */}
                <Card className="lg:col-span-2 glass-card border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" /> Hiring Funnel
                        </CardTitle>
                        <CardDescription>Candidate progression through pipeline stages</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {funnelStages.map((stage, index) => {
                                const pct = (funnel?.applied || 0) > 0 ? (stage.value / funnel.applied) * 100 : 0
                                const prevValue = index > 0 ? funnelStages[index - 1].value : stage.value
                                const dropOff = prevValue > 0 ? Math.round(((prevValue - stage.value) / prevValue) * 100) : 0

                                return (
                                    <div key={stage.key} className="group">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                                                <span className="text-sm font-bold">{stage.label}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-lg font-bold ${stage.textColor}`}>{stage.value}</span>
                                                {index > 0 && dropOff > 0 && (
                                                    <Badge variant="outline" className="text-[10px] text-red-500 border-red-200">
                                                        -{dropOff}% drop
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${stage.color} rounded-full transition-all duration-1000 ease-out`}
                                                style={{ width: `${Math.max(pct, 1)}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Rejected */}
                        {(funnel?.rejected || 0) > 0 && (
                            <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm font-medium text-red-600">Rejected</span>
                                </div>
                                <span className="text-lg font-bold text-red-600">{funnel.rejected}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Source Breakdown */}
                <Card className="glass-card border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-primary" /> Candidate Sources
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sourceBreakdown ? (
                            <div className="space-y-6">
                                {/* Visual pie-like display */}
                                <div className="flex items-center justify-center py-4">
                                    <div className="relative h-32 w-32">
                                        <svg viewBox="0 0 36 36" className="transform -rotate-90">
                                            <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#e2e8f0" strokeWidth="3" />
                                            <circle
                                                cx="18" cy="18" r="15.9155" fill="transparent"
                                                stroke="#3b82f6" strokeWidth="3"
                                                strokeDasharray={`${(sourceBreakdown.internal + sourceBreakdown.external) > 0
                                                    ? (sourceBreakdown.internal / (sourceBreakdown.internal + sourceBreakdown.external)) * 100
                                                    : 0
                                                    } 100`}
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-bold">{sourceBreakdown.internal + sourceBreakdown.external}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                                <span className="text-sm font-medium">Platform Students</span>
                                            </div>
                                            <span className="font-bold">{sourceBreakdown.internal}</span>
                                        </div>
                                        <Progress value={
                                            (sourceBreakdown.internal + sourceBreakdown.external) > 0
                                                ? (sourceBreakdown.internal / (sourceBreakdown.internal + sourceBreakdown.external)) * 100
                                                : 0
                                        } className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                                                <span className="text-sm font-medium">External</span>
                                            </div>
                                            <span className="font-bold">{sourceBreakdown.external}</span>
                                        </div>
                                        <Progress value={
                                            (sourceBreakdown.internal + sourceBreakdown.external) > 0
                                                ? (sourceBreakdown.external / (sourceBreakdown.internal + sourceBreakdown.external)) * 100
                                                : 0
                                        } className="h-2" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No source data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Per-Job Stats Table */}
            {jobStats && jobStats.length > 0 && (
                <Card className="glass-card border-none shadow-2xl overflow-hidden print:border-0 print:shadow-none">
                    <CardHeader className="bg-muted/30 border-b border-muted/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    Job Performance Breakdown
                                </CardTitle>
                                <CardDescription>Per-job hiring metrics and conversion rates.</CardDescription>
                            </div>
                            <Badge variant="outline" className="border-primary/20 text-primary font-bold">{jobStats.length} Jobs</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow className="border-muted/10 hover:bg-transparent">
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4">Job Title</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 text-center">Status</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 text-center">Applied</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 text-center">Shortlisted</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 text-center">Interviewed</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 text-center">Hired</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 text-center">Rejected</TableHead>
                                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 text-center">Avg Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobStats.map((job) => (
                                    <TableRow key={job.id} className="border-muted/10 hover:bg-primary/5 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/employer/jobs/${job.id}`)}>
                                        <TableCell className="font-semibold">{job.title}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className={`text-[10px] ${job.status === 'PUBLISHED' || job.status === 'OPEN'
                                                ? 'bg-green-100 text-green-700'
                                                : job.status === 'CLOSED' ? 'bg-red-100 text-red-700'
                                                    : ''
                                                }`}>{job.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-bold">{job.applications}</TableCell>
                                        <TableCell className="text-center text-purple-600 font-bold">{job.shortlisted}</TableCell>
                                        <TableCell className="text-center text-amber-600 font-bold">{job.interviewed}</TableCell>
                                        <TableCell className="text-center text-green-600 font-bold">{job.hired}</TableCell>
                                        <TableCell className="text-center text-red-600 font-bold">{job.rejected}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-bold">{job.avgScore || '—'}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .max-w-7xl, .max-w-7xl * {
                        visibility: visible;
                    }
                    .max-w-7xl {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
            <div className="h-20" />
        </div>
    )
}
