<?php

namespace App\Http\Controllers;

use App\Models\EmailLog;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Client;
use Illuminate\Support\Facades\DB;

class ReminderDashboardController extends Controller
{
    public function index()
    {
        // Statistiche generali
        $stats = [
            'total_reminders' => EmailLog::count(),
            'reminders_this_month' => EmailLog::whereMonth('sent_date', now()->month)->count(),
            'total_invoices_reminded' => EmailLog::sum(DB::raw('JSON_LENGTH(invoices_included)')),
            'total_amount_reminded' => Invoice::whereIn('id', function ($query) {
                $query->select(DB::raw('JSON_EXTRACT(invoices_included, "$[*]")'))
                    ->from('email_logs');
            })->sum('total_amount'),
        ];

        // Ultimi solleciti inviati
        $recentReminders = EmailLog::with(['client'])
            ->orderBy('sent_date', 'desc')
            ->take(10)
            ->get()
            ->map(function ($log) {
                $invoicesCount = json_decode($log->invoices_included, true);
                return [
                    'client_name' => $log->client->name,
                    'sent_date' => Carbon::parse($log->sent_date)->format('d/m/Y H:i'),
                    'invoices_count' => count($invoicesCount),
                    'email_content' => $log->email_content
                ];
            });

        // Trend mensile
        $monthlyTrend = EmailLog::select(
            DB::raw('DATE_FORMAT(sent_date, "%Y-%m") as month'),
            DB::raw('COUNT(*) as total_reminders'),
            DB::raw('COUNT(DISTINCT client_id) as unique_clients')
        )
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->take(12)
            ->get();

        // Top clienti che ricevono solleciti
        $topClients = EmailLog::select('client_id', DB::raw('COUNT(*) as reminder_count'))
            ->with('client')
            ->groupBy('client_id')
            ->orderBy('reminder_count', 'desc')
            ->take(5)
            ->get();

        return view('dashboard.reminders', compact(
            'stats',
            'recentReminders',
            'monthlyTrend',
            'topClients'
        ));
    }

    public function getDetails(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        $clientId = $request->get('client_id');

        $query = EmailLog::with(['client']);

        if ($startDate && $endDate) {
            $query->whereBetween('sent_date', [$startDate, $endDate]);
        }

        if ($clientId) {
            $query->where('client_id', $clientId);
        }

        $logs = $query->orderBy('sent_date', 'desc')->paginate(15);

        // Ottieni la lista dei clienti per il filtro
        $clients = Client::orderBy('name')->get();

        return view('dashboard.reminders-details', compact('logs', 'clients'));
    }
}
