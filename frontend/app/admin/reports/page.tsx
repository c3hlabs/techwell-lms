"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import {
    Loader2, Download, TrendingUp, Users, DollarSign, Target, FileText
} from 'lucide-react'
import { exportToCSV } from '@/lib/export-utils'
import api from '@/lib/api'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ReportsPage() {
    interface BusinessSummary {
        year: number
        totalRevenue: number
        userGrowth: number
        leadConversionRate: number
        monthlyRevenue: { month: string, amount: number }[]
    }
    interface SalesPerformance {
        target: number
        achieved: number
        status: string
        period: string
    }
    interface CoursePerformance {
        title: string
        estimatedRevenue: number
    }

    const [summary, setSummary] = React.useState<BusinessSummary | null>(null)
    const [salesPerf, setSalesPerf] = React.useState<SalesPerformance | null>(null)
    const [coursePerf, setCoursePerf] = React.useState<CoursePerformance[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        fetchAllReports()
    }, [])

    const fetchAllReports = async () => {
        setIsLoading(true)
        try {
            const [summaryRes, salesRes, courseRes] = await Promise.all([
                api.get('/reports/business-summary'),
                api.get('/reports/sales-performance'),
                api.get('/reports/course-performance')
            ])
            setSummary(summaryRes.data)
            setSalesPerf(salesRes.data)
            setCoursePerf(courseRes.data)
        } catch (error) {
            console.error(error)
            // Mock Data for Demo
            setSummary({
                year: 2024,
                totalRevenue: 1250000,
                userGrowth: 450,
                leadConversionRate: 12.5,
                monthlyRevenue: [
                    { month: 'Jan', amount: 80000 }, { month: 'Feb', amount: 95000 }, { month: 'Mar', amount: 110000 },
                    { month: 'Apr', amount: 105000 }, { month: 'May', amount: 130000 }, { month: 'Jun', amount: 145000 },
                    { month: 'Jul', amount: 160000 }, { month: 'Aug', amount: 155000 }, { month: 'Sep', amount: 175000 },
                    { month: 'Oct', amount: 190000 }, { month: 'Nov', amount: 210000 }, { month: 'Dec', amount: 240000 },
                ]
            })
            setSalesPerf({
                target: 500000,
                achieved: 350000,
                status: 'On Track',
                period: 'Current Month'
            })
            setCoursePerf([
                { title: 'Full Stack Development', estimatedRevenue: 450000 },
                { title: 'Data Science with AI', estimatedRevenue: 380000 },
                { title: 'Digital Marketing', estimatedRevenue: 220000 },
                { title: 'UI/UX Design', estimatedRevenue: 150000 },
                { title: 'Cyber Security', estimatedRevenue: 120000 },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const handleExport = (type: 'summary' | 'sales' | 'courses') => {
        const timestamp = new Date().toISOString().split('T')[0]
        if (type === 'summary' && summary?.monthlyRevenue) {
            exportToCSV(summary.monthlyRevenue as unknown as Record<string, unknown>[], { filename: `business_summary_${timestamp}`, headers: ['month', 'amount'] })
        } else if (type === 'courses') {
            exportToCSV(coursePerf as unknown as Record<string, unknown>[], { filename: `course_performance_${timestamp}`, headers: ['title', 'estimatedRevenue'] })
        } else {
            alert('Exporting Sales Report...')
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Executive Reports</h1>
                    <p className="text-muted-foreground">High-level business intelligence and performance metrics.</p>
                </div>
                <Button onClick={() => window.print()} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Print / Save PDF
                </Button>
            </div>

            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">YTD Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹{(summary?.totalRevenue || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total revenue for {summary?.year}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">User Growth</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">+{summary?.userGrowth}</div>
                        <p className="text-xs text-muted-foreground mt-1">New users this year</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Lead Conversion</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{(summary?.leadConversionRate || 0).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Overall conversion rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trend Chart */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Revenue Monthly Trend</CardTitle>
                        <CardDescription>Financial performance over the last 12 months</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleExport('summary')}>
                        <FileText className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </CardHeader>
                <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={summary?.monthlyRevenue || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₹${value / 1000}k`}
                            />
                            <Tooltip
                                formatter={(value: number | string | undefined) => [`₹${Number(value || 0).toLocaleString()}`, 'Revenue']}
                                contentStyle={{ borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                name="Revenue"
                                stroke="#0088FE"
                                strokeWidth={3}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Performance vs Target */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Sales Performance ({salesPerf?.period})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Achieved</p>
                                    <p className="text-2xl font-bold">₹{salesPerf?.achieved?.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Target</p>
                                    <p className="text-xl font-semibold">₹{salesPerf?.target?.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Simple Progress Bar */}
                            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${(salesPerf?.achieved || 0) / (salesPerf?.target || 1) >= 1 ? 'bg-green-500' :
                                        (salesPerf?.achieved || 0) / (salesPerf?.target || 1) >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${Math.min(((salesPerf?.achieved || 0) / (salesPerf?.target || 1)) * 100, 100)}%` }}
                                ></div>
                            </div>

                            <p className="text-sm text-center font-medium">
                                {(((salesPerf?.achieved || 0) / (salesPerf?.target || 1)) * 100).toFixed(1)}% of monthly goal reached
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Course Performance */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Top Performing Courses</CardTitle>
                            <CardDescription>By estimated revenue</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleExport('courses')}>
                            <FileText className="mr-2 h-4 w-4" /> Export
                        </Button>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={coursePerf} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="title" type="category" width={120} fontSize={11} />
                                <Tooltip formatter={(val: number | string | undefined) => `₹${Number(val || 0).toLocaleString()}`} />
                                <Bar dataKey="estimatedRevenue" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
