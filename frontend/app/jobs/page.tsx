"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Search, MapPin, Briefcase, Filter, Building2, Clock, Banknote, GraduationCap, ChevronRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import api from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface Job {
    id: string
    title: string
    type: string
    location: string
    salary: string
    experience: string
    description: string
    employer: {
        name: string
        employerProfile: {
            companyName: string
            logo: string | null
            industry: string | null
        }
    }
    createdAt: string
}

export default function JobsPage() {
    const { user } = useAuth()
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filters, setFilters] = useState({
        search: "",
        type: [] as string[],
        location: "",
        experience: "0"
    })

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/jobs')
            setJobs(res.data)
        } catch (error) {
            console.error("Failed to fetch jobs", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Filter Logic
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.employer.employerProfile?.companyName.toLowerCase().includes(filters.search.toLowerCase())

        const matchesType = filters.type.length === 0 || filters.type.includes(job.type)

        // Simple location match (can be improved)
        const matchesLocation = filters.location === "" || job.location.toLowerCase().includes(filters.location.toLowerCase())

        return matchesSearch && matchesType && matchesLocation
    })

    const toggleTypeFilter = (type: string) => {
        setFilters(prev => ({
            ...prev,
            type: prev.type.includes(type)
                ? prev.type.filter(t => t !== type)
                : [...prev.type, type]
        }))
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            {/* Minimal Header Search */}
            <div className="bg-white dark:bg-slate-900 border-b sticky top-16 z-30 shadow-sm">
                <div className="container py-4">
                    <div className="flex gap-4 max-w-4xl mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                className="pl-10 h-11"
                                placeholder="Search skills, designations, companies..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <div className="relative w-1/3 hidden md:block">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                className="pl-10 h-11"
                                placeholder="Location"
                                value={filters.location}
                                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                            />
                        </div>
                        <Button size="lg" className="h-11 px-8">Search</Button>
                    </div>
                </div>
            </div>

            <div className="container py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar Filters */}
                <div className="hidden lg:block lg:col-span-3 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Filter className="h-4 w-4" /> Filters
                                </h3>
                                <Button variant="link" className="text-xs h-auto p-0" onClick={() => setFilters({ search: "", type: [], location: "", experience: "0" })}>
                                    Clear All
                                </Button>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium">Work Mode</h4>
                                <div className="space-y-2">
                                    {['FULL_TIME', 'Part_Time', 'Remote', 'Internship'].map((mode) => (
                                        <div key={mode} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={mode}
                                                checked={filters.type.includes(mode.toUpperCase())}
                                                onCheckedChange={() => toggleTypeFilter(mode.toUpperCase())}
                                            />
                                            <label htmlFor={mode} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {mode.replace('_', ' ')}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium">Experience (Years)</h4>
                                <Slider defaultValue={[0]} max={10} step={1} className="py-4" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Fresher</span>
                                    <span>10+ Yrs</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Promo Banner */}
                    <div className="bg-blue-600 text-white p-6 rounded-xl text-center space-y-3">
                        <GraduationCap className="h-12 w-12 mx-auto opacity-90" />
                        <h3 className="font-bold">Not getting calls?</h3>
                        <p className="text-sm opacity-90">Upgrade your resume with our AI Resume Builder.</p>
                        <Button variant="secondary" size="sm" className="w-full">Create Resume</Button>
                    </div>
                </div>

                {/* Main Job Feed */}
                <div className="col-span-1 lg:col-span-9 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-semibold text-lg">
                            {filteredJobs.length} Jobs based on your preferences
                        </h2>
                        {!user || user.role === 'EMPLOYER' ? (
                            <Link href="/employer/register">
                                <Button variant="outline" size="sm">Post a Job</Button>
                            </Link>
                        ) : null}
                    </div>

                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => (
                            <Card key={i} className="p-6 space-y-4 animate-pulse">
                                <div className="h-6 bg-muted rounded w-1/3"></div>
                                <div className="h-4 bg-muted rounded w-1/4"></div>
                                <div className="h-10 bg-muted rounded"></div>
                            </Card>
                        ))
                    ) : filteredJobs.length === 0 ? (
                        <Card className="p-12 text-center">
                            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Briefcase className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No jobs found</h3>
                            <p className="text-muted-foreground">Try removing some filters to see more results.</p>
                        </Card>
                    ) : (
                        filteredJobs.map(job => (
                            <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                                <Card className="hover:shadow-md transition-shadow dark:hover:border-primary/50 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardContent className="p-6">
                                        <div className="flex gap-4 items-start">
                                            <Avatar className="h-14 w-14 rounded-lg border bg-white p-1">
                                                <AvatarImage src={job.employer.employerProfile?.logo || ''} className="object-contain" />
                                                <AvatarFallback className="rounded-lg bg-gray-50"><Building2 className="h-6 w-6 text-gray-400" /></AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 space-y-1">
                                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm font-medium text-foreground/80">
                                                    {job.employer.employerProfile?.companyName}
                                                </p>

                                                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Briefcase className="h-4 w-4" />
                                                        {job.experience || 'Fresher'}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Banknote className="h-4 w-4" />
                                                        {job.salary || 'Not disclosed'}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {job.location}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                                                    <span className="mx-1">•</span>
                                                    <span className="text-foreground/60">{job.type.replace('_', ' ')}</span>
                                                </div>
                                            </div>

                                            <div className="hidden md:block self-center">
                                                <Button variant="ghost" className="group-hover:translate-x-1 transition-transform">
                                                    View <ChevronRight className="ml-1 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
