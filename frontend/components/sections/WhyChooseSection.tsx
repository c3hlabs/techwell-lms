"use client"

import { Brain, Award, Trophy, BarChart3, Repeat, GraduationCap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
    {
        icon: Brain,
        title: 'AI-Powered Personalization',
        description: 'Adaptive learning that evolves with you and tailors content to your pace.',
    },
    {
        icon: Award,
        title: 'Industry-Expert Content',
        description: 'Courses designed by Fortune 500 professionals with real-world experience.',
    },
    {
        icon: Trophy,
        title: '95% Placement Success',
        description: 'Our students land jobs in top companies like Google, Amazon, and Microsoft.',
    },
    {
        icon: BarChart3,
        title: 'Real-Time Feedback',
        description: 'Instant AI evaluation with actionable improvement tips after each session.',
    },
    {
        icon: Repeat,
        title: 'Unlimited Practice',
        description: 'Take as many AI mock interviews as you need to build confidence.',
    },
    {
        icon: GraduationCap,
        title: 'Certificate Programs',
        description: 'Industry-recognized credentials to boost your resume and credibility.',
    },
]

export function WhyChooseSection() {
    return (
        <section className="py-24 relative overflow-hidden bg-background">
            {/* Background Decor - Adjusted for both themes */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container relative z-10">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">TechWell?</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        We don't just teach technology; we build your entire career ecosystem.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[auto]">
                    {/* Large Feature 1: AI Personalization */}
                    <div className="md:col-span-2 relative group overflow-hidden rounded-3xl border border-border bg-card/40 backdrop-blur-md shadow-sm transition-all hover:scale-[1.01] hover:shadow-xl hover:border-primary/50 dark:bg-white/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="p-8 h-full flex flex-col justify-between relative z-10">
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Brain className="w-8 h-8 text-primary" />
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    AI-Driven
                                </span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-3">AI-Powered Personalization</h3>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    Our adaptive AI analyzes your learning style in real-time, tailoring every lesson and quiz to your optimal pace. Stop wasting time on what you already know.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Standard Feature 2: Industry Experts */}
                    <div className="relative group overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-sm shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-purple-500/50">
                        <div className="p-8 h-full flex flex-col justify-between">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-500">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Fortune 500 Mentors</h3>
                                <p className="text-muted-foreground">Learn directly from seniors at Google, Microsoft, and Amazon.</p>
                            </div>
                        </div>
                    </div>

                    {/* Standard Feature 3: Real-Time Feedback */}
                    <div className="relative group overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-sm shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-blue-500/50">
                        <div className="p-8 h-full flex flex-col justify-between">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Instant AI Feedback</h3>
                                <p className="text-muted-foreground">Get actionable code reviews and speech analysis instantly.</p>
                            </div>
                        </div>
                    </div>

                    {/* Large Feature 4: Placement Success (Spans 2 columns) */}
                    <div className="md:col-span-2 md:col-start-2 relative group overflow-hidden rounded-3xl border border-border bg-card/40 backdrop-blur-md shadow-sm transition-all hover:scale-[1.01] hover:shadow-xl hover:border-green-500/50 dark:bg-white/5">
                        <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="p-8 h-full flex flex-col justify-between relative z-10">
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                    <Trophy className="w-8 h-8 text-green-500" />
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                    Placement
                                </span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-3">95% Placement Success Rate</h3>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    Our dedicated placement cell works 24/7 to connect you with 500+ hiring partners. We basically hand-hold you until you sign that offer letter.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Standard Feature 5: Certification - Moved to left */}
                    <div className="md:col-start-1 md:row-start-2 relative group overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-sm shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-orange-500/50">
                        <div className="p-8 h-full flex flex-col justify-between">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 text-orange-500">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Global Certification</h3>
                                <p className="text-muted-foreground">Resume-boosting credentials recognized worldwide.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
