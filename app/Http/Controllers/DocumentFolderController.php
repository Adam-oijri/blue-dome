<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentFolder\StoreDocumentFolderRequest;
use App\Models\DocumentFolder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DocumentFolderController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', DocumentFolder::class);

        $query = DocumentFolder::query()
            ->select(['id', 'clinic_id', 'folder_name', 'parent_folder_id', 'is_system', 'entity_type', 'entity_id'])
            ->withCount('documents')
            ->orderBy('folder_name');

        if ($request->user()->role !== 'super_admin') {
            $query->where('clinic_id', $request->user()->clinic_id);
        }

        return Inertia::render('document-folders/index', [
            'folders' => $query->paginate(50)->withQueryString(),
        ]);
    }

    public function store(StoreDocumentFolderRequest $request): RedirectResponse
    {
        $folder = DocumentFolder::create($request->validated() + [
            'clinic_id' => $request->user()->clinic_id,
            'created_by' => Auth::id(),
        ]);

        return redirect()
            ->route('document-folders.index')
            ->with('toast', ['type' => 'success', 'message' => __('document_folders.created')]);
    }

    public function destroy(string $locale, DocumentFolder $documentFolder): RedirectResponse
    {
        unset($locale);
        $this->authorize('delete', $documentFolder);

        $documentFolder->delete();

        return redirect()
            ->route('document-folders.index')
            ->with('toast', ['type' => 'success', 'message' => __('document_folders.deleted')]);
    }
}
