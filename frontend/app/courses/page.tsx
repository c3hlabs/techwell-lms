"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { courseApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GraduationCap, Clock, Users, Star, Search, Filter, Loader2 } from 'lucide-react'

interface Course {
    id: string
    title: string
    description: string
    category: string
    difficulty: string
    duration: number
    price: number
    thumbnail?: string
    instructor?: { name: string }
    _count?: { enrollments: number }
    isEnrolled?: boolean
}

const categories = [
    { value: '', label: 'All Categories' },
    { value: 'WEB_DEV', label: 'Web Development' },
    { value: 'DATA_SCIENCE', label: 'Data Science' },
    { value: 'MOBILE', label: 'Mobile Development' },
    { value: 'CLOUD', label: 'Cloud Computing' },
    { value: 'AI_ML', label: 'AI & Machine Learning' },
]

const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
]

export default function CoursesPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()

    const [courses, setCourses] = React.useState<Course[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [search, setSearch] = React.useState('')
    const [category, setCategory] = React.useState('')
    const [difficulty, setDifficulty] = React.useState('')
    const [enrollingId, setEnrollingId] = React.useState<string | null>(null)

    const fetchCourses = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await courseApi.getAll({
                search: search || undefined,
                category: category || undefined
            })
            setCourses(response.data.courses || [])
        } catch (error) {
            console.error('Failed to fetch courses:', error)
        } finally {
            setIsLoading(false)
        }
    }, [search, category])

    React.useEffect(() => {
        const debounce = setTimeout(fetchCourses, 300)
        return () => clearTimeout(debounce)
    }, [fetchCourses])

    const handleEnroll = async (courseId: string) => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        setEnrollingId(courseId)
        try {
            await courseApi.enroll(courseId)
            setCourses(courses.map(c =>
                c.id === courseId ? { ...c, isEnrolled: true } : c
            ))
        } catch (error) {
            console.error('Failed to enroll:', error)
        } finally {
            setEnrollingId(null)
        }
    }

    const filteredCourses = difficulty
        ? courses.filter(c => c.difficulty === difficulty)
        : courses

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'BEGINNER': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'ADVANCED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Browse Courses</h1>
                <p className="text-muted-foreground">
                    Explore our AI-adaptive courses and start building your tech career
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                    {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                    {difficulties.map(diff => (
                        <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                </select>
            </div>

            {/* Course Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No courses found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                            <div className="h-40 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-t-lg flex items-center justify-center">
                                <GraduationCap className="h-16 w-16 text-primary/50" />
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(course.difficulty)}`}>
                                        {course.difficulty}
                                    </span>
                                    <span className="text-sm text-muted-foreground">{course.category}</span>
                                </div>
                                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2 flex-1">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {course.duration}h
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {course._count?.enrollments || 0}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        4.8
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 flex items-center justify-between">
                                <span className="text-lg font-bold">
                                    {course.price === 0 ? 'Free' : `₹${course.price}`}
                                </span>
                                {course.isEnrolled ? (
                                    <Button variant="outline" onClick={() => router.push(`/courses/${course.id}`)}>
                                        Continue
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleEnroll(course.id)}
                                        disabled={enrollingId === course.id}
                                    >
                                        {enrollingId === course.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Enroll'
                                        )}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
