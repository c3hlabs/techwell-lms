"use client"

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
    return (
        <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-purple-600 text-primary-foreground">
            <div className="container text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Ready to Launch Your Career?
                </h2>
                <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                    Join thousands of successful students today. Start with a free trial and unlock your potential.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register">
                        <Button size="lg" variant="secondary" className="text-lg px-8">
                            Start Your Free Trial
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button size="lg" variant="outline" className="text-lg px-8 border-white/30 text-white hover:bg-white/10">
                            Schedule a Demo
                        </Button>
                    </Link>
                </div>
                <p className="text-sm opacity-70 mt-6">
                    No credit card required • Cancel anytime
                </p>
            </div>
        </section>
    )
}
