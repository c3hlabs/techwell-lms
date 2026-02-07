"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileDown, Loader2 } from "lucide-react"

export function AdminReportModal({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)
    const [reportType, setReportType] = useState("FINANCIAL")
    const [format, setFormat] = useState("PDF")
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    })

    const handleDownload = async () => {
        setIsLoading(true)
        // Mock download delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // In real app: call API to generate report and trigger download
        alert(`Generating ${reportType} report in ${format} format... (This is a simulation)`)

        setIsLoading(false)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generate Report</DialogTitle>
                    <DialogDescription>
                        Select the type of report and date range you want to export.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Report Type</Label>
                        <Select value={reportType} onValueChange={setReportType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FINANCIAL">Financial Summary</SelectItem>
                                <SelectItem value="USER_ACTIVITY">User Activity Log</SelectItem>
                                <SelectItem value="COURSE_PERFORMANCE">Course Performance</SelectItem>
                                <SelectItem value="INTERVIEW_STATS">Interview Statistics</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>From</Label>
                            <Input
                                type="date"
                                value={dateRange.start}
                                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>To</Label>
                            <Input
                                type="date"
                                value={dateRange.end}
                                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Format</Label>
                        <Select value={format} onValueChange={setFormat}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PDF">PDF Document</SelectItem>
                                <SelectItem value="CSV">CSV Spreadsheet</SelectItem>
                                <SelectItem value="EXCEL">Excel Worksheet</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleDownload} disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FileDown className="mr-2 h-4 w-4" />
                                Download Report
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
