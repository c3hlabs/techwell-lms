"use client"

import { useState, useEffect } from "react"
import { userApi, employerApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Save, Upload, Building2, Globe, MapPin, Briefcase } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function EmployerProfilePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Employer Profile Data
    const [profile, setProfile] = useState({
        companyName: '',
        website: '',
        description: '',
        location: '',
        industry: '',
        size: '',
        logo: ''
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [userRes, profileRes] = await Promise.all([
                    userApi.getMe(),
                    employerApi.getProfile().catch(() => ({ data: null }))
                ])

                // userRes.data is used only for loading check in original, 
                // but we can just use the resolution of the promise.
                if (userRes.data && profileRes.data) {
                    setProfile({
                        companyName: profileRes.data.companyName || '',
                        website: profileRes.data.website || '',
                        description: profileRes.data.description || '',
                        location: profileRes.data.location || '',
                        industry: profileRes.data.industry || '',
                        size: profileRes.data.companySize || '',
                        logo: profileRes.data.logo || ''
                    })
                }
            } catch {
                // Error handling
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleChange = (field: string, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await employerApi.updateProfile({
                ...profile,
                companySize: profile.size // Ensure field name matches backend expectation
            })
            alert('Profile updated successfully!')
        } catch {
            alert('Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                        Company Profile
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your company branding and public-facing details.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8">
                <Card className="glass-card border-none shadow-2xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-muted/20">
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Basic Information
                        </CardTitle>
                        <CardDescription>This information will be displayed on your job listings to candidates.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company Logo</Label>
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/40 group-hover:bg-primary/10">
                                        {profile.logo ? (
                                            <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="h-10 w-10 text-primary/40" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <Button type="button" variant="link" size="sm" className="w-full text-xs mt-2">
                                        Change Logo
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Company Name</Label>
                                        <Input
                                            className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20"
                                            value={profile.companyName}
                                            onChange={e => handleChange('companyName', e.target.value)}
                                            placeholder="Acme Tech Solutions"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Website URL</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-10 bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20"
                                                value={profile.website}
                                                onChange={e => handleChange('website', e.target.value)}
                                                placeholder="https://acme.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Industry</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-10 bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20"
                                                value={profile.industry}
                                                onChange={e => handleChange('industry', e.target.value)}
                                                placeholder="e.g. Software Development"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Company Size</Label>
                                        <Select value={profile.size} onValueChange={v => handleChange('size', v)}>
                                            <SelectTrigger className="bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20">
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent className="glass-card border-none shadow-xl">
                                                <SelectItem value="1-10">1-10 Employees</SelectItem>
                                                <SelectItem value="11-50">11-50 Employees</SelectItem>
                                                <SelectItem value="51-200">51-200 Employees</SelectItem>
                                                <SelectItem value="201-1000">201-1000 Employees</SelectItem>
                                                <SelectItem value="1000+">1000+ Employees</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-muted/10">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Office Location (HQ)</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-10 bg-muted/20 border-none rounded-xl h-11 focus:ring-primary/20"
                                        value={profile.location}
                                        onChange={e => handleChange('location', e.target.value)}
                                        placeholder="e.g. Banglore, India"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Company Overview</Label>
                                <Textarea
                                    className="min-h-[160px] bg-muted/20 border-none rounded-2xl p-4 focus:ring-primary/20 resize-none font-medium text-sm"
                                    value={profile.description}
                                    onChange={e => handleChange('description', e.target.value)}
                                    placeholder="Tell us about your company culture, mission, and long-term vision..."
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4 pb-12">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="h-12 px-10 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Profile Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
