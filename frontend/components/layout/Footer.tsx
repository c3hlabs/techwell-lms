"use client"
import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Twitter, Linkedin, Youtube, Github } from 'lucide-react'

export function Footer() {
    const [year, setYear] = React.useState(2024)

    React.useEffect(() => {
        setYear(new Date().getFullYear())
    }, [])

    return (
        <footer className="bg-muted/50 border-t mt-auto">
            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/logo-light.png"
                                alt="TechWell"
                                width={120}
                                height={35}
                                className="dark:hidden"
                            />
                            <Image
                                src="/logo-dark.png"
                                alt="TechWell"
                                width={120}
                                height={35}
                                className="hidden dark:block"
                            />
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            AI-powered learning and interview preparation platform.
                            Launch your tech career with confidence.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Youtube className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Browse Courses
                                </Link>
                            </li>
                            <li>
                                <Link href="/interviews" className="text-muted-foreground hover:text-foreground transition-colors">
                                    AI Interview Prep
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/career-guide" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Career Guide
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Cookie Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/gdpr" className="text-muted-foreground hover:text-foreground transition-colors">
                                    GDPR Compliance
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                support@techwell.co.in
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                +91 7997473473
                            </li>
                            <li className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 mt-0.5" />
                                <span>
                                    TechWell HQ<br />
                                    India
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© {year} TechWell. All rights reserved.</p>
                    <div className="flex flex-wrap gap-4 md:gap-6">
                        <Link href="/about" className="hover:text-foreground transition-colors">
                            About
                        </Link>
                        <Link href="/contact" className="hover:text-foreground transition-colors">
                            Contact
                        </Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/privacy" className="hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/cookies" className="hover:text-foreground transition-colors">
                            Cookie Policy
                        </Link>
                        <Link href="/gdpr" className="hover:text-foreground transition-colors">
                            GDPR
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
