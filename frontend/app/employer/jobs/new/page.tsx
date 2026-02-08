"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, Sparkles, Building2, Briefcase } from "lucide-react"

export default function PostJobPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        type: 'FULL_TIME',
        location: 'Remote',
        salary: '',
        experience: '0-2 Years',
        skills: '',
        description: '',
        requirements: '',
        clientName: '',
        shift: 'Day',
        category: 'Development'
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await api.post('/jobs', formData)
            router.push('/employer/jobs')
        } catch {
            // Error handling
            alert('Failed to post job')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                            Post a New Job
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm font-medium">Find the perfect candidate for your team.</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Enhanced Listings</span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="glass-card border-none shadow-2xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-muted/20">
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            Job Specifications
                        </CardTitle>
                        <CardDescription>Provide detailed information to attract the right applicants.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Job Title <span className="text-primary">*</span></Label>
                                <Input
                                    className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"
                                    placeholder="e.g. Senior Frontend Engineer"
                                    required
                                    value={formData.title}
                                    onChange={e => handleChange('title', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Hiring For (Client Name)</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-10 bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"
                                        placeholder="Internal / External Client"
                                        value={formData.clientName}
                                        onChange={e => handleChange('clientName', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Employment Type</Label>
                                <Select value={formData.type} onValueChange={v => handleChange('type', v)}>
                                    <SelectTrigger className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-none shadow-xl">
                                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                                        <SelectItem value="CONTRACT">Contract</SelectItem>
                                        <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                        <SelectItem value="FREELANCE">Freelance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Category</Label>
                                <Select value={formData.category} onValueChange={v => handleChange('category', v)}>
                                    <SelectTrigger className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-none shadow-xl">
                                        <SelectItem value="Development">Development</SelectItem>
                                        <SelectItem value="Design">Design</SelectItem>
                                        <SelectItem value="Marketing">Marketing</SelectItem>
                                        <SelectItem value="Sales">Sales</SelectItem>
                                        <SelectItem value="Management">Management</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Experience Level</Label>
                                <Select value={formData.experience} onValueChange={v => handleChange('experience', v)}>
                                    <SelectTrigger className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium">
                                        <SelectValue placeholder="Select Experience" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-none shadow-xl">
                                        <SelectItem value="Fresher">Fresher</SelectItem>
                                        <SelectItem value="0-2 Years">0-2 Years</SelectItem>
                                        <SelectItem value="2-5 Years">2-5 Years</SelectItem>
                                        <SelectItem value="5-8 Years">5-8 Years</SelectItem>
                                        <SelectItem value="8+ Years">8+ Years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Budget / Salary</Label>
                                <Input
                                    className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"
                                    placeholder="e.g. ₹15 - 20 LPA"
                                    value={formData.salary}
                                    onChange={e => handleChange('salary', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Work Location</Label>
                                <Input
                                    className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"
                                    placeholder="e.g. Remote / Pune"
                                    value={formData.location}
                                    onChange={e => handleChange('location', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Shift Type</Label>
                                <Select value={formData.shift} onValueChange={v => handleChange('shift', v)}>
                                    <SelectTrigger className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium">
                                        <SelectValue placeholder="Select shift" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-card border-none shadow-xl">
                                        <SelectItem value="Day">Day Shift</SelectItem>
                                        <SelectItem value="Night">Night Shift</SelectItem>
                                        <SelectItem value="Rotational">Rotational</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Required Technologies & Skills</Label>
                            <Input
                                className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20 font-medium"
                                placeholder="e.g. Next.js, Go, Kubernetes, System Design"
                                value={formData.skills}
                                onChange={e => handleChange('skills', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Role Description</Label>
                            <Textarea
                                className="min-h-[160px] bg-muted/20 border-none rounded-2xl p-4 focus:ring-primary/20 resize-none font-medium text-sm"
                                placeholder="Describe the core mission and day-to-day impact of this role..."
                                value={formData.description}
                                onChange={e => handleChange('description', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Specific Requirements</Label>
                            <Textarea
                                className="min-h-[120px] bg-muted/20 border-none rounded-2xl p-4 focus:ring-primary/20 resize-none font-medium text-sm"
                                placeholder="- Minimum 3 years of experience in X&#10;- Solid understanding of Y..."
                                value={formData.requirements}
                                onChange={e => handleChange('requirements', e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center bg-muted/30 border-t border-muted/20 p-8">
                        <Button type="button" variant="ghost" className="rounded-xl font-bold uppercase tracking-wider text-xs" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="h-12 px-10 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Launch Job Listing
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
            <div className="h-20" /> {/* Extra space at bottom */}
        </div>
    )
}
