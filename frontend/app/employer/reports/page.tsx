"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Printer, Download, Briefcase, Users, CheckCircle, XCircle, TrendingUp, BarChart3 } from "lucide-react"
import { Loader2 } from "lucide-react"

export default function EmployerReportsPage() {
    const router = useRouter()
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/reports/employer')
                setData(res.data)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchReports()
    }, [])

    const handlePrint = () => {
        window.print()
    }

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary/40" /></div>
    }

    if (!data) return <div className="p-20 text-center text-muted-foreground font-medium">No analytics data available at this moment.</div>

    const { summary, recentApplications } = data

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 print:p-0 print:space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                            Analytics & Insights
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm font-medium">Track your recruitment performance and candidate pipeline.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl border-muted/20 hover:bg-muted/50" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print Report
                    </Button>
                    <Button className="rounded-xl bg-primary shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all">
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block mb-8 border-b pb-4">
                <h1 className="text-2xl font-bold">TechWell Talent Acquisition Report</h1>
                <p className="text-sm text-gray-500">Analytics Summary • Generated on {new Date().toLocaleDateString()}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card border-none shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Open Roles</CardTitle>
                        <Briefcase className="h-4 w-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{summary.totalJobs}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] px-1.5 h-4">{summary.activeJobs} Active</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Applicants</CardTitle>
                        <Users className="h-4 w-4 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{summary.totalApplications}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                            <TrendingUp className="h-3 w-3" /> Growth: +12%
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Success Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">{summary.hiredCount}</div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                            {summary.totalApplications > 0 ? ((summary.hiredCount / summary.totalApplications) * 100).toFixed(1) : 0}% Selection Ratio
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none shadow-xl overflow-hidden group hover:scale-[1.02] transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Drop-off Rate</CardTitle>
                        <XCircle className="h-4 w-4 text-rose-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-rose-600">{summary.rejectedCount}</div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">Filtered Candidates</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card border-none shadow-2xl overflow-hidden print:border-0 print:shadow-none mb-12">
                <CardHeader className="bg-muted/30 border-b border-muted/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Recent Candidate Activity
                            </CardTitle>
                            <CardDescription>Visualizing the last 10 applications across your pipeline.</CardDescription>
                        </div>
                        <Badge variant="outline" className="border-primary/20 text-primary font-bold">{recentApplications.length} Entries</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow className="border-muted/10 hover:bg-transparent">
                                <TableHead className="font-bold text-xs uppercase tracking-widest py-4">Candidate</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-widest py-4">Applied Role</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-widest py-4">Applied Date</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-widest py-4 text-right">Current Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentApplications.length > 0 ? (
                                recentApplications.map((app: any) => (
                                    <TableRow key={app.id} className="border-muted/10 hover:bg-primary/5 transition-colors group">
                                        <TableCell className="py-4">
                                            <div className="font-bold text-sm">{app.applicant.name}</div>
                                            <div className="text-xs text-muted-foreground">{app.applicant.email}</div>
                                        </TableCell>
                                        <TableCell className="font-medium">{app.job.title}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm font-medium">{new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="secondary" className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border-none ${app.status === 'APPOINTED' ? 'bg-emerald-500/10 text-emerald-600' :
                                                    app.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600' :
                                                        'bg-primary/10 text-primary'
                                                }`}>
                                                {app.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-20 text-muted-foreground font-medium">No recent activity found to display.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .max-w-7xl, .max-w-7xl * {
                        visibility: visible;
                    }
                    .max-w-7xl {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
            <div className="h-20" />
        </div>
    )
}
