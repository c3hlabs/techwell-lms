"use client"

import * as React from "react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"
import { Loader2 } from "lucide-react"

export function InterviewAnalytics() {
    const [data, setData] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Determine if we are viewing as admin or student
                // Ideally this component props handles it or API handles it based on context
                // For now, let's assume API /analytics/interviews handles perms.
                const res = await api.get('/analytics/interviews')
                setData(res.data)
            } catch (e) {
                console.error("Failed to fetch analytics", e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
    if (!data) return null

    const radarData = [
        { subject: 'Technical', A: data.radar.tech, fullMark: 100 },
        { subject: 'Communication', A: data.radar.comm, fullMark: 100 },
        { subject: 'Confidence', A: data.radar.conf, fullMark: 100 },
    ]

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Performance Trend</CardTitle>
                        <CardDescription>Your mock interview scores over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.trend}>
                                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="score" stroke="#adfa1d" strokeWidth={2} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Skill Profile</CardTitle>
                        <CardDescription>Average performance by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar name="Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Common Weaknesses</CardTitle>
                        <CardDescription>Areas identified for improvement</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.weaknesses.map((w: any, i: number) => (
                                <div key={i} className="flex items-center">
                                    <div className="w-full">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">{w.tag}</span>
                                            <span className="text-sm text-muted-foreground">{w.count} times</span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500" style={{ width: `${Math.min((w.count / data.totalInterviews) * 100, 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {data.weaknesses.length === 0 && <p className="text-muted-foreground">No weaknesses identified yet.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Interview Stats</CardTitle>
                        <CardDescription>Overall engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <div className="text-5xl font-bold mb-2">{data.totalInterviews}</div>
                            <p className="text-muted-foreground">Total Sessions Completed</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
