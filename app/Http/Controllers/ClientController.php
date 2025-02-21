<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Yajra\DataTables\Facades\DataTables;

class ClientController extends Controller
{
    public function index()
    {
        return view('clients.index');
    }

    public function getData()
    {
        $clients = Client::select(['id', 'name', 'type', 'fiscal_code', 'phone', 'is_active']);

        return DataTables::of($clients)
            ->addColumn('actions', function ($client) {
                return '
                    <a href="' . route('clients.edit', $client->id) . '" class="btn btn-sm btn-primary">
                        <i class="ti ti-edit"></i>
                    </a>
                    <button type="button" class="btn btn-sm btn-danger" onclick="deleteClient(' . $client->id . ')">
                        <i class="ti ti-trash"></i>
                    </button>
                ';
            })
            ->editColumn('type', function ($client) {
                return $client->type == 'private' ? 'Privato' : 'Azienda';
            })
            ->editColumn('is_active', function ($client) {
                return $client->is_active ?
                    '<span class="badge bg-success">Attivo</span>' :
                    '<span class="badge bg-danger">Inattivo</span>';
            })
            ->rawColumns(['actions', 'is_active'])
            ->make(true);
    }

    public function create()
    {
        return view('clients.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:private,company',
            'fiscal_code' => [
                'nullable',
                'string',
                'max:16',
                'unique:clients',
            ],
            'vat_number' => [
                'nullable',
                'string',
                'max:11',
                'unique:clients',
            ],
            'address' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'license_number' => 'nullable|string|max:50',
            'license_expiry' => 'nullable|date',
            'license_type' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        // Verifica che almeno uno tra codice fiscale e partita IVA sia presente
        if (empty($request->fiscal_code) && empty($request->vat_number)) {
            return back()
                ->withInput()
                ->withErrors(['fiscal_code' => 'È necessario inserire almeno il Codice Fiscale o la Partita IVA.']);
        }

        $validated = $request->all();
        $validated['is_active'] = $request->has('is_active');

        Client::create($validated);

        return redirect()->route('clients.index')
            ->with('success', 'Cliente creato con successo.');
    }

    public function edit(Client $client)
    {
        return view('clients.edit', compact('client'));
    }

    public function update(Request $request, Client $client)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:private,company',
            'fiscal_code' => [
                'nullable',
                'string',
                'max:16',
                'unique:clients,fiscal_code,' . $client->id,
            ],
            'vat_number' => [
                'nullable',
                'string',
                'max:11',
                'unique:clients,vat_number,' . $client->id,
            ],
            'address' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'license_number' => 'nullable|string|max:50',
            'license_expiry' => 'nullable|date',
            'license_type' => 'nullable|string|max:20',
            'notes' => 'nullable|string'
        ]);

        // Verifica che almeno uno tra codice fiscale e partita IVA sia presente
        if (empty($request->fiscal_code) && empty($request->vat_number)) {
            return back()
                ->withInput()
                ->withErrors(['fiscal_code' => 'È necessario inserire almeno il Codice Fiscale o la Partita IVA.']);
        }

        $validated = $request->all();
        $validated['is_active'] = $request->has('is_active');

        $client->update($validated);

        return redirect()->route('clients.index')
            ->with('success', 'Cliente aggiornato con successo.');
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return response()->json(['success' => true]);
    }
}
