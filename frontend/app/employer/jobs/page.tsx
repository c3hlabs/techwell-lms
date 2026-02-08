"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Briefcase, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Job {
    id: string
    title: string
    location: string
    type: string
    status: string
    createdAt: string
    _count?: {
        applications: number
    }
}

export default function EmployerJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs/my/listings')
            setJobs(res.data)
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                        Job Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your active listings and find the best talent.</p>
                </div>
                <Button onClick={() => router.push('/employer/jobs/new')} className="shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Post New Job
                </Button>
            </div>

            {/* Filters & Search */}
            <Card className="glass-card border-none shadow-xl">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title or location..."
                            className="pl-10 bg-muted/20 border-none rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="rounded-xl border-dashed">
                        <Filter className="mr-2 h-4 w-4" /> Filters
                    </Button>
                </CardContent>
            </Card>

            {/* Jobs Table */}
            <Card className="glass-card border-none shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-muted/20">
                                <TableHead className="font-bold">Job Details</TableHead>
                                <TableHead className="font-bold">Applicants</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold">Posted Date</TableHead>
                                <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <TableRow key={i} className="border-muted/10">
                                        <TableCell><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell className="text-right"><div className="h-8 w-8 bg-muted animate-pulse rounded-full ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredJobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <Briefcase className="h-12 w-12 mb-2" />
                                            <p className="text-lg font-medium">No jobs found</p>
                                            <Button variant="link" onClick={() => router.push('/employer/jobs/new')}>Post your first job listing</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredJobs.map((job) => (
                                <TableRow key={job.id} className="hover:bg-muted/20 transition-colors border-muted/10 group">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</span>
                                            <span className="text-xs text-muted-foreground">{job.location} • {job.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20">
                                            {job._count?.applications || 0} Applicants
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={job.status === 'PUBLISHED' ? 'default' : 'secondary'}
                                            className={job.status === 'PUBLISHED' ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25 border-none shadow-none' : 'shadow-none border-none'}
                                        >
                                            {job.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="glass-card border-muted/20 w-48">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/employer/jobs/${job.id}`)}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Applicants
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/employer/jobs/${job.id}/edit`)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-muted/20" />
                                                <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
