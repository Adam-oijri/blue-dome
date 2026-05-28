import type { SuperAdminLang } from '@/lib/i18n/super-admin';

export function fmtNumber(n: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(
        n,
    );
}

export function fmtMAD(n: number): string {
    return fmtNumber(n);
}

export function fmtPercent(fraction: number, digits = 0): string {
    return `${(fraction * 100).toFixed(digits)}%`;
}

export function fmtMonth(yyyyMm: string, lang: SuperAdminLang): string {
    const [y, m] = yyyyMm.split('-').map(Number);

    if (!y || !m) {
        return yyyyMm;
    }

    const locale = lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr-FR' : 'en-US';

    return new Intl.DateTimeFormat(locale, { month: 'short' }).format(
        new Date(Date.UTC(y, m - 1, 1)),
    );
}

export function fmtRelativeTime(
    iso: string | null | undefined,
    lang: SuperAdminLang,
): string {
    if (!iso) {
        return '—';
    }

    const then = new Date(iso).getTime();

    if (Number.isNaN(then)) {
        return '—';
    }

    const diffMs = Date.now() - then;
    const mins = Math.max(0, Math.floor(diffMs / 60000));

    return relativeMinutes(mins, lang);
}

export function relativeMinutes(mins: number, lang: SuperAdminLang): string {
    if (mins < 60) {
        if (lang === 'fr') {
            return `il y a ${mins} min`;
        }

        if (lang === 'ar') {
            return `قبل ${mins} د`;
        }

        return `${mins} min ago`;
    }

    const h = Math.floor(mins / 60);

    if (h < 24) {
        if (lang === 'fr') {
            return `il y a ${h} h`;
        }

        if (lang === 'ar') {
            return `قبل ${h} س`;
        }

        return `${h}h ago`;
    }

    const d = Math.floor(h / 24);

    if (lang === 'fr') {
        return `il y a ${d} j`;
    }

    if (lang === 'ar') {
        return `قبل ${d} ي`;
    }

    return `${d}d ago`;
}

export function downloadCsv(
    filename: string,
    rows: Array<Record<string, string | number>>,
): void {
    if (rows.length === 0) {
        return;
    }

    const headers = Object.keys(rows[0]);
    const escape = (v: string | number): string => {
        const s = String(v ?? '');

        if (/[",\n]/.test(s)) {
            return `"${s.replace(/"/g, '""')}"`;
        }

        return s;
    };

    const csv = [
        headers.join(','),
        ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
