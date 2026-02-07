"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Users, Briefcase, Video, Check, ExternalLink, MoreHorizontal, Eye, Clock, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function EmployerDashboard() {
    const [jobs, setJobs] = useState<any[]>([])
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs/my/listings')
            setJobs(res.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const stats = useMemo(() => {
        let selected = 0
        let interviewPending = 0
        let shortlisted = 0
        let totalApplications = 0
        let newApplications = 0 // Mocking "new" as status 'APPLIED'

        jobs.forEach(job => {
            job.applications?.forEach((app: any) => {
                totalApplications++
                if (app.status === 'APPLIED') newApplications++
                if (app.status === 'SELECTED' || app.status === 'APPOINTED' || app.status === 'HIRED') selected++
                if (app.status === 'INTERVIEW_SCHEDULED' || app.status === 'INTERVIEW_PENDING') interviewPending++
                if (app.status === 'SHORTLISTED') shortlisted++
            })
        })
        return { selected, interviewPending, shortlisted, totalApplications, newApplications }
    }, [jobs])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                        Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/employer/reports')}>Download Report</Button>
                    <Button onClick={() => router.push('/employer/jobs/new')} className="shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" /> Post a Job
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
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
                        <p className="text-xs text-muted-foreground mt-1 text-green-600 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {stats.newApplications} new awaiting review
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Interviews</CardTitle>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Video className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stats.interviewPending}</div>
                        <p className="text-xs text-muted-foreground mt-1">Scheduled / Ongoing</p>
                    </CardContent>
                </Card>
                <Card className="glass-card hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Hired</CardTitle>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Check className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stats.selected}</div>
                        <p className="text-xs text-muted-foreground mt-1">Candidates hired (All time)</p>
                    </CardContent>
                </Card>
                <Card className="glass-card hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Briefcase className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{jobs.filter(j => j.status === 'PUBLISHED').length}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 cursor-pointer hover:underline" onClick={() => router.push('/employer/jobs')}>
                            View all jobs <ArrowRight className="w-3 h-3" />
                        </p>
                    </CardContent>
                </Card>
            </div>

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
                                    {isLoading ? (
                                        [1, 2, 3].map(i => (
                                            <TableRow key={i}>
                                                <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                                                <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                                                <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                                <TableCell className="text-right"><div className="h-8 w-8 bg-muted animate-pulse rounded-full ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : jobs.slice(0, 5).map((job) => (
                                        <TableRow key={job.id} className="hover:bg-muted/30">
                                            <TableCell className="font-medium min-w-[180px]">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{job.title}</span>
                                                    <span className="text-xs text-muted-foreground">{job.location} • {job.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={job.status === 'PUBLISHED' ? 'default' : 'secondary'} className={job.status === 'PUBLISHED' ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25 border-hidden' : ''}>
                                                    {job.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{job._count?.applications || 0}</span>
                                                    {/* Mini bar chart */}
                                                    <div className="hidden sm:flex h-1.5 w-16 bg-muted rounded-full ml-2 overflow-hidden">
                                                        <div className="bg-primary h-full" style={{ width: `${Math.min(((job._count?.applications || 0) / 50) * 100, 100)}%` }} />
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
                        <div className="p-4 border-t text-center">
                            <Button variant="ghost" className="text-sm text-muted-foreground hover:text-primary" onClick={() => router.push('/employer/jobs')}>
                                View All Jobs
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Side - Activity / Interviews */}
                <div className="space-y-6">
                    {/* Simplified Activity Feed */}
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Mock Activities - Ideally fetch from API */}
                                <div className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mt-1">
                                        SJ
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Sarah Jenkins applied for <span className="text-primary">React Developer</span></p>
                                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs mt-1">
                                        HR
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Interview scheduled with <span className="text-primary">John Doe</span></p>
                                        <p className="text-xs text-muted-foreground">Yesterday</p>
                                    </div>
                                </div>
                            </div>
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
                </div>
            </div>
        </div>
    )
}
