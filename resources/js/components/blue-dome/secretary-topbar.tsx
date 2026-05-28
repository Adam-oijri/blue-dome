import {
    Bell,
    Building2,
    Check,
    ChevronDown,
    Plus,
    Search,
    Stethoscope,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSecretaryLang } from '@/lib/i18n/secretary-context';
import {
    SECRETARY_MOCK,
    localName,
    localSpecialty,
} from '@/lib/mock/secretary';
import type { BranchKey } from '@/lib/mock/secretary';
import { cn } from '@/lib/utils';

interface SecretaryTopbarProps {
    branch: string;
    onBranchChange: (id: string) => void;
    selectedDoctors: string[];
    onSelectedDoctorsChange: (ids: string[]) => void;
}

export function SecretaryTopbar({
    branch,
    onBranchChange,
    selectedDoctors,
    onSelectedDoctorsChange,
}: SecretaryTopbarProps) {
    const { t, lang } = useSecretaryLang();
    const [searchQuery, setSearchQuery] = useState('');

    const branchData = SECRETARY_MOCK.branches.find((b) => b.id === branch);
    const docsAtBranch = SECRETARY_MOCK.doctors.filter(
        (d) => d.branch === branch,
    );
    const allSelected = selectedDoctors.length === docsAtBranch.length;

    const branchLabel = (key: BranchKey | undefined) => {
        if (!key) {
            return '';
        }

        return key === 'casa' ? t.branch_casa : t.branch_rabat;
    };

    const toggleDoctor = (id: string) => {
        if (selectedDoctors.includes(id)) {
            if (selectedDoctors.length === 1) {
                return;
            }

            onSelectedDoctorsChange(selectedDoctors.filter((x) => x !== id));
        } else {
            onSelectedDoctorsChange([...selectedDoctors, id]);
        }
    };

    return (
        <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-card px-6">
            <SidebarTrigger className="-ms-1 md:hidden" />

            <div className="relative max-w-[320px] flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.search_placeholder}
                    className={cn(
                        'h-9 w-full rounded-md border border-transparent bg-muted ps-9 pe-3 text-sm transition-[border-color,box-shadow] outline-none',
                        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    )}
                />
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                        <Building2 className="size-3.5" />
                        <span className="text-muted-foreground">
                            {t.branch_label}:
                        </span>
                        <span className="font-semibold">
                            {branchLabel(branchData?.key)}
                        </span>
                        <ChevronDown className="size-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[220px]">
                    {SECRETARY_MOCK.branches.map((b) => (
                        <DropdownMenuItem
                            key={b.id}
                            onSelect={() => onBranchChange(b.id)}
                            className="gap-2"
                        >
                            <span className="size-3.5 shrink-0">
                                {b.id === branch && (
                                    <Check className="size-3.5" />
                                )}
                            </span>
                            <span className="flex-1">{branchLabel(b.key)}</span>
                            {b.main && (
                                <span className="text-[11px] text-olive-700">
                                    Main
                                </span>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                        <Stethoscope className="size-3.5" />
                        <span className="text-muted-foreground">
                            {t.doctors_label}:
                        </span>
                        <span className="font-semibold">
                            {allSelected
                                ? t.doctors_all
                                : `${selectedDoctors.length} of ${docsAtBranch.length}`}
                        </span>
                        <ChevronDown className="size-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[260px]">
                    <DropdownMenuItem
                        onSelect={() =>
                            onSelectedDoctorsChange(
                                docsAtBranch.map((d) => d.id),
                            )
                        }
                        className="gap-2"
                    >
                        <span className="size-3.5 shrink-0">
                            {allSelected && <Check className="size-3.5" />}
                        </span>
                        <span className="flex-1 font-semibold">
                            {t.doctors_all}
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {docsAtBranch.map((d) => {
                        const on = selectedDoctors.includes(d.id);

                        return (
                            <DropdownMenuItem
                                key={d.id}
                                onSelect={(e) => {
                                    e.preventDefault();
                                    toggleDoctor(d.id);
                                }}
                                className="gap-2"
                            >
                                <span className="size-3.5 shrink-0">
                                    {on && <Check className="size-3.5" />}
                                </span>
                                <span
                                    className={cn(
                                        'size-2.5 shrink-0 rounded-full',
                                        d.hue === 'navy'
                                            ? 'bg-navy-700'
                                            : 'bg-olive-600',
                                    )}
                                />
                                <div className="flex flex-1 flex-col">
                                    <span className="text-[13px]">
                                        {localName(d, lang)}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                        {localSpecialty(d, lang)}
                                    </span>
                                </div>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="ms-auto flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="size-9"
                    aria-label={t.notifications}
                >
                    <Bell className="size-4" />
                </Button>

                <Button className="bg-olive-600 text-white hover:bg-olive-700">
                    <Plus className="size-4" />
                    {t.new_appointment}
                </Button>
            </div>
        </header>
    );
}
