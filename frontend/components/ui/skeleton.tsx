import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    )
}

// Card skeleton for course/interview listings
function CardSkeleton() {
    return (
        <div className="rounded-lg border bg-card">
            <Skeleton className="h-40 rounded-t-lg rounded-b-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
        </div>
    )
}

// Table row skeleton for admin tables
function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-20" />
        </div>
    )
}

// Stats card skeleton
function StatsSkeleton() {
    return (
        <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20 mt-2" />
        </div>
    )
}

// Page loading skeleton
function PageSkeleton() {
    return (
        <div className="container py-8 space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1 max-w-md" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

export { Skeleton, CardSkeleton, TableRowSkeleton, StatsSkeleton, PageSkeleton }
