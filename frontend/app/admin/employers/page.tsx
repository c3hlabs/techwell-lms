"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X, Building2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface EmployerRequest {
    id: string
    companyName: string
    status: string
    createdAt: string
    user: {
        name: string
        email: string
        phone: string
    }
}

export default function AdminEmployersPage() {
    const [requests, setRequests] = useState<EmployerRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const res = await api.get('/employers/pending')
            setRequests(res.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.put(`/employers/${id}/status`, { status })
            setRequests(prev => prev.filter(r => r.id !== id))
            alert(`Employer ${status.toLowerCase()} successfully`)
        } catch (error) {
            alert('Failed to update status')
        }
    }

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Employer Requests</h1>
                <p className="text-muted-foreground">Approve or reject company registration requests.</p>
            </div>

            {requests.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                    <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No pending employer requests.</p>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {requests.map((req) => (
                        <Card key={req.id}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarFallback><Building2 className="h-5 w-5" /></AvatarFallback>
                                    </Avatar>
                                    <Badge variant="outline">{req.status}</Badge>
                                </div>
                                <CardTitle className="mt-4">{req.companyName}</CardTitle>
                                <CardDescription>Registered {new Date(req.createdAt).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm space-y-1">
                                    <p><span className="font-medium">User:</span> {req.user.name}</p>
                                    <p><span className="font-medium">Email:</span> {req.user.email}</p>
                                    <p><span className="font-medium">Phone:</span> {req.user.phone || 'N/A'}</p>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        size="sm"
                                        onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                    >
                                        <Check className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                    <Button
                                        className="w-full"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                    >
                                        <X className="mr-2 h-4 w-4" /> Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
