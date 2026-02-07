"use client"

import { EmployerSidebar } from "@/components/employer/EmployerSidebar"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function EmployerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/login")
            } else if (user?.role !== "EMPLOYER") {
                router.push("/dashboard") // Redirect non-employers
            }
        }
    }, [isLoading, isAuthenticated, user, router])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthenticated || user?.role !== "EMPLOYER") {
        return null
    }

    return (
        <div className="min-h-screen bg-muted/40">
            <EmployerSidebar />
            <div className="pl-64">
                {/* Header could go here if separate from Sidebar */}
                <main className="min-h-[calc(100vh)] py-6 px-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
