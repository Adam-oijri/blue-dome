<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Contracts\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

trait ExportsCsv
{
    /**
     * Guard a CSV cell against spreadsheet formula injection by prefixing a
     * leading =, +, -, or @ with a single quote.
     */
    protected function csvSafe(mixed $value): string
    {
        $value = (string) ($value ?? '');

        if ($value !== '' && in_array($value[0], ['=', '+', '-', '@'], true)) {
            return "'".$value;
        }

        return $value;
    }

    /**
     * Stream an Eloquent query as a chunked CSV download.
     *
     * @param  array<int, string>  $headers
     * @param  callable(mixed): array<int, mixed>  $row
     */
    protected function streamCsv(Builder $query, string $filename, array $headers, callable $row): StreamedResponse
    {
        return response()->streamDownload(function () use ($query, $headers, $row): void {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel reads accents correctly.
            fputcsv($out, $headers);

            $query->chunk(500, function ($records) use ($out, $row): void {
                foreach ($records as $record) {
                    fputcsv($out, array_map(fn ($value) => $this->csvSafe($value), $row($record)));
                }
            });

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
