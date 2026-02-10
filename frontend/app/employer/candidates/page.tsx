"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Users, Search, Filter, Download, Loader2, Star, ArrowRight,
    ChevronDown, MoreHorizontal, UserCheck, UserX, CheckCircle2,
    Calendar, Zap, XCircle
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Applicant {
    id: string
    status: string
    source: string
    atsScore: number
    createdAt: string
    externalName?: string
    externalEmail?: string
    applicant?: {
        name: string
        email: string
        avatar?: string
    }
    jobTitle: string
    jobId: string
}

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Applicant[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [sourceFilter, setSourceFilter] = useState("ALL")
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [bulkProcessing, setBulkProcessing] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchCandidates()
    }, [])

    const fetchCandidates = async () => {
        try {
            const jobsRes = await api.get('/jobs/my/listings')
            const jobs = jobsRes.data || []

            const allCandidates: Applicant[] = []

            for (const job of jobs) {
                try {
                    const appsRes = await api.get(`/ats/applications/${job.id}`)
                    const apps = appsRes.data || []
                    for (const app of apps) {
                        allCandidates.push({
                            id: app.id,
                            status: app.status,
                            source: app.source,
                            atsScore: app.atsScore || 0,
                            createdAt: app.createdAt,
                            externalName: app.externalName,
                            externalEmail: app.externalEmail,
                            applicant: app.applicant,
                            jobTitle: job.title,
                            jobId: job.id
                        })
                    }
                } catch {
                    // Skip errors
                }
            }

            setCandidates(allCandidates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }

    const filtered = useMemo(() => {
        return candidates.filter(c => {
            const name = c.applicant?.name || c.externalName || ''
            const email = c.applicant?.email || c.externalEmail || ''
            const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase()) || c.jobTitle.toLowerCase().includes(search.toLowerCase())
            const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
            const matchesSource = sourceFilter === 'ALL' || c.source === sourceFilter
            return matchesSearch && matchesStatus && matchesSource
        })
    }, [candidates, search, statusFilter, sourceFilter])

    const getName = (c: Applicant) => c.applicant?.name || c.externalName || 'Unknown'
    const getEmail = (c: Applicant) => c.applicant?.email || c.externalEmail || ''

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filtered.map(c => c.id)))
        }
    }

    const handleBulkAction = async (status: string) => {
        if (selectedIds.size === 0) return
        setBulkProcessing(true)
        try {
            await api.post('/ats/bulk-status', {
                applicationIds: Array.from(selectedIds),
                status,
                notes: `Bulk ${status.toLowerCase()} action`
            })
            setSelectedIds(new Set())
            fetchCandidates()
        } catch (error) {
            console.error('Bulk action failed:', error)
            alert('Bulk action failed')
        } finally {
            setBulkProcessing(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            APPLIED: 'bg-gray-100 text-gray-700',
            VIEWED: 'bg-blue-50 text-blue-700',
            SCREENED: 'bg-indigo-50 text-indigo-700',
            SHORTLISTED: 'bg-purple-50 text-purple-700',
            INTERVIEW_SCHEDULED: 'bg-violet-50 text-violet-700',
            INTERVIEW_PENDING: 'bg-violet-50 text-violet-700',
            INTERVIEWED: 'bg-amber-50 text-amber-700',
            SELECTED: 'bg-green-50 text-green-700',
            APPOINTED: 'bg-emerald-50 text-emerald-700',
            HIRED: 'bg-emerald-100 text-emerald-800',
            REJECTED: 'bg-red-50 text-red-700',
        }
        return <Badge className={`${colors[status] || ''} border-none text-[10px]`}>{status.replace(/_/g, ' ')}</Badge>
    }

    const statuses = ['ALL', 'APPLIED', 'VIEWED', 'SCREENED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'SELECTED', 'APPOINTED', 'REJECTED']

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                        All Candidates
                    </h1>
                    <p className="text-muted-foreground mt-1">Unified view of all applicants across your open positions.</p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-sm">{selectedIds.size} selected</Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={bulkProcessing}>
                                        {bulkProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                                        Bulk Action
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Move To</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleBulkAction('SHORTLISTED')}>
                                        <UserCheck className="mr-2 h-4 w-4 text-purple-600" /> Shortlist
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBulkAction('SCREENED')}>
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" /> Screen
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleBulkAction('REJECTED')} className="text-red-600">
                                        <XCircle className="mr-2 h-4 w-4" /> Reject
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, or job title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statuses.map(s => (
                            <SelectItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Sources</SelectItem>
                        <SelectItem value="INTERNAL">Internal</SelectItem>
                        <SelectItem value="EXTERNAL">External</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card className="glass-card">
                    <CardContent className="p-3 text-center">
                        <div className="text-xl font-bold">{candidates.length}</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-3 text-center">
                        <div className="text-xl font-bold text-blue-600">{candidates.filter(c => c.status === 'APPLIED').length}</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">New</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-3 text-center">
                        <div className="text-xl font-bold text-purple-600">{candidates.filter(c => c.status === 'SHORTLISTED').length}</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Shortlisted</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-3 text-center">
                        <div className="text-xl font-bold text-green-600">{candidates.filter(c => ['SELECTED', 'APPOINTED', 'HIRED'].includes(c.status)).length}</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hired</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-3 text-center">
                        <div className="text-xl font-bold text-red-600">{candidates.filter(c => c.status === 'REJECTED').length}</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rejected</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="glass-card border-none shadow-xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-muted/20">
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="font-bold">Candidate</TableHead>
                                <TableHead className="font-bold">Job</TableHead>
                                <TableHead className="font-bold">Source</TableHead>
                                <TableHead className="font-bold">ATS Score</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold">Applied</TableHead>
                                <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-4 w-4 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">No candidates found</p>
                                        <p className="text-sm mt-1">{search ? 'Try adjusting your search or filters' : 'Start receiving applications by posting a job'}</p>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.map((candidate) => (
                                <TableRow key={candidate.id} className="hover:bg-muted/20 transition-colors border-muted/10 cursor-pointer"
                                    onClick={() => router.push(`/employer/dashboard/ats/candidate/${candidate.id}`)}>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedIds.has(candidate.id)}
                                            onCheckedChange={() => toggleSelect(candidate.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                                {getName(candidate).charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold truncate">{getName(candidate)}</div>
                                                <div className="text-[10px] text-muted-foreground truncate">{getEmail(candidate)}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium">{candidate.jobTitle}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px]">
                                            {candidate.source === 'INTERNAL' ? 'Platform' : 'External'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {candidate.atsScore > 0 ? (
                                            <div className="flex items-center gap-1.5">
                                                <Zap className={`h-3 w-3 ${candidate.atsScore >= 80 ? 'text-green-500' : candidate.atsScore >= 60 ? 'text-amber-500' : 'text-red-500'}`} />
                                                <span className="text-sm font-bold">{candidate.atsScore}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                                    <TableCell>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(candidate.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/employer/dashboard/ats/candidate/${candidate.id}`)}>
                                                    View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/employer/schedule-interview?appId=${candidate.id}`)}>
                                                    <Calendar className="mr-2 h-4 w-4" /> Schedule Interview
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => router.push(`/employer/jobs/${candidate.jobId}`)}>
                                                    View Job Pipeline
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
