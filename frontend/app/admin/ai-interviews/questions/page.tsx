"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    MessageSquare,
    Plus,
    Edit,
    Trash2,
    ArrowLeft,
    Search,
    Filter,
    BookOpen
} from 'lucide-react'
import Link from 'next/link'

interface KnowledgeEntry {
    id: string
    domain: string
    topic: string
    content: string
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    createdAt: string
}

const SAMPLE_ENTRIES: KnowledgeEntry[] = [
    {
        id: '1',
        domain: 'IT',
        topic: 'JavaScript Closures',
        content: 'Explain what closures are in JavaScript and provide an example of their practical use.',
        difficulty: 'INTERMEDIATE',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        domain: 'IT',
        topic: 'React Hooks',
        content: 'What are React Hooks? Explain useState and useEffect with examples.',
        difficulty: 'BEGINNER',
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        domain: 'IT',
        topic: 'System Design',
        content: 'Design a scalable notification system for a social media platform.',
        difficulty: 'ADVANCED',
        createdAt: new Date().toISOString()
    }
]

export default function QuestionsPage() {
    const [entries, setEntries] = useState<KnowledgeEntry[]>(SAMPLE_ENTRIES)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterDomain, setFilterDomain] = useState<string>('all')
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all')

    const [formData, setFormData] = useState<{
        domain: string
        topic: string
        content: string
        difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    }>({
        domain: 'IT',
        topic: '',
        content: '',
        difficulty: 'INTERMEDIATE'
    })

    const handleSubmit = async () => {
        if (editingEntry) {
            setEntries(prev => prev.map(e =>
                e.id === editingEntry.id
                    ? { ...e, ...formData }
                    : e
            ))
        } else {
            const newEntry: KnowledgeEntry = {
                id: Date.now().toString(),
                ...formData,
                createdAt: new Date().toISOString()
            }
            setEntries(prev => [...prev, newEntry])
        }

        setIsDialogOpen(false)
        setEditingEntry(null)
        setFormData({ domain: 'IT', topic: '', content: '', difficulty: 'INTERMEDIATE' })
    }

    const handleEdit = (entry: KnowledgeEntry) => {
        setEditingEntry(entry)
        setFormData({
            domain: entry.domain,
            topic: entry.topic,
            content: entry.content,
            difficulty: entry.difficulty
        })
        setIsDialogOpen(true)
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this Q&A entry?')) {
            setEntries(prev => prev.filter(e => e.id !== id))
        }
    }

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesDomain = filterDomain === 'all' || entry.domain === filterDomain
        const matchesDifficulty = filterDifficulty === 'all' || entry.difficulty === filterDifficulty
        return matchesSearch && matchesDomain && matchesDifficulty
    })

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'BEGINNER': return 'bg-green-100 text-green-800'
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800'
            case 'ADVANCED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
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
                        <h1 className="text-3xl font-bold tracking-tight">Q&A Training</h1>
                        <p className="text-muted-foreground">Train AI with domain-specific questions and knowledge.</p>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingEntry(null); setFormData({ domain: 'IT', topic: '', content: '', difficulty: 'INTERMEDIATE' }) }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Q&A Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>{editingEntry ? 'Edit Q&A Entry' : 'Add New Q&A Entry'}</DialogTitle>
                            <DialogDescription>
                                Add knowledge to train the AI interviewer.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="domain">Domain</Label>
                                    <Select
                                        value={formData.domain}
                                        onValueChange={(value) => setFormData(f => ({ ...f, domain: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select domain" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IT">IT / Software</SelectItem>
                                            <SelectItem value="Finance">Finance</SelectItem>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                            <SelectItem value="HR">HR / Behavioral</SelectItem>
                                            <SelectItem value="General">General</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="difficulty">Difficulty</Label>
                                    <Select
                                        value={formData.difficulty}
                                        onValueChange={(value: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') => setFormData(f => ({ ...f, difficulty: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="topic">Topic</Label>
                                <Input
                                    id="topic"
                                    value={formData.topic}
                                    onChange={(e) => setFormData(f => ({ ...f, topic: e.target.value }))}
                                    placeholder="e.g., JavaScript Closures"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="content">Question / Content</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) => setFormData(f => ({ ...f, content: e.target.value }))}
                                    placeholder="Enter the interview question or knowledge content..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={!formData.topic || !formData.content}>
                                {editingEntry ? 'Update' : 'Add to Knowledge Base'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{entries.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Beginner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {entries.filter(e => e.difficulty === 'BEGINNER').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Intermediate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {entries.filter(e => e.difficulty === 'INTERMEDIATE').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Advanced</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {entries.filter(e => e.difficulty === 'ADVANCED').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search topics or content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterDomain} onValueChange={setFilterDomain}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Domain" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Domains</SelectItem>
                                <SelectItem value="IT">IT / Software</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="HR">HR</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="BEGINNER">Beginner</SelectItem>
                                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                <SelectItem value="ADVANCED">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Topic</TableHead>
                                <TableHead>Domain</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead className="max-w-[300px]">Content</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEntries.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-medium">{entry.topic}</TableCell>
                                    <TableCell>{entry.domain}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(entry.difficulty)}`}>
                                            {entry.difficulty}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate">{entry.content}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredEntries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        No entries found. Add some Q&A to train the AI.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
