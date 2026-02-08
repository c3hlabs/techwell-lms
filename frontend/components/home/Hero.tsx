"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { GraduationCap, Video, Building2, Handshake, ArrowRight, PlayCircle, School, MessageCircle, Send, Phone, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0)

    const slides = [
        {
            id: 1,
            title: "AI Interview Mastery",
            subtitle: "Practice with realistic AI Avatars",
            image: "/images/hero/ai_avatar_hr.png",
            color: "from-purple-600 to-blue-600"
        },
        {
            id: 2,
            title: "Business Suite Pro",
            subtitle: "Complete CRM & HRMS Solutions",
            image: "/images/hero/business_suite.png",
            color: "from-amber-500 to-orange-600"
        },
        {
            id: 3,
            title: "Career Acceleration",
            subtitle: "From Campus to Corporate Success",
            image: "/images/hero/placement_growth.png",
            color: "from-green-500 to-emerald-600"
        }
    ]

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [slides.length])

    interface HeroBox {
        title: string
        description: string
        icon: React.ElementType
        href: string
        gradient: string
        border: string
        iconColor: string
        cta: string
        highlight?: boolean
        external?: boolean
    }

    const boxes: HeroBox[] = [
        {
            title: "Smart Learning",
            description: "Adaptive AI courses Personalized for you.",
            icon: GraduationCap,
            href: "/courses",
            gradient: "from-blue-500/20 to-cyan-500/20",
            border: "group-hover:border-blue-500/50",
            iconColor: "text-blue-500",
            cta: "Start Learning"
        },
        {
            title: "AI Interview Prep",
            description: "Master interviews with real-time AI feedback.",
            icon: Video,
            href: "/interviews",
            gradient: "from-purple-500/20 to-pink-500/20",
            border: "group-hover:border-purple-500/50",
            iconColor: "text-purple-500",
            cta: "Practice Now",
            highlight: true
        },
        {
            title: "Campus to Corporate",
            description: "Your bridge to a dream career.",
            icon: School,
            href: "https://campustest.techwell.co.in",
            gradient: "from-green-500/20 to-emerald-500/20",
            border: "group-hover:border-green-500/50",
            iconColor: "text-green-500",
            cta: "Launch Career",
            external: true
        },
        {
            title: "Business Suite",
            description: "Powerful CRM & HRMS tools for growth.",
            icon: Building2,
            href: "https://products.techwell.co.in",
            gradient: "from-amber-500/20 to-orange-500/20",
            border: "group-hover:border-amber-500/50",
            iconColor: "text-amber-500",
            cta: "Explore Tools",
            external: true
        },
        {
            title: "Career Services",
            description: "Expert counseling & placement support.",
            icon: Handshake,
            href: "/careers",
            gradient: "from-teal-500/20 to-cyan-500/20",
            border: "group-hover:border-teal-500/50",
            iconColor: "text-teal-500",
            cta: "Get Hired"
        }
    ]

    return (
        <div className="relative overflow-hidden bg-background min-h-screen flex flex-col justify-start pt-12">
            {/* Rich Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mb-16">

                    {/* Left Column: Hero Text */}
                    <div className="flex-1 text-center lg:text-left z-20 flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Badge Removed as per request */}

                                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
                                    Launch Your <br />
                                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${slides[currentSlide].color} animate-gradient`}>
                                        {currentSlide === 0 && "Tech Career"}
                                        {currentSlide === 1 && "Business Growth"}
                                        {currentSlide === 2 && "Dream Job"}
                                    </span>
                                    <br /> with {currentSlide === 0 ? "AI Mastery" : currentSlide === 1 ? "Smart Tools" : "Top Placements"}
                                </h1>

                                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                                    {currentSlide === 0 && "Join 15,000+ students landing dream jobs. Master skills, ace interviews with AI avatars."}
                                    {currentSlide === 1 && "Empower your organization with our all-in-one CRM and HRMS business suite."}
                                    {currentSlide === 2 && "Bridge the gap between campus and corporate with our guaranteed placement support."}
                                </p>

                                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5 mb-14">
                                    <Link href="/register" passHref>
                                        <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-lg rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all bg-gradient-to-r from-primary to-purple-600 border-none">
                                            Start Free Trial
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-10 text-lg rounded-full gap-3 glass hover:bg-white/10 border-white/20 backdrop-blur-md hover:scale-105 transition-all">
                                                <PlayCircle className="w-6 h-6 text-primary" />
                                                Watch Demo
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[900px] p-0 bg-black border-none overflow-hidden rounded-2xl">
                                            <DialogTitle className="sr-only">Product Demo Video</DialogTitle>
                                            <DialogDescription className="sr-only">Watch a demonstration of our platform features.</DialogDescription>
                                            <div className="aspect-video w-full bg-black flex items-center justify-center relative">
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src="https://www.youtube.com/embed/SNB1_f_c6fQ?autoplay=1"
                                                    title="TechWell Platform Demo"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    allowFullScreen
                                                    className="w-full h-full"
                                                />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="flex items-center justify-center lg:justify-start gap-10 opacity-90">
                                    <div className="text-left">
                                        <div className="text-4xl font-bold text-foreground mb-1">95%</div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Placement Rate</div>
                                    </div>
                                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent"></div>
                                    <div className="text-left">
                                        <div className="text-4xl font-bold text-foreground mb-1">500+</div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Hiring Partners</div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Dynamic Hero Carousel */}
                    <div className="hidden lg:flex flex-1 justify-center relative w-full max-w-[750px]">
                        <div className="relative w-full aspect-[4/3]">
                            {/* Abstract Decorative Elements behind carousel */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/30 rounded-full blur-[40px] animate-pulse" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/30 rounded-full blur-[40px] animate-pulse delay-700" />

                            <div className="relative w-full h-full rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl ring-1 ring-white/20">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.7 }}
                                        className="absolute inset-0"
                                    >
                                        <Image
                                            src={slides[currentSlide].image}
                                            alt={slides[currentSlide].title}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 bg-gradient-to-r ${slides[currentSlide].color}`}>
                                                    FEATURED
                                                </div>
                                                <h3 className="text-3xl font-bold mb-2">{slides[currentSlide].title}</h3>
                                                <p className="text-white/80 text-lg">{slides[currentSlide].subtitle}</p>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Carousel Indicators */}
                                <div className="absolute bottom-4 right-6 flex gap-2 z-10">
                                    {slides.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSlide(idx)}
                                            aria-label={`Go to slide ${idx + 1}`}
                                            className={cn(
                                                "w-2 h-2 rounded-full transition-all duration-300",
                                                currentSlide === idx ? "w-8 bg-white" : "bg-white/40 hover:bg-white/60"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -bottom-8 -left-8 glass p-4 rounded-xl shadow-2xl border border-white/20 z-20 max-w-[200px]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-full shadow-inner"><CheckCircle2 className="text-green-600 h-6 w-6" /></div>
                                    <div>
                                        <div className="text-xs text-muted-foreground font-medium">Recently Placed</div>
                                        <div className="font-bold text-sm text-foreground">Rohan S. @ Google</div>
                                        <div className="text-[10px] text-green-600 font-bold">₹45 LPA Package</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Premium Feature Boxes - Redesigned */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-center mb-10 text-muted-foreground/60 tracking-widest uppercase">Explore Our Ecosystem</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {boxes.map((box, index) => {
                            const CardWrapper = ({ children }: { children: React.ReactNode }) =>
                                box.external ? (
                                    <a href={box.href} target="_blank" rel="noopener noreferrer" className="block h-full perspective-1000">
                                        {children}
                                    </a>
                                ) : (
                                    <Link href={box.href} className="block h-full perspective-1000">
                                        {children}
                                    </Link>
                                )

                            return (
                                <CardWrapper key={index}>
                                    <motion.div
                                        whileHover={{
                                            y: -10,
                                            rotateX: 5,
                                            scale: 1.02,
                                            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)"
                                        }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className={cn(
                                            "relative h-full min-h-[280px] rounded-2xl p-6 flex flex-col overflow-hidden glass border border-white/10 transition-all duration-300 group",
                                            box.border
                                        )}
                                    >
                                        {/* Hover Gradient Background */}
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                                            box.gradient
                                        )} />

                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg bg-background/50 backdrop-blur-sm ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300",
                                            box.iconColor
                                        )}>
                                            <box.icon className="w-7 h-7" />
                                        </div>

                                        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{box.title}</h3>

                                        <p className="text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed flex-grow">
                                            {box.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto">
                                            <span className={cn("text-sm font-bold tracking-wide", box.iconColor)}>{box.cta}</span>
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-white/20 transition-colors",
                                                box.iconColor
                                            )}>
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </CardWrapper>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Social Dock */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-5 hidden sm:flex">
                {[
                    { icon: MessageCircle, href: "https://wa.me/911234567890", bg: "bg-[#25D366]", title: "WhatsApp" },
                    { icon: Send, href: "https://t.me/techwell", bg: "bg-[#0088cc]", title: "Telegram" },
                    { icon: Phone, href: "tel:+919876543210", bg: "bg-primary", title: "Call Us" }
                ].map((item, i) => (
                    <a
                        key={i}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "w-12 h-12 rounded-full glass text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-primary/50 relative group",
                            item.bg
                        )}
                        title={item.title}
                    >
                        <item.icon className="h-5 w-5 fill-current" />
                        <span className="absolute right-14 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {item.title}
                        </span>
                    </a>
                ))}
            </div>
        </div>
    )
}
