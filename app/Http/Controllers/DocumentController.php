<?php

namespace App\Http\Controllers;

use App\Http\Requests\Document\StoreDocumentRequest;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Documents are stored on the `local` disk (Laravel's default private
 * filesystem, rooted at `storage/app/private/`) under a clinic-prefixed
 * path so RLS in the DB and the on-disk layout both isolate by clinic.
 */
class DocumentController extends Controller
{
    private const DISK = 'local';

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Document::class);

        $query = Document::query()
            ->select(['id', 'clinic_id', 'document_name', 'document_type', 'mime_type', 'file_size', 'folder_id', 'entity_type', 'entity_id', 'uploaded_at', 'is_private'])
            ->with(['folder:id,folder_name', 'uploader:id,first_name,last_name'])
            ->latest('uploaded_at');

        if ($request->user()->role !== 'super_admin') {
            $query->where('clinic_id', $request->user()->clinic_id);
        }

        if ($folderId = $request->string('folder_id')->trim()->toString()) {
            $query->where('folder_id', $folderId);
        }

        return Inertia::render('documents/index', [
            'documents' => $query->paginate(25)->withQueryString(),
            'filters' => ['folder_id' => $folderId ?: null],
        ]);
    }

    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $clinicId = $request->user()->clinic_id;
        $file = $request->file('file');

        $hash = hash_file('sha256', $file->getRealPath());
        $extension = $file->getClientOriginalExtension();
        $storedName = $hash.'.'.$extension;
        $path = Storage::disk(self::DISK)->putFileAs(
            "clinics/{$clinicId}",
            $file,
            $storedName,
        );

        $document = Document::create([
            'clinic_id' => $clinicId,
            'folder_id' => $request->input('folder_id'),
            'document_name' => $request->input('document_name'),
            'document_type' => $request->input('document_type'),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'file_extension' => $extension,
            'file_hash' => $hash,
            'entity_type' => $request->input('entity_type'),
            'entity_id' => $request->input('entity_id'),
            'description' => $request->input('description'),
            'tags' => $request->input('tags', []),
            'is_private' => (bool) $request->input('is_private', false),
            'expires_at' => $request->input('expires_at'),
            'uploaded_by' => Auth::id(),
            'uploaded_at' => now(),
        ]);

        return redirect()
            ->route('documents.show', $document)
            ->with('toast', ['type' => 'success', 'message' => __('documents.uploaded')]);
    }

    public function show(string $locale, Document $document): Response
    {
        unset($locale);
        $this->authorize('view', $document);

        $document->load(['folder:id,folder_name', 'uploader:id,first_name,last_name']);

        return Inertia::render('documents/show', [
            'document' => $document,
        ]);
    }

    public function download(string $locale, Document $document): StreamedResponse
    {
        unset($locale);
        $this->authorize('view', $document);

        abort_unless(Storage::disk(self::DISK)->exists($document->file_path), 404);

        return Storage::disk(self::DISK)->download($document->file_path, $document->file_name);
    }

    public function destroy(string $locale, Document $document): RedirectResponse
    {
        unset($locale);
        $this->authorize('delete', $document);

        $document->delete();

        return redirect()
            ->route('documents.index')
            ->with('toast', ['type' => 'success', 'message' => __('documents.deleted')]);
    }
}
