"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Video, Calendar, User, CheckCircle2, MoreHorizontal, Clock, ArrowRight, VideoOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function EmployerInterviewsPage() {
    const [interviews, setInterviews] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchInterviews()
    }, [])

    const fetchInterviews = async () => {
        try {
            // Reusing student interview stats or finding employer-specific endpoint
            const res = await api.get('/interviews/job-interviews')
            setInterviews(res.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                        Interview Pipeline
                    </h1>
                    <p className="text-muted-foreground mt-1">Review AI-conducted interviews and manage candidate screenings.</p>
                </div>
            </div>

            {/* Interviews Table */}
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
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <TableRow key={i} className="border-muted/10">
                                        <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell className="text-right"><div className="h-8 w-24 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : interviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <VideoOff className="h-12 w-12 mb-2" />
                                            <p className="text-lg font-medium">No interviews recorded yet</p>
                                            <p className="text-sm">Candidates will appear here once they complete their AI mock interviews.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : interviews.map((interview) => (
                                <TableRow key={interview.id} className="hover:bg-muted/20 transition-colors border-muted/10 group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {interview.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{interview.user?.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{interview.user?.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{interview.role}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{interview.difficulty} Level</span>
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
                                        <Badge
                                            variant={interview.status === 'COMPLETED' ? 'default' : 'secondary'}
                                            className={interview.status === 'COMPLETED' ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25 border-none' : ''}
                                        >
                                            {interview.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all group-hover:scale-105"
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
        </div>
    )
}
