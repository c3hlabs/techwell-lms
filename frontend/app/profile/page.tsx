"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { userApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User as UserIcon, Mail, Phone, Save, Loader2, Shield } from 'lucide-react'

interface ExtendedUser {
    id: string
    name: string
    email: string
    role: string
    phone?: string
    avatar?: string
}

export default function ProfilePage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading, refreshUser, logout } = useAuth()
    const currentUser = user as ExtendedUser | null

    const [isEditing, setIsEditing] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: '',
        phone: '',
    })
    const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    React.useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                phone: currentUser.phone || '',
            })
        }
    }, [currentUser])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage(null)

        try {
            await userApi.updateMe(formData)
            await refreshUser()
            setIsEditing(false)
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } }
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' })
        } finally {
            setIsSaving(false)
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            case 'ADMIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            case 'INSTRUCTOR': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }
    }

    if (authLoading || !currentUser) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            {message && (
                <div className={`mb-6 p-3 rounded-lg text-sm ${message.type === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserIcon className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{currentUser.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <Mail className="h-3 w-3" />
                                    {currentUser.email}
                                </CardDescription>
                            </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${getRoleBadgeColor(currentUser.role)}`}>
                            <Shield className="h-3 w-3" />
                            {currentUser.role}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 9876543210"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                    <p className="mt-1">{currentUser.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="mt-1">{currentUser.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                    <p className="mt-1">{currentUser.phone || 'Not set'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                                    <p className="mt-1">{currentUser.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </Button>
                                <Button variant="destructive" onClick={logout}>
                                    Logout
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
