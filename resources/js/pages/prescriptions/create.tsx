import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    MessageCircle,
    Plus,
    Printer,
    Search,
    X,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/blue-dome/page-header';
import { SectionCard } from '@/components/blue-dome/section-card';
import { Button } from '@/components/ui/button';
import { useDoctorLang } from '@/lib/i18n/doctor-context';

type RxLine = {
    med: string;
    dose: string;
    freq: string;
    duration: string;
    route: string;
};

const INITIAL_RX: RxLine[] = [
    {
        med: 'Amlodipine 5mg',
        dose: '1 tablet',
        freq: 'Once daily',
        duration: '30 days',
        route: 'oral',
    },
    {
        med: 'Atorvastatin 20mg',
        dose: '1 tablet',
        freq: 'At bedtime',
        duration: '30 days',
        route: 'oral',
    },
];

const FREQUENCIES = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Every 8 hours',
    'At bedtime',
];

export default function PrescriptionCreate() {
    const { t } = useDoctorLang();
    const [items, setItems] = useState<RxLine[]>(INITIAL_RX);

    const updateItem = (i: number, patch: Partial<RxLine>) => {
        setItems((prev) =>
            prev.map((item, idx) => (idx === i ? { ...item, ...patch } : item)),
        );
    };

    const addItem = () =>
        setItems((prev) => [
            ...prev,
            {
                med: '',
                dose: '',
                freq: 'Once daily',
                duration: '',
                route: 'oral',
            },
        ]);

    const removeItem = (i: number) =>
        setItems((prev) => prev.filter((_, idx) => idx !== i));

    return (
        <>
            <Head title={t.new_rx} />

            <div className="px-8 py-6 lg:px-10">
                <PageHeader
                    title={t.new_rx}
                    description="For Hassan El Amrani · P-002841 · 58y · A+"
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Printer className="size-3.5" />
                                Print
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                            >
                                <MessageCircle className="size-3.5" />
                                {t.save_send}
                            </Button>
                        </>
                    }
                />

                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-3 rounded-xl border border-border bg-card p-5">
                        <h2 className="text-lg font-semibold">Medications</h2>

                        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border bg-muted px-3 py-2.5">
                            <Search className="size-4 text-muted-foreground" />
                            <input
                                placeholder="Search medication: trade name, generic, ATC code..."
                                className="min-w-0 flex-1 border-none bg-transparent text-sm outline-none"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <AlertTriangle className="size-3.5" />
                                Allergy check
                            </Button>
                        </div>

                        {items.map((rx, i) => (
                            <div
                                key={i}
                                className="grid items-end gap-2 rounded-lg border border-border bg-card p-3"
                                style={{
                                    gridTemplateColumns:
                                        '1.5fr 1fr 1fr 1fr 36px',
                                }}
                            >
                                <div>
                                    <div className="mb-1 text-[12px] font-medium text-muted-foreground">
                                        {t.medication}
                                    </div>
                                    <div className="text-[14px] font-semibold">
                                        {rx.med || '—'}
                                    </div>
                                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                                        oral · tablet
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-[12px] font-medium text-muted-foreground">
                                        {t.dosage}
                                    </label>
                                    <input
                                        value={rx.dose}
                                        onChange={(e) =>
                                            updateItem(i, {
                                                dose: e.target.value,
                                            })
                                        }
                                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[12px] font-medium text-muted-foreground">
                                        {t.frequency}
                                    </label>
                                    <select
                                        value={rx.freq}
                                        onChange={(e) =>
                                            updateItem(i, {
                                                freq: e.target.value,
                                            })
                                        }
                                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    >
                                        {FREQUENCIES.map((f) => (
                                            <option key={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-[12px] font-medium text-muted-foreground">
                                        {t.duration}
                                    </label>
                                    <input
                                        value={rx.duration}
                                        onChange={(e) =>
                                            updateItem(i, {
                                                duration: e.target.value,
                                            })
                                        }
                                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-9"
                                    onClick={() => removeItem(i)}
                                >
                                    <X className="size-3.5" />
                                </Button>
                            </div>
                        ))}

                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={addItem}
                        >
                            <Plus className="size-3.5" />
                            Add medication
                        </Button>

                        <div className="mt-6 space-y-3">
                            <div>
                                <label className="mb-1 block text-[12px] font-medium text-muted-foreground">
                                    Diagnosis
                                </label>
                                <input
                                    defaultValue="I10 — Essential (primary) hypertension"
                                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[12px] font-medium text-muted-foreground">
                                    Notes for patient
                                </label>
                                <textarea
                                    rows={3}
                                    defaultValue="Take with food. Monitor BP twice daily and log readings. Return in 4 weeks."
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl border border-border bg-card p-5">
                            <div className="mb-3 flex items-center gap-3 border-b-2 border-navy-900 pb-2.5">
                                <div className="grid size-7 place-items-center rounded-md bg-navy-900 text-[11px] font-bold text-white">
                                    BD
                                </div>
                                <div>
                                    <div className="text-[13px] font-bold">
                                        Cabinet Dr. Lahlou
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        Cardiology · Casablanca
                                    </div>
                                </div>
                            </div>
                            <div className="mb-1 text-[10px] tracking-wider text-muted-foreground uppercase">
                                Prescription
                            </div>
                            <div className="mb-3 text-[11px] leading-relaxed">
                                <div>
                                    <strong>Patient:</strong> Hassan El Amrani ·
                                    58y
                                </div>
                                <div>
                                    <strong>Date:</strong> May 5, 2026
                                </div>
                                <div>
                                    <strong>RX#:</strong> RX-2026-04812
                                </div>
                            </div>
                            <div className="space-y-2.5 text-[11px] leading-relaxed">
                                {items.map(
                                    (rx, i) =>
                                        rx.med && (
                                            <div
                                                key={i}
                                                className="border-b border-dashed border-border pb-2 last:border-b-0"
                                            >
                                                <div className="font-semibold">
                                                    ℞ {rx.med}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {rx.dose} · {rx.freq} ·{' '}
                                                    {rx.duration}
                                                </div>
                                            </div>
                                        ),
                                )}
                            </div>
                            <div className="mt-4 border-t border-dashed border-border pt-2.5 text-[10px] text-muted-foreground">
                                Dr. Karim Lahlou · License MA-CD-1842
                            </div>
                        </div>

                        <SectionCard
                            className="border-[#fcd34d] bg-warning-soft"
                            bodyClassName="p-4"
                        >
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="size-4 shrink-0 pt-0.5 text-warning" />
                                <div>
                                    <div className="text-[13px] font-semibold text-warning">
                                        Minor interaction
                                    </div>
                                    <div className="mt-1 text-[12px] text-amber-900">
                                        Atorvastatin + Amlodipine: monitor for
                                        muscle pain. Both prescribed at
                                        recommended doses — proceed with
                                        caution.
                                    </div>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </>
    );
}
