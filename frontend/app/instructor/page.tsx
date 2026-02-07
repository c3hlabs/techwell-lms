"use client"

import * as React from 'react'
import {
    Users,
    BookOpen,
    Star,
    TrendingUp,
    Play,
    Clock,
    CheckCircle2,
    Calendar,
    ArrowUpRight,
    Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <TrendingUp className="h-3 w-3" />
                    {trend}
                </div>
            </div>
            <div className="mt-4">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
            </div>
        </CardContent>
    </Card>
)

export default function InstructorDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="Total Students"
                    value="1,280"
                    trend="+12%"
                    color="bg-blue-600"
                />
                <StatCard
                    icon={BookOpen}
                    label="Active Courses"
                    value="15"
                    trend="+2"
                    color="bg-purple-600"
                />
                <StatCard
                    icon={Star}
                    label="Avg Rating"
                    value="4.9"
                    trend="+0.2"
                    color="bg-amber-500"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Completion Rate"
                    value="94%"
                    trend="+5%"
                    color="bg-emerald-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Courses */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-800">Recent Courses</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-widest mt-1">Manage your active learning modules</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5">View All</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                                    <div className="h-24 w-40 rounded-xl bg-slate-200 overflow-hidden relative shadow-sm border border-slate-200">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" className="rounded-full bg-white text-primary hover:bg-white hover:scale-110 shadow-xl transition-all">
                                                <Play className="h-5 w-5 fill-current" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase border border-blue-100 tracking-tighter">Development</span>
                                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Masterclass</span>
                                        </div>
                                        <h4 className="font-black text-lg text-slate-800 leading-tight">Advanced Advanced Multi-Biz Architecture with Next.js 14</h4>
                                        <div className="flex items-center gap-6 mt-2">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                                <Users className="h-3.5 w-3.5" />
                                                428 Students
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                                <Clock className="h-3.5 w-3.5" />
                                                12.5 Hours
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col items-center justify-between gap-4">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-800">$199.00</p>
                                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">84 Sales today</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="rounded-xl font-bold bg-white shadow-sm h-10 px-6">Manage</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Students Activity */}
                <div className="space-y-8">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-black text-slate-800">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 pt-0 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-600">
                                    <span>Course Completion</span>
                                    <span className="text-primary tracking-tighter">84%</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                    <div className="h-full bg-primary w-[84%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-600">
                                    <span>Student Engagement</span>
                                    <span className="text-purple-600 tracking-tighter">62%</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                    <div className="h-full bg-purple-600 w-[62%] rounded-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <TrendingUp className="h-32 w-32" />
                        </div>
                        <CardContent className="p-8 relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/10">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-black mb-2 leading-tight">You have 4 live classes today!</h3>
                            <p className="text-white/60 text-sm font-medium mb-6">Starting in 45 minutes. Be ready to share your expertise.</p>
                            <Button className="w-full bg-white text-slate-900 font-black hover:bg-slate-100 rounded-2xl h-12 shadow-xl shadow-black/20">
                                Join Now
                                <ArrowUpRight className="h-4 w-4 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
