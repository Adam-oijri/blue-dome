import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Box,
    ChevronRight,
    Clock,
    Filter,
    Plus,
} from 'lucide-react';

import { KpiCard } from '@/components/blue-dome/kpi-card';
import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import type { StatusTone } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { cn } from '@/lib/utils';

type ItemStatus = 'ok' | 'low' | 'critical' | 'expiring';

const ITEMS: {
    name: string;
    category: 'medication' | 'supplies';
    stock: number;
    min: number;
    exp: string;
    batch: string;
    status: ItemStatus;
}[] = [
    {
        name: 'Atorvastatin 20mg',
        category: 'medication',
        stock: 240,
        min: 50,
        exp: 'Aug 2027',
        batch: 'ATV-2024-08',
        status: 'ok',
    },
    {
        name: 'Amlodipine 5mg',
        category: 'medication',
        stock: 32,
        min: 50,
        exp: 'Mar 2027',
        batch: 'AML-2024-11',
        status: 'low',
    },
    {
        name: 'Aspirin 75mg',
        category: 'medication',
        stock: 180,
        min: 100,
        exp: 'Jun 2027',
        batch: 'ASP-2024-04',
        status: 'ok',
    },
    {
        name: 'Disposable syringes 5ml',
        category: 'supplies',
        stock: 420,
        min: 200,
        exp: '—',
        batch: '—',
        status: 'ok',
    },
    {
        name: 'ECG electrodes',
        category: 'supplies',
        stock: 18,
        min: 50,
        exp: '—',
        batch: '—',
        status: 'low',
    },
    {
        name: 'Metformin 500mg',
        category: 'medication',
        stock: 8,
        min: 30,
        exp: 'Dec 2026',
        batch: 'MTF-2023-12',
        status: 'critical',
    },
    {
        name: 'Surgical gloves (M)',
        category: 'supplies',
        stock: 1200,
        min: 500,
        exp: '—',
        batch: '—',
        status: 'ok',
    },
    {
        name: 'Insulin glargine 100U',
        category: 'medication',
        stock: 14,
        min: 10,
        exp: 'Jul 2026',
        batch: 'INS-2025-01',
        status: 'expiring',
    },
];

const STATUS: Record<ItemStatus, { tone: StatusTone; label: string }> = {
    ok: { tone: 'success', label: 'In stock' },
    low: { tone: 'warning', label: 'Low' },
    critical: { tone: 'danger', label: 'Critical' },
    expiring: { tone: 'warning', label: 'Expiring soon' },
};

const BAR_COLOR: Record<ItemStatus, string> = {
    ok: 'bg-olive-500',
    low: 'bg-warning',
    critical: 'bg-danger',
    expiring: 'bg-warning',
};

export default function InventoryIndex() {
    const { t } = useDoctorLang();

    return (
        <>
            <Head title={t.inventory} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.inventory}
                    description="284 items tracked · 3 below threshold · 2 expiring within 60 days"
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <AlertTriangle className="size-3.5" />
                                Reorder list
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <Plus className="size-3.5" />
                                Add item
                            </Button>
                        </>
                    }
                />

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <KpiCard
                        label="Total items"
                        value="284"
                        icon={Box}
                        tone="navy"
                    />
                    <KpiCard
                        label="Low stock"
                        value="12"
                        icon={AlertTriangle}
                        tone="warn"
                    />
                    <KpiCard
                        label="Critical"
                        value="3"
                        icon={AlertTriangle}
                        tone="warn"
                    />
                    <KpiCard
                        label="Expiring soon"
                        value="8"
                        icon={Clock}
                        tone="warn"
                    />
                </div>

                <SectionCard
                    title="Stock levels"
                    titleIcon={<Box className="size-4" />}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Filter className="size-3.5" />
                                All categories
                            </Button>
                            <Button variant="outline" size="sm">
                                All branches
                            </Button>
                        </>
                    }
                    bodyClassName="p-0"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-5 py-2.5 text-[11px] tracking-wider uppercase">
                                    Item
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Category
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Stock
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Min level
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Batch
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Expiry
                                </TableHead>
                                <TableHead className="text-[11px] tracking-wider uppercase">
                                    Status
                                </TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ITEMS.map((it) => {
                                const s = STATUS[it.status];
                                const pct = Math.min(
                                    100,
                                    (it.stock / Math.max(it.min * 3, 1)) * 100,
                                );

                                return (
                                    <TableRow
                                        key={it.name}
                                        className="cursor-pointer hover:bg-muted/50"
                                    >
                                        <TableCell className="px-5 py-3 text-[13px] font-medium">
                                            {it.name}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill>
                                                {it.category}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <span className="min-w-[32px] text-[13px] font-semibold tabular-nums">
                                                    {it.stock}
                                                </span>
                                                <div className="relative h-1.5 max-w-[80px] flex-1 overflow-hidden rounded bg-muted">
                                                    <div
                                                        className={cn(
                                                            'h-full rounded',
                                                            BAR_COLOR[
                                                                it.status
                                                            ],
                                                        )}
                                                        style={{
                                                            width: `${pct}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                            {it.min}
                                        </TableCell>
                                        <TableCell className="text-[11px] text-muted-foreground tabular-nums">
                                            {it.batch}
                                        </TableCell>
                                        <TableCell className="text-[12px] text-muted-foreground tabular-nums">
                                            {it.exp}
                                        </TableCell>
                                        <TableCell>
                                            <StatusPill tone={s.tone}>
                                                {s.label}
                                            </StatusPill>
                                        </TableCell>
                                        <TableCell>
                                            <ChevronRight className="size-3.5 text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </SectionCard>
            </div>
        </>
    );
}
