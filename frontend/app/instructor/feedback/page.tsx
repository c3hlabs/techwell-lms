"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InstructorFeedback() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Student Feedback</h1>
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Recent Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground italic">Course reviews and feedback will appear here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
