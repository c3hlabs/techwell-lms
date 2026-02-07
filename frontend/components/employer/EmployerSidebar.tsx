"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Briefcase,
    Video,
    BarChart3,
    Settings,
    LogOut,
    PlusCircle,
    Building2,
    Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/employer/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Jobs",
        href: "/employer/jobs",
        icon: Briefcase,
    },
    {
        title: "Inteviews",
        href: "/employer/interviews",
        icon: Video,
    },
    {
        title: "Reports",
        href: "/employer/reports",
        icon: BarChart3,
    },
    {
        title: "Company Profile",
        href: "/employer/profile",
        icon: Building2,
    },
]

export function EmployerSidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()

    return (
        <div className="flex bg-muted/40 h-screen w-64 flex-col fixed left-0 top-0 border-r bg-background glass-sidebar">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 glass-header">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        TechWell
                    </span>
                    <span className="text-xs text-muted-foreground self-end mb-1">Employer</span>
                </Link>
            </div>
            <div className="flex-1 py-4">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                pathname === item.href || pathname.startsWith(item.href + '/')
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <div className="mb-4 px-2">
                    <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
                    <Link href="/employer/jobs/new">
                        <Button size="sm" className="w-full justify-start gap-2 shadow-md shadow-primary/20">
                            <PlusCircle className="h-4 w-4" />
                            Post New Job
                        </Button>
                    </Link>
                </div>
                <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
