import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Download, Eye, FileText, Trash2 } from 'lucide-react';

import { SectionCard } from '@/components/blue-dome/section-card';
import { StatusPill } from '@/components/blue-dome/status-pill';
import { Button } from '@/components/ui/button';
import { enumLabel } from '@/lib/i18n/doctor';
import { useDoctorLang } from '@/lib/i18n/doctor-context';
import { useLocale } from '@/lib/i18n/use-locale';
import documents from '@/routes/documents';

type Person = {
    first_name: string | null;
    last_name: string | null;
} | null;

type DocumentDetail = {
    id: string;
    document_name: string | null;
    document_type: string;
    file_name: string | null;
    file_size: number | null;
    mime_type: string | null;
    file_extension: string | null;
    entity_type: string | null;
    entity_id: string | null;
    description: string | null;
    tags: string[] | null;
    is_private: boolean | null;
    uploaded_at: string | null;
    expires_at: string | null;
    folder?: { id: string; folder_name: string | null } | null;
    uploader?: Person;
};

interface Props {
    document: DocumentDetail;
}

function formatBytes(bytes: number | null): string {
    if (bytes === null || bytes <= 0) {
        return '—';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    const value = bytes / 1024 ** exponent;

    return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function personName(person: Person): string {
    return (
        `${person?.first_name ?? ''} ${person?.last_name ?? ''}`.trim() || '—'
    );
}

export default function DocumentShow({ document }: Props) {
    const { t } = useDoctorLang();
    const { slug: locale } = useLocale();

    function handleDelete() {
        if (!window.confirm(t.delete_action)) {
            return;
        }

        router.delete(documents.destroy.url({ locale, document: document.id }), {
            preserveScroll: true,
        });
    }

    const downloadHref = documents.download.url({
        locale,
        document: document.id,
    });

    const previewHref = documents.preview.url({
        locale,
        document: document.id,
    });

    const tags = document.tags ?? [];

    return (
        <>
            <Head title={document.document_name ?? t.document} />

            <div className="px-8 py-6 lg:px-10">
                <div className="mb-4 flex items-center gap-3 text-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ms-2 gap-1.5"
                    >
                        <Link href={documents.index.url({ locale })}>
                            <ChevronLeft className="size-3.5" />
                            {t.documents}
                        </Link>
                    </Button>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-[13px] font-medium">
                        {document.document_name ?? '—'}
                    </span>
                </div>

                <div className="mb-5 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-[20px] font-semibold">
                                {document.document_name ?? '—'}
                            </h1>
                            <StatusPill tone="olive" withDot>
                                {enumLabel(
                                    t.document_type_opts,
                                    document.document_type,
                                )}
                            </StatusPill>
                            {document.is_private && (
                                <StatusPill tone="warning">
                                    {t.private_label}
                                </StatusPill>
                            )}
                        </div>
                        <div className="mt-2 grid gap-1 text-[13px] text-muted-foreground">
                            <span>
                                {document.file_name ?? '—'}
                                {document.file_extension
                                    ? ` · ${document.file_extension.toUpperCase()}`
                                    : ''}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-2">
                            <a
                                href={previewHref}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Eye className="size-3.5" />
                                {t.preview_label}
                            </a>
                        </Button>
                        <Button
                            asChild
                            size="sm"
                            className="gap-2 bg-olive-600 text-white hover:bg-olive-700"
                        >
                            <a href={downloadHref}>
                                <Download className="size-3.5" />
                                {t.download}
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            className="gap-2 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="size-3.5" />
                            {t.delete_action}
                        </Button>
                    </div>
                </div>

                <SectionCard
                    titleIcon={<FileText className="size-4" />}
                    title={t.document}
                    className="mb-5"
                >
                    <dl className="grid gap-x-8 gap-y-4 text-[13px] sm:grid-cols-2">
                        <div>
                            <dt className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                {t.folder}
                            </dt>
                            <dd>{document.folder?.folder_name ?? t.all_folders}</dd>
                        </div>
                        <div>
                            <dt className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                {t.document_type}
                            </dt>
                            <dd>
                                {enumLabel(
                                    t.document_type_opts,
                                    document.document_type,
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                {t.uploaded_by}
                            </dt>
                            <dd>
                                {personName(document.uploader ?? null)}
                                {document.uploaded_at
                                    ? ` · ${document.uploaded_at.slice(0, 10)}`
                                    : ''}
                            </dd>
                        </div>
                        <div>
                            <dt className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                {t.size}
                            </dt>
                            <dd className="tabular-nums">
                                {formatBytes(document.file_size)}
                            </dd>
                        </div>
                        <div>
                            <dt className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                {t.file}
                            </dt>
                            <dd>{document.mime_type ?? '—'}</dd>
                        </div>
                        {document.entity_type && (
                            <div>
                                <dt className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                    Linked to
                                </dt>
                                <dd>{document.entity_type}</dd>
                            </div>
                        )}
                        <div>
                            <dt className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                {t.private_label}
                            </dt>
                            <dd>
                                {document.is_private ? (
                                    <StatusPill tone="warning">
                                        {t.private_label}
                                    </StatusPill>
                                ) : (
                                    <StatusPill tone="neutral">
                                        {t.system_label}
                                    </StatusPill>
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                {t.expires}
                            </dt>
                            <dd>{document.expires_at?.slice(0, 10) ?? '—'}</dd>
                        </div>
                    </dl>
                </SectionCard>

                {(document.description || tags.length > 0) && (
                    <SectionCard
                        title={t.col_description}
                        className="mb-5"
                    >
                        {document.description && (
                            <p className="text-[13px] whitespace-pre-line">
                                {document.description}
                            </p>
                        )}
                        {tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                )}
            </div>
        </>
    );
}
