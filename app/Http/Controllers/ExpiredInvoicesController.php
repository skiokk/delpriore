<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Client;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Carbon\Carbon;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\DB;

class ExpiredInvoicesController extends Controller
{
    public function index()
    {
        return view('invoices.expired.index');
    }

    public function getData()
    {
        $invoices = Invoice::select('invoices.*')
            ->leftJoin('clients', function ($join) {
                $join->where(function ($query) {
                    $query->whereRaw('clients.fiscal_code = invoices.tax_code')
                        ->orWhereRaw('clients.vat_number = invoices.tax_code');
                });
            })
            ->withCount(['client' => function ($query) {
                $query->whereRaw('clients.fiscal_code = invoices.tax_code')
                    ->orWhereRaw('clients.vat_number = invoices.tax_code');
            }]);

        return DataTables::of($invoices)
            ->addColumn('status', function ($invoice) {
                // Cerchiamo il cliente in tempo reale
                $client = Client::where('fiscal_code', $invoice->tax_code)
                    ->orWhere('vat_number', $invoice->tax_code)
                    ->first();

                if ($client) {
                    return '<span class="badge bg-success">Censito</span>';
                }
                return '<span class="badge bg-danger">Da censire</span>';
            })
            ->addColumn('client_name', function ($invoice) {
                // Cerchiamo il cliente in tempo reale
                $client = Client::where('fiscal_code', $invoice->tax_code)
                    ->orWhere('vat_number', $invoice->tax_code)
                    ->first();

                return $client ? $client->name : $invoice->customer_name;
            })
            ->editColumn('invoice_date', function ($invoice) {
                return $invoice->invoice_date->format('d/m/Y');
            })
            ->editColumn('total_amount', function ($invoice) {
                return '€ ' . number_format($invoice->total_amount, 2, ',', '.');
            })
            ->rawColumns(['status'])
            ->make(true);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xls,xlsx'
        ]);

        try {
            DB::beginTransaction();

            // Svuota la tabella delle fatture
            Invoice::truncate();

            $spreadsheet = IOFactory::load($request->file('file'));
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Rimuovi l'intestazione
            array_shift($rows);

            foreach ($rows as $row) {
                try {
                    if (is_numeric($row[1])) {
                        $date = Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($row[1]));
                    } else {
                        $date = Carbon::createFromFormat('d/m/Y', $row[1]);
                    }
                } catch (\Exception $e) {
                    $date = Carbon::now();
                }

                // Quando importiamo, salviamo solo i dati della fattura
                Invoice::create([
                    'invoice_number' => $row[0],
                    'invoice_date' => $date,
                    'customer_name' => $row[2],
                    'address' => $row[3],
                    'residence' => $row[4],
                    'province' => $row[5],
                    'tax_code' => trim($row[6]),
                    'taxable_amount' => floatval($row[7]),
                    'vat_amount' => floatval($row[8]),
                    'exempt_amount' => floatval($row[9]),
                    'total_amount' => floatval($row[10])
                ]);
            }

            DB::commit();
            return back()->with('success', 'File importato con successo! La tabella è stata aggiornata.');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Import error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->with('error', 'Errore durante l\'importazione del file: ' . $e->getMessage());
        }
    }
}
