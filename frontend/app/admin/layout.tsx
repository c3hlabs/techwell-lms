"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    // Hydration fix
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!isLoading && mounted) {
            if (!isAuthenticated || !['SUPER_ADMIN', 'ADMIN', 'INSTITUTE_ADMIN', 'STAFF'].includes(user?.role || '')) {
                router.push('/dashboard') // Redirect unauthorized
            }
        }
    }, [isLoading, isAuthenticated, user, router, mounted])

    if (isLoading || !mounted) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!isAuthenticated || !['SUPER_ADMIN', 'ADMIN', 'INSTITUTE_ADMIN', 'STAFF'].includes(user?.role || '')) {
        return null // Will redirect
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar className="w-64 flex-shrink-0 hidden md:block" />
            <div className="flex-1 md:ml-64 p-8 bg-muted/10 min-h-screen">
                {children}
            </div>
        </div>
    )
}
