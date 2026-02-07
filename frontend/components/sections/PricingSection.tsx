"use client"

import Link from 'next/link'
import { Check, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function PricingSection() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that fits your learning goals
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Student Plan */}
                    <Card className="relative">
                        <CardHeader className="text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Student Plan</CardTitle>
                            <CardDescription>Perfect for individual learners</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="mb-6">
                                <span className="text-4xl font-bold">₹0</span>
                                <span className="text-muted-foreground"> - Free</span>
                            </div>
                            <div className="mb-4 text-center">
                                <span className="text-2xl font-bold">₹499</span>
                                <span className="text-muted-foreground">/month - Pro</span>
                            </div>
                            <ul className="space-y-3 text-left">
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>2 AI mock interviews (Free) / Unlimited (Pro)</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Access to course library</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>STAR method evaluation</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Detailed feedback reports</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/register" className="w-full">
                                <Button className="w-full" variant="outline">Start Free</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Institution Plan */}
                    <Card className="relative border-primary shadow-lg">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                            For Teams
                        </div>
                        <CardHeader className="text-center">
                            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                                <Crown className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <CardTitle className="text-xl">Institution Plan</CardTitle>
                            <CardDescription>For universities & training centers</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="mb-6">
                                <span className="text-4xl font-bold">Custom</span>
                                <span className="text-muted-foreground"> pricing</span>
                            </div>
                            <ul className="space-y-3 text-left">
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Unlimited student accounts</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Custom branding options</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Analytics & reporting dashboard</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Dedicated account manager</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>API access for LMS integration</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <Link href="/contact" className="w-full">
                                <Button className="w-full">Request Demo</Button>
                            </Link>
                            <Link href="/contact" className="w-full">
                                <Button className="w-full" variant="ghost" size="sm">Talk to Sales</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>

                <div className="text-center mt-8">
                    <Link href="/pricing" className="text-sm text-primary hover:underline">
                        View detailed pricing comparison →
                    </Link>
                </div>
            </div>
        </section>
    )
}
