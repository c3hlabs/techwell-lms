"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Mail, Phone, Calendar, Star, Download, Send, CheckCircle, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CandidateProfilePage() {
    const { id } = useParams()
    const router = useRouter()
    const [application, setApplication] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [score, setScore] = useState<number | null>(null)

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        try {
            const res = await api.get(`/ats/applications/detail/${id}`) // Assuming this endpoint handles finding by ID
            setApplication(res.data)
            setScore(res.data.atsScore)

            // Auto-mark as VIEWED if status is APPLIED
            if (res.data.status === 'APPLIED') {
                await api.patch(`/ats/status/${id}`, { status: 'VIEWED' })
                // Update local state without re-fetching entire object to avoid loop/flash
                setApplication((prev: any) => ({ ...prev, status: 'VIEWED' }))
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleScore = async () => {
        const res = await api.post(`/ats/score/${id}`)
        setScore(res.data.atsScore)
        fetchData()
    }

    const handleStatusUpdate = async (newStatus: string) => {
        await api.patch(`/ats/status/${id}`, { status: newStatus })
        // Optimistic or re-fetch
        setApplication((prev: any) => ({ ...prev, status: newStatus }))
        // fetchData() // Optional: re-fetch to get history update
    }

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    if (!application) return <div>Candidate not found</div>

    const { applicant, externalName, externalEmail, externalPhone, source, status, coverLetter, resumeUrl } = application
    const name = applicant?.name || externalName
    const email = applicant?.email || externalEmail
    const phone = applicant?.phone || externalPhone || "N/A"

    return (
        <div className="container py-8 max-w-4xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">← Back to Pipeline</Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Sidebar Profile */}
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={applicant?.avatar} />
                            <AvatarFallback className="text-xl">{name[0]}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold">{name}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{email}</p>

                        <div className="flex flex-wrap gap-2 justify-center mb-6">
                            {source === 'INTERNAL' ? (
                                <Badge className="bg-blue-600 hover:bg-blue-700">TechWell Student</Badge>
                            ) : (
                                <Badge variant="secondary">External</Badge>
                            )}
                            <Badge variant="outline">{status}</Badge>
                        </div>

                        <div className="w-full space-y-2 text-left text-sm">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" /> {phone}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" /> {email}
                            </div>
                        </div>

                        <div className="mt-6 w-full space-y-2">
                            <Button className="w-full" variant="outline" onClick={() => window.open(resumeUrl, '_blank')}>
                                <Download className="mr-2 h-4 w-4" /> Resume
                            </Button>
                            <Button className="w-full">
                                <Mail className="mr-2 h-4 w-4" /> Send Email
                            </Button>
                            <Button className="w-full" variant="secondary" onClick={() => router.push(`/employer/schedule-interview?appId=${application.id}`)}>
                                <Calendar className="mr-2 h-4 w-4" /> Schedule Interview
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* ATS Score Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between">
                                ATS Analysis
                                {score ? (
                                    <Badge variant={score >= 80 ? 'default' : 'secondary'} className={score >= 80 ? 'bg-green-600' : ''}>
                                        {score}% Match
                                    </Badge>
                                ) : (
                                    <Button size="sm" onClick={handleScore}>Calculate Score</Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Based on keyword matching between the job description and candidate resume.
                                {score && score >= 80 ? " Strong match! Recommended for interview." :
                                    score && score >= 60 ? " Good match. Review experience details." :
                                        score ? " Low match. Check resume manually." : " Click calculate to run analysis."}
                            </p>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="details">
                        <TabsList className="w-full">
                            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                            <TabsTrigger value="resume" className="flex-1">Resume</TabsTrigger>
                            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details">
                            <Card>
                                <CardHeader><CardTitle>Cover Letter</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                                        {coverLetter || "No cover letter provided."}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="resume">
                            <Card>
                                <CardContent className="p-0 h-[500px]">
                                    {resumeUrl ? (
                                        <iframe src={resumeUrl} className="w-full h-full rounded-md" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">No Resume Uploaded</div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {(application.statusHistory || []).map((entry: any, i: number) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                                    {i < (application.statusHistory.length - 1) && <div className="w-0.5 h-full bg-border -mb-2" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{entry.status}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(entry.timestamp).toLocaleString()} • {entry.notes || 'No notes'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
                        <CardContent className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('SHORTLISTED')}>Shortlist</Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('REJECTED')} className="text-red-600 hover:text-red-700 hover:bg-red-50">Reject</Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('HIRED')} className="text-green-600 hover:text-green-700 hover:bg-green-50">Hire Candidate</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
