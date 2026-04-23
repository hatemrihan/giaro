'use client';

import { useState, useEffect } from 'react';
import { Download, MoreHorizontal, CheckCircle, XCircle, Clock, Package, Search, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// ── Types ─────────────────────────────────────────────────────

interface ReturnRequest {
    _id: string;
    id?: string;
    email: string;
    orderNumber: string;
    order_number?: string;
    status: 'pending' | 'approved' | 'rejected' | 'processed';
    createdAt: string;
    created_at?: string;
    updatedAt: string;
}

const statusStyle: Record<string, string> = {
    pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    approved: 'bg-green-500/15 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
    processed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
};

// ── Page ──────────────────────────────────────────────────────

export default function AdminReturnsPage() {
    const [requests, setRequests] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState<Set<string>>(new Set());
    const [approvingReturns, setApprovingReturns] = useState<Set<string>>(new Set());

    const filteredRequests = requests.filter(req => {
        const q = globalFilter.toLowerCase();
        return (req.email?.toLowerCase().includes(q) ||
            (req.orderNumber || req.order_number || '').toLowerCase().includes(q) ||
            req.status.toLowerCase().includes(q));
    });

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/dashboard');
            const data = await res.json();
            if (data.success) setRequests(data.data?.returns || []);
        } catch {
            toast.error('Failed to load returns');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const exportAsCSV = () => {
        const rows = rowSelection.size > 0 ? filteredRequests.filter(r => rowSelection.has(r._id || r.id || '')) : filteredRequests;
        const csvData = [
            ['Order Number', 'Email', 'Status', 'Date Submitted'],
            ...rows.map(r => [r.orderNumber || r.order_number || '', r.email, r.status, new Date(r.createdAt || r.created_at || '').toLocaleDateString()])
        ];
        const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `returns_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV downloaded');
    };

    const updateReturn = async (returnId: string, status: string) => {
        setApprovingReturns(prev => new Set(prev).add(returnId));
        const toastId = toast.loading('Updating…');
        try {
            const res = await fetch('/api/return', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ returnId, status })
            });
            const data = await res.json();
            if (data.success) {
                setRequests(prev => prev.map(r => ((r._id === returnId || r.id === returnId) ? data.data : r)));
                toast.success(`Return ${status}`, { id: toastId, duration: 2000 });
            } else {
                toast.error(data.error || 'Failed to update', { id: toastId });
            }
        } catch {
            toast.error('Failed to update return', { id: toastId });
        } finally {
            setApprovingReturns(prev => { const s = new Set(prev); s.delete(returnId); return s; });
        }
    };

    const toggleAllRows = () => {
        if (rowSelection.size === filteredRequests.length) {
            setRowSelection(new Set());
        } else {
            setRowSelection(new Set(filteredRequests.map(r => r._id || r.id || '')));
        }
    };

    const toggleRow = (id: string) => {
        setRowSelection(prev => { const next = new Set(prev); if (next.has(id)) { next.delete(id); } else { next.add(id); } return next; });
    };

    // ── Loading ───────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
                    <span className="text-[13px] text-stone-500">Loading return requests…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="text-white max-w-6xl mt-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="text-[13px] text-stone-500 mb-1">After Sales</div>
                    <h1 className="text-xl font-semibold text-white">Returns</h1>
                </div>
                <Button
                    variant="outline"
                    onClick={exportAsCSV}
                    className="border-stone-700 bg-stone-800/60 text-stone-300 hover:bg-stone-800 hover:text-white text-[13px] h-9 gap-1.5"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export
                </Button>
            </div>

            {/* Empty State */}
            {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6">
                    <div className="w-16 h-16 rounded-2xl bg-stone-800/60 border border-stone-800/60 flex items-center justify-center mb-5">
                        <RotateCcw className="h-7 w-7 text-stone-600" />
                    </div>
                    <h2 className="text-[15px] font-medium text-stone-300 mb-1.5">No return requests</h2>
                    <p className="text-[13px] text-stone-500 text-center max-w-sm">
                        When customers request returns, they will appear here for review.
                    </p>
                </div>
            ) : (
                <>
                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                        <Input
                            placeholder="Search order number or email…"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-10 bg-stone-800/60 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-stone-600 h-10"
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-stone-800/30 border border-stone-800/60 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-stone-800/60 hover:bg-transparent">
                                        <TableHead className="w-10 px-5 py-3">
                                            <Checkbox
                                                checked={rowSelection.size === filteredRequests.length && filteredRequests.length > 0}
                                                onCheckedChange={toggleAllRows}
                                                aria-label="Select all"
                                                className="border-stone-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                            />
                                        </TableHead>
                                        <TableHead className="text-[11px] text-stone-500 uppercase tracking-wider font-medium px-5 py-3">Status</TableHead>
                                        <TableHead className="text-[11px] text-stone-500 uppercase tracking-wider font-medium px-5 py-3">Order #</TableHead>
                                        <TableHead className="text-[11px] text-stone-500 uppercase tracking-wider font-medium px-5 py-3">Email</TableHead>
                                        <TableHead className="text-[11px] text-stone-500 uppercase tracking-wider font-medium px-5 py-3">Date</TableHead>
                                        <TableHead className="text-[11px] text-stone-500 uppercase tracking-wider font-medium px-5 py-3 text-right w-10"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRequests.map((request) => {
                                        const id = request._id || request.id || '';
                                        return (
                                            <TableRow key={id} data-state={rowSelection.has(id) ? 'selected' : undefined} className="border-stone-800/60 hover:bg-stone-800/30 transition-colors">
                                                <TableCell className="px-5 py-3">
                                                    <Checkbox
                                                        checked={rowSelection.has(id)}
                                                        onCheckedChange={() => toggleRow(id)}
                                                        className="border-stone-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                                    />
                                                </TableCell>
                                                <TableCell className="px-5 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${statusStyle[request.status] || statusStyle.pending}`}>
                                                        {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                                        {request.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                        {request.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                                        {request.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-3">
                                                    <div className="flex items-center gap-2 text-[13px] text-stone-200 font-mono">
                                                        <Package className="h-3.5 w-3.5 text-stone-500" />
                                                        {request.orderNumber || request.order_number}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-3 text-[13px] text-stone-400 lowercase">{request.email}</TableCell>
                                                <TableCell className="px-5 py-3 text-[12px] text-stone-500 tabular-nums whitespace-nowrap">
                                                    {new Date(request.createdAt || request.created_at || '').toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell className="px-5 py-3 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-7 w-7 p-0 text-stone-500 hover:text-white hover:bg-stone-800">
                                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-stone-900 border-stone-800">
                                                            <DropdownMenuLabel className="text-stone-500 text-[11px]">Actions</DropdownMenuLabel>

                                                            {request.status !== 'approved' && request.status !== 'processed' && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() => updateReturn(id, 'approved')}
                                                                        disabled={approvingReturns.has(id)}
                                                                        className="text-green-400 focus:bg-stone-800 focus:text-green-300 cursor-pointer text-[13px]"
                                                                    >
                                                                        <CheckCircle className="w-3.5 h-3.5 mr-2" />
                                                                        {approvingReturns.has(id) ? 'Approving…' : 'Approve Return'}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-stone-800" />
                                                                </>
                                                            )}

                                                            {request.status === 'approved' && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() => updateReturn(id, 'processed')}
                                                                        className="text-blue-400 focus:bg-stone-800 focus:text-blue-300 cursor-pointer text-[13px]"
                                                                    >
                                                                        <CheckCircle className="w-3.5 h-3.5 mr-2" />
                                                                        Mark as Processed
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-stone-800" />
                                                                </>
                                                            )}

                                                            <DropdownMenuItem
                                                                className="focus:bg-stone-800 cursor-pointer text-stone-300 text-[13px]"
                                                                onClick={() => navigator.clipboard.writeText(request.orderNumber || request.order_number || '')}
                                                            >
                                                                Copy Order #
                                                            </DropdownMenuItem>

                                                            {request.status !== 'rejected' && (
                                                                <>
                                                                    <DropdownMenuSeparator className="bg-stone-800" />
                                                                    <DropdownMenuItem
                                                                        onClick={() => updateReturn(id, 'rejected')}
                                                                        className="text-red-400 focus:bg-stone-800 focus:text-red-300 cursor-pointer text-[13px]"
                                                                    >
                                                                        <XCircle className="w-3.5 h-3.5 mr-2" />
                                                                        Reject Return
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {filteredRequests.length === 0 && (
                                        <TableRow className="hover:bg-transparent border-stone-800/60">
                                            <TableCell colSpan={6} className="h-24 text-center text-[13px] text-stone-500">
                                                No returns match your search.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3 text-[12px] text-stone-500">
                        <span>{rowSelection.size} of {filteredRequests.length} selected</span>
                        <span>{filteredRequests.length} results</span>
                    </div>
                </>
            )}
        </div>
    );
}
