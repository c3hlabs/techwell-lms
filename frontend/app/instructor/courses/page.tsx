"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen, Clock, Users } from 'lucide-react'

export default function InstructorCourses() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Courses</h1>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Course
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-muted relative">
                            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                <BookOpen className="h-12 w-12" />
                            </div>
                        </div>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">Advanced Multi-Biz Architecture</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    124 Students
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    12.5 hrs
                                </div>
                            </div>
                            <Button variant="outline" className="w-full">Manage Course</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
