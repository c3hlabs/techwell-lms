"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Briefcase, Building2, Calendar, Clock, MapPin, Search } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import api from "@/lib/api"
import { Loader2 } from "lucide-react"

interface Application {
    id: string
    status: string
    createdAt: string
    job: {
        id: string
        title: string
        location: string
        type: string
        employer: {
            employerProfile: {
                companyName: string
                logo: string | null
            }
        }
    }
}

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchApplications()
    }, [])

    const fetchApplications = async () => {
        try {
            // We need to create this endpoint or use a generic one
            // Assuming we added `GET /api/jobs/my/applications` or similar? 
            // Wait, I didn't add it in jobs.routes.js explicitly for students.
            // Let me check my memory or file. I will mock it or add it if missing.
            // Actually, I should probably add the endpoint first. 
            // BUT for now, let's assume I'll mock it or add it next.
            // Let's check `jobs.routes.js` content from my memory...
            // I added `POST /:id/apply` but not `GET /my/applications`.

            // I will implement this page assuming the endpoint exists, then fix the backend.
            const res = await api.get('/jobs/applications/me')
            setApplications(res.data)
        } catch (error) {
            console.error("Failed to fetch applications", error)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPLIED': return 'bg-blue-100 text-blue-700'
            case 'SHORTLISTED': return 'bg-green-100 text-green-700'
            case 'REJECTED': return 'bg-red-100 text-red-700'
            case 'HIRED': return 'bg-purple-100 text-purple-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="container py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Applications</h1>
                <p className="text-muted-foreground">Track the status of your job applications.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
            ) : applications.length === 0 ? (
                <Card className="text-center p-12">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No applications yet</h3>
                    <p className="text-muted-foreground mb-4">Start exploring jobs and apply to your dream companies.</p>
                    <Link href="/jobs">
                        <Button>Find Jobs</Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <Card key={app.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={app.job.employer.employerProfile?.logo || ''} />
                                    <AvatarFallback><Building2 className="h-5 w-5" /></AvatarFallback>
                                </Avatar>

                                <div className="flex-1 space-y-1">
                                    <Link href={`/jobs/${app.job.id}`} className="hover:underline">
                                        <h3 className="font-semibold text-lg">{app.job.title}</h3>
                                    </Link>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <span>{app.job.employer.employerProfile?.companyName}</span>
                                        <span>•</span>
                                        <span>{app.job.location}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 text-sm">
                                    <Badge className={getStatusColor(app.status)} variant="outline">
                                        {app.status}
                                    </Badge>
                                    <div className="text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Applied {new Date(app.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
