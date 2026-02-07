"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, ArrowLeft, Mail, Phone, Calendar, Shield, Activity, FileText } from "lucide-react"

export default function User360Page() {
    const { id } = useParams()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [auditLogs, setAuditLogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        try {
            // Fetch basic user data (mocking endpoint logic as /users/id might not exist, using activity mostly)
            // But we do need user details. We can reuse /users/me logic if we had /users/:id
            // For now, let's assume we can fetch via the list or dedicated endpoint.
            // Since we implemented GET /users/:id/activity, let's assume we can get basic info there or fetch list and find.
            // Let's rely on activity primarily as that's the new feature.

            // Actually, best to verify if there is a generic admin get user. 
            // Existing `user.routes.js` doesn't have GET /:id except 'me'. 
            // I will use activity to show "Working" and mock user details from it if possible, OR
            // I should have added GET /api/users/:id. 
            // Optimization: I'll fetch /api/users (list) and find (inefficient but safe for now) OR just display activity.

            const [activityRes, usersRes] = await Promise.all([
                api.get(`/users/${id}/activity`),
                api.get('/users')
            ])

            setAuditLogs(activityRes.data)

            const foundUser = usersRes.data.users.find((u: any) => u.id === id)
            setUser(foundUser)

        } catch (error) {
            console.error("Failed to fetch user data", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8" /></div>
    if (!user) return <div className="p-8">User not found</div>

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
            </Button>

            {/* Profile Header */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-2xl">{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <Badge variant="outline" className="mt-2 mb-4">{user.role}</Badge>

                        <div className="w-full space-y-3 text-left">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" /> {user.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Shield className="h-4 w-4" /> {user.isActive ? 'Active Account' : 'Deactivated'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity & Stats */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Audit Trail & Activity
                            </CardTitle>
                            <CardDescription>
                                Monitor accountability: Track every action performed by this user.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-6 relative border-l ml-2 pl-6">
                                    {auditLogs.length === 0 && (
                                        <p className="text-muted-foreground text-sm">No activity recorded for this user yet.</p>
                                    )}
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="relative">
                                            <div className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white ${log.action === 'LOGIN' ? 'bg-green-500' :
                                                    log.action === 'DELETE' ? 'bg-red-500' :
                                                        'bg-blue-500'
                                                }`} />
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{log.action}</span>
                                                    <Badge variant="secondary" className="text-[10px]">{log.entityType}</Badge>
                                                    <span className="text-xs text-muted-foreground ml-auto">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded font-mono">
                                                    {log.method} {log.path}
                                                </p>
                                                {log.ipAddress && (
                                                    <div className="text-[10px] text-muted-foreground mt-1">
                                                        IP: {log.ipAddress} | UA: {log.userAgent?.substring(0, 50)}...
                                                    </div>
                                                )}
                                                {log.details && (
                                                    <pre className="text-[10px] bg-slate-900 text-slate-50 p-2 rounded mt-2 overflow-x-auto">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
