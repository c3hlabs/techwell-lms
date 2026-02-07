"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, UserCheck, UserX, Loader2, Users, Download, Eye, CheckCircle, XCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { exportToCSV } from '@/lib/export-utils'

interface User {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
    employerProfile?: { status: string }
    totalPaid?: number
}

export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = React.useState<User[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [activeTab, setActiveTab] = React.useState("all")

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users')
            setUsers(res.data.users || [])
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        fetchUsers()
    }, [])

    const handleApprove = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.patch(`/users/${userId}/approve`, { status, notes: "Admin Action" })
            fetchUsers()
        } catch (error) {
            console.error("Approval failed", error)
        }
    }

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await api.patch(`/users/${userId}/status`, { isActive: !currentStatus })
            fetchUsers()
        } catch (error) {
            console.error("Failed to toggle status", error)
        }
    }

    const filterUsers = (tab: string) => {
        let filtered = users;
        if (searchQuery) {
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        switch (tab) {
            case 'employers': return filtered.filter(u => u.role === 'EMPLOYER')
            case 'staff': return filtered.filter(u => ['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'STAFF'].includes(u.role))
            case 'students': return filtered.filter(u => u.role === 'STUDENT')
            default: return filtered
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-purple-500/10 text-purple-600 border-purple-200'
            case 'ADMIN': return 'bg-purple-500/10 text-purple-600 border-purple-200'
            case 'INSTRUCTOR': return 'bg-blue-500/10 text-blue-600 border-blue-200'
            case 'EMPLOYER': return 'bg-orange-500/10 text-orange-600 border-orange-200'
            case 'STUDENT': return 'bg-green-500/10 text-green-600 border-green-200'
            default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
        }
    }

    const renderTable = (data: User[]) => (
        <div className="rounded-2xl border border-white/10 glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-white/5 text-left border-b border-white/10">
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">User Profile</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Access Level</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Verified Status</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Financials</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary shadow-inner">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground">{user.name}</div>
                                            <div className="text-muted-foreground text-xs">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} font-bold text-[10px] px-2 py-0.5`}>
                                        {user.role}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {user.isActive ? (
                                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-transparent text-[10px] font-bold">
                                                ACTIVE
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-transparent text-[10px] font-bold">
                                                INACTIVE
                                            </Badge>
                                        )}
                                        {user.role === 'EMPLOYER' && (
                                            <Badge variant="outline" className={`text-[10px] font-bold ${user.employerProfile?.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-600 border-blue-200' : 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
                                                }`}>
                                                {user.employerProfile?.status || 'PENDING'}
                                            </Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-xs font-semibold text-foreground">
                                        ₹{(user.totalPaid || 0).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">Lifetime Value</div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => router.push(`/admin/users/${user.id}`)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        {user.role === 'EMPLOYER' && user.employerProfile?.status !== 'APPROVED' && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50" onClick={() => handleApprove(user.id, 'APPROVED')}>
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 ${user.isActive ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"}`}
                                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                                        >
                                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.length === 0 && (
                <div className="p-20 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No users found match your criteria</p>
                </div>
            )}
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">User <span className="text-primary">Governance</span></h1>
                    <p className="text-muted-foreground mt-1">Audit platform access, verify employers, and manage user lifecycles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="glass hover:bg-white/20 border-white/20 shadow-none">
                        <Download className="mr-2 h-4 w-4" /> Export Audit
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-4 rounded-2xl border-l-4 border-l-primary">
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Total Population</p>
                    <h3 className="text-2xl font-black mt-1">{users.length}</h3>
                </div>
                <div className="glass-card p-4 rounded-2xl border-l-4 border-l-orange-500">
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Active Employers</p>
                    <h3 className="text-2xl font-black mt-1">{users.filter(u => u.role === 'EMPLOYER' && u.isActive).length}</h3>
                </div>
                <div className="glass-card p-4 rounded-2xl border-l-4 border-l-green-500">
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Verified Students</p>
                    <h3 className="text-2xl font-black mt-1">{users.filter(u => u.role === 'STUDENT' && u.isActive).length}</h3>
                </div>
                <div className="glass-card p-4 rounded-2xl border-l-4 border-l-blue-500">
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Instructors</p>
                    <h3 className="text-2xl font-black mt-1">{users.filter(u => u.role === 'INSTRUCTOR').length}</h3>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                    <TabsList className="bg-white/5 border border-white/10 p-1 h-12 rounded-xl">
                        <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white h-full px-6">All Access</TabsTrigger>
                        <TabsTrigger value="employers" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white h-full px-6 text-xs font-bold uppercase tracking-wider">Employers</TabsTrigger>
                        <TabsTrigger value="staff" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white h-full px-6 text-xs font-bold uppercase tracking-wider">Governance Staff</TabsTrigger>
                        <TabsTrigger value="students" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white h-full px-6 text-xs font-bold uppercase tracking-wider">Learning Bench</TabsTrigger>
                    </TabsList>

                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by name or email..."
                            className="pl-10 h-11 border-white/10 glass-input rounded-xl focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium animate-pulse">Syncing User Directory...</p>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <TabsContent value="all" className="m-0">{renderTable(filterUsers('all'))}</TabsContent>
                        <TabsContent value="employers" className="m-0">{renderTable(filterUsers('employers'))}</TabsContent>
                        <TabsContent value="staff" className="m-0">{renderTable(filterUsers('staff'))}</TabsContent>
                        <TabsContent value="students" className="m-0">{renderTable(filterUsers('students'))}</TabsContent>
                    </div>
                )}
            </Tabs>
        </div>
    )
}

