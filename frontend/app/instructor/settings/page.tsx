"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InstructorSettings() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Instructor Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground italic">Profile and notification settings.</p>
                </CardContent>
            </Card>
        </div>
    )
}
