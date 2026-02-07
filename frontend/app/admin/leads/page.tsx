"use client"

import * as React from 'react'
import EmailComposer from '@/components/admin/EmailComposer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import {
    Download,
    Loader2,
    Plus,
    Search,
    Filter,
    Upload,
    FileSpreadsheet,
    Trash2,
    User,
    MapPin,
    Calendar,
    School
} from 'lucide-react'
import { exportToCSV } from '@/lib/export-utils'
import api from '@/lib/api'
import { format } from 'date-fns'

export default function LeadsPage() {
    const [leads, setLeads] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState('')

    // Filters
    const [statusFilter, setStatusFilter] = React.useState('ALL')
    const [sourceFilter, setSourceFilter] = React.useState('ALL')

    // Dialogs
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [isImportOpen, setIsImportOpen] = React.useState(false)
    const [importFile, setImportFile] = React.useState<File | null>(null)
    const [isUploading, setIsUploading] = React.useState(false)

    // Email Dialog
    const [emailLead, setEmailLead] = React.useState<any>(null)

    // Form Data
    const [newLead, setNewLead] = React.useState({
        name: '',
        email: '',
        phone: '',
        source: 'Website',
        status: 'NEW',
        college: '',
        location: '',
        qualification: '',
        dob: '',
        notes: ''
    })

    React.useEffect(() => {
        fetchLeads()
    }, [statusFilter, sourceFilter])

    const fetchLeads = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (statusFilter !== 'ALL') params.append('status', statusFilter)
            if (sourceFilter !== 'ALL') params.append('source', sourceFilter)

            const res = await api.get(`/leads?${params.toString()}`)
            setLeads(res.data || [])
        } catch (error) {
            console.error(error)
            // Fallback mock data if API fails (during dev)
            setLeads([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddLead = async () => {
        try {
            await api.post('/leads', newLead)
            setIsAddOpen(false)
            fetchLeads()
            setNewLead({
                name: '', email: '', phone: '', source: 'Website', status: 'NEW',
                college: '', location: '', qualification: '', dob: '', notes: ''
            })
        } catch (error) {
            alert('Failed to add lead')
        }
    }

    const handleImportCSV = async () => {
        if (!importFile) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', importFile)

        try {
            await api.post('/leads/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setIsImportOpen(false)
            fetchLeads()
            alert('Leads imported successfully')
        } catch (error) {
            alert('Failed to import leads')
        } finally {
            setIsUploading(false)
            setImportFile(null)
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            // Optimistic update
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
            await api.put(`/leads/${id}`, { status: newStatus })
        } catch (error) {
            fetchLeads() // Revert on error
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        try {
            await api.delete(`/leads/${id}`)
            setLeads(prev => prev.filter(l => l.id !== id))
        } catch (error) {
            alert('Failed to delete lead')
        }
    }

    const handleExportCSV = () => {
        exportToCSV(leads, {
            filename: `leads_export_${new Date().toISOString().split('T')[0]}`,
            headers: ['name', 'email', 'phone', 'source', 'status', 'college', 'location', 'qualification']
        })
    }

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone?.includes(searchQuery) ||
        lead.college?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            case 'CONTACTED': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            case 'INTERESTED': return 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            case 'QUALIFIED': return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            case 'CONVERTED': return 'bg-green-100 text-green-700 hover:bg-green-200'
            case 'LOST': return 'bg-red-100 text-red-700 hover:bg-red-200'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
                    <p className="text-muted-foreground">Track enquiries, manage status, and analyze sources.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Import CSV
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Import Leads from CSV</DialogTitle>
                                <DialogDescription>
                                    Upload a CSV file with headers: Name, Email, Phone, Source, College, Location
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                />
                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                    <p className="font-semibold mb-1">Sample CSV Format:</p>
                                    <code>Name,Email,Phone,Source,College,Location</code><br />
                                    <code>John Doe,john@test.com,9876543210,Website,IIT Delhi,Delhi</code>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleImportCSV} disabled={!importFile || isUploading}>
                                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                    Upload & Import
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Lead
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add New Lead</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input value={newLead.email} onChange={e => setNewLead({ ...newLead, email: e.target.value })} placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} placeholder="+91 9876543210" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Source</label>
                                    <Select value={newLead.source} onValueChange={v => setNewLead({ ...newLead, source: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Website">Website</SelectItem>
                                            <SelectItem value="Referral">Referral</SelectItem>
                                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                            <SelectItem value="Google Ads">Google Ads</SelectItem>
                                            <SelectItem value="Walk-in">Walk-in</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">College/University</label>
                                    <Input value={newLead.college} onChange={e => setNewLead({ ...newLead, college: e.target.value })} placeholder="XYZ University" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Qualification</label>
                                    <Input value={newLead.qualification} onChange={e => setNewLead({ ...newLead, qualification: e.target.value })} placeholder="B.Tech CS" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input value={newLead.location} onChange={e => setNewLead({ ...newLead, location: e.target.value })} placeholder="City, State" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date of Birth</label>
                                    <Input type="date" value={newLead.dob} onChange={e => setNewLead({ ...newLead, dob: e.target.value })} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Notes</label>
                                    <Input value={newLead.notes} onChange={e => setNewLead({ ...newLead, notes: e.target.value })} placeholder="Additional details..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddLead}>Save Lead</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <CardTitle>All Leads</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search leads..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="NEW">New</SelectItem>
                                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                                    <SelectItem value="INTERESTED">Interested</SelectItem>
                                    <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                    <SelectItem value="CONVERTED">Converted</SelectItem>
                                    <SelectItem value="LOST">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sourceFilter} onValueChange={setSourceFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Sources</SelectItem>
                                    <SelectItem value="Website">Website</SelectItem>
                                    <SelectItem value="Referral">Referral</SelectItem>
                                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            No leads found matching your criteria.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Demographics</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Added On</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeads.map((lead) => (
                                        <TableRow key={lead.id}>
                                            <TableCell>
                                                <div className="font-medium">{lead.name}</div>
                                                <div className="text-xs text-muted-foreground">{lead.email}</div>
                                                <div className="text-xs text-muted-foreground">{lead.phone}</div>
                                            </TableCell>
                                            <TableCell>
                                                {lead.college && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                                        <School className="h-3 w-3" /> {lead.college}
                                                    </div>
                                                )}
                                                {lead.location && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <MapPin className="h-3 w-3" /> {lead.location}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{lead.source}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={lead.status}
                                                    onValueChange={(val) => handleStatusChange(lead.id, val)}
                                                >
                                                    <SelectTrigger className={`h-8 w-[130px] border-none ${getStatusColor(lead.status)}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="NEW">New</SelectItem>
                                                        <SelectItem value="CONTACTED">Contacted</SelectItem>
                                                        <SelectItem value="INTERESTED">Interested</SelectItem>
                                                        <SelectItem value="QUALIFIED">Qualified</SelectItem>
                                                        <SelectItem value="CONVERTED">Converted</SelectItem>
                                                        <SelectItem value="LOST">Lost</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {format(new Date(lead.createdAt), 'dd MMM yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 mr-1"
                                                    onClick={() => setEmailLead(lead)}
                                                >
                                                    <Mail className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(lead.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <EmailComposer
                lead={emailLead}
                isOpen={!!emailLead}
                onClose={() => setEmailLead(null)}
            />
        </div>
    )
}
