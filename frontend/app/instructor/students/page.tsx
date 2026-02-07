"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InstructorStudents() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Students</h1>
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Enrolled Students</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground italic">Student management view coming soon.</p>
                </CardContent>
            </Card>
        </div>
    )
}
