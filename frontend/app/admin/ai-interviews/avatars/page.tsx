"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Users,
    Plus,
    Edit,
    Trash2,
    ArrowLeft,
    User,
    Briefcase,
    Smile
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/lib/api'

interface Avatar {
    id: string
    name: string
    role: string
    personality: string
    avatarUrl: string
    voiceId?: string
    isActive: boolean
}

const DEFAULT_AVATARS: Avatar[] = [
    {
        id: '1',
        name: 'Alex Chen',
        role: 'Technical Interviewer',
        personality: 'Friendly',
        avatarUrl: '/interviewer_avatar.png',
        isActive: true
    },
    {
        id: '2',
        name: 'Sarah Johnson',
        role: 'HR Interviewer',
        personality: 'Professional',
        avatarUrl: '/interviewer_avatar.png',
        isActive: true
    },
    {
        id: '3',
        name: 'David Smith',
        role: 'Senior Technical',
        personality: 'Strict',
        avatarUrl: '/interviewer_avatar.png',
        isActive: false
    }
]

export default function AvatarsPage() {
    const [avatars, setAvatars] = useState<Avatar[]>(DEFAULT_AVATARS)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingAvatar, setEditingAvatar] = useState<Avatar | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        role: 'Technical Interviewer',
        personality: 'Friendly',
        avatarUrl: '',
        voiceId: ''
    })

    const handleSubmit = async () => {
        if (editingAvatar) {
            // Update existing
            setAvatars(prev => prev.map(a =>
                a.id === editingAvatar.id
                    ? { ...a, ...formData }
                    : a
            ))
        } else {
            // Create new
            const newAvatar: Avatar = {
                id: Date.now().toString(),
                ...formData,
                isActive: true
            }
            setAvatars(prev => [...prev, newAvatar])
        }

        setIsDialogOpen(false)
        setEditingAvatar(null)
        setFormData({ name: '', role: 'Technical Interviewer', personality: 'Friendly', avatarUrl: '', voiceId: '' })
    }

    const handleEdit = (avatar: Avatar) => {
        setEditingAvatar(avatar)
        setFormData({
            name: avatar.name,
            role: avatar.role,
            personality: avatar.personality,
            avatarUrl: avatar.avatarUrl,
            voiceId: avatar.voiceId || ''
        })
        setIsDialogOpen(true)
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this avatar?')) {
            setAvatars(prev => prev.filter(a => a.id !== id))
        }
    }

    const toggleActive = (id: string) => {
        setAvatars(prev => prev.map(a =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
        ))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/ai-interviews">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Avatars</h1>
                        <p className="text-muted-foreground">Manage interviewer personas and appearances.</p>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingAvatar(null); setFormData({ name: '', role: 'Technical Interviewer', personality: 'Friendly', avatarUrl: '', voiceId: '' }) }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Avatar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingAvatar ? 'Edit Avatar' : 'Create New Avatar'}</DialogTitle>
                            <DialogDescription>
                                Configure the interviewer persona details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g., Alex Chen"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData(f => ({ ...f, role: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Technical Interviewer">Technical Interviewer</SelectItem>
                                        <SelectItem value="HR Interviewer">HR Interviewer</SelectItem>
                                        <SelectItem value="Senior Technical">Senior Technical</SelectItem>
                                        <SelectItem value="Behavioral Expert">Behavioral Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="personality">Personality</Label>
                                <Select
                                    value={formData.personality}
                                    onValueChange={(value) => setFormData(f => ({ ...f, personality: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select personality" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Friendly">Friendly</SelectItem>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                        <SelectItem value="Strict">Strict</SelectItem>
                                        <SelectItem value="Encouraging">Encouraging</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="avatarUrl">Avatar Image URL</Label>
                                <Input
                                    id="avatarUrl"
                                    value={formData.avatarUrl}
                                    onChange={(e) => setFormData(f => ({ ...f, avatarUrl: e.target.value }))}
                                    placeholder="https://example.com/avatar.png"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="voiceId">Voice ID (Optional)</Label>
                                <Input
                                    id="voiceId"
                                    value={formData.voiceId}
                                    onChange={(e) => setFormData(f => ({ ...f, voiceId: e.target.value }))}
                                    placeholder="ElevenLabs voice ID"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={!formData.name}>
                                {editingAvatar ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {avatars.map((avatar) => (
                    <Card key={avatar.id} className={!avatar.isActive ? 'opacity-60' : ''}>
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden">
                                        {avatar.avatarUrl ? (
                                            <img
                                                src={avatar.avatarUrl}
                                                alt={avatar.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-8 w-8 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{avatar.name}</CardTitle>
                                        <CardDescription>{avatar.role}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(avatar)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(avatar.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Smile className="h-4 w-4" />
                                    {avatar.personality}
                                </div>
                            </div>
                            <div className="mt-4">
                                <Button
                                    variant={avatar.isActive ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleActive(avatar.id)}
                                >
                                    {avatar.isActive ? 'Active' : 'Inactive'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
