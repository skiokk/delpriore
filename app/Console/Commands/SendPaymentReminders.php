<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\EmailSetting;
use App\Models\EmailLog;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendPaymentReminders extends Command
{
    protected $signature = 'reminders:send';
    protected $description = 'Send payment reminders to clients with overdue invoices';

    private $settings;

    public function handle()
    {
        // Recupera le impostazioni email
        $this->settings = EmailSetting::first();
        if (!$this->settings) {
            $this->error('Email settings not configured');
            return 1;
        }

        $cutoffDate = Carbon::now()->subDays($this->settings->days_before_reminder);

        $this->info("\nLooking for invoices due before: " . $cutoffDate->format('d/m/Y'));

        // Prima associamo tutte le fatture ai clienti censiti
        $this->info("Associating invoices to clients...");
        $this->associateInvoicesToClients();

        // Ora cerchiamo le fatture scadute
        $overdueInvoices = Invoice::where('invoice_date', '<=', $cutoffDate)
            ->whereExists(function ($query) {
                $query->from('clients')
                    ->whereColumn('clients.fiscal_code', 'invoices.tax_code')
                    ->orWhereColumn('clients.vat_number', 'invoices.tax_code');
            })
            ->whereNotExists(function ($query) {
                $query->select('invoices_included')
                    ->from('email_logs')
                    ->whereRaw('JSON_CONTAINS(email_logs.invoices_included, CAST(invoices.id AS CHAR))');
            })
            ->get();

        if ($overdueInvoices->isEmpty()) {
            $this->info("No overdue invoices to remind.");
            return;
        }

        $this->info("Found " . $overdueInvoices->count() . " overdue invoices.");

        // Raggruppa per codice fiscale/partita IVA
        $groupedInvoices = $overdueInvoices->groupBy('tax_code');

        foreach ($groupedInvoices as $taxCode => $invoices) {
            $client = Client::where('fiscal_code', $taxCode)
                ->orWhere('vat_number', $taxCode)
                ->first();

            if (!$client) {
                $this->warn("Client with Tax Code/VAT Number $taxCode not found.");
                continue;
            }

            if (!$client->email) {
                $this->warn("Client {$client->name} has no email address.");
                continue;
            }

            $totalAmount = $invoices->sum('total_amount');

            $this->info("\nClient: {$client->name}");
            $this->info("Email: {$client->email}");
            $this->info("Total amount due: € " . number_format($totalAmount, 2, ',', '.'));

            try {
                // Prepara il contenuto dell'email
                $invoicesList = $invoices->map(function ($invoice) {
                    return [
                        'numero' => $invoice->invoice_number,
                        'data' => Carbon::parse($invoice->invoice_date)->format('d/m/Y'),
                        'importo' => number_format($invoice->total_amount, 2, ',', '.')
                    ];
                });

                $emailContent = $this->prepareEmailContent($this->settings->email_template, [
                    'cliente' => $client->name,
                    'fatture' => $invoicesList,
                    'totale' => number_format($totalAmount, 2, ',', '.')
                ]);

                Mail::raw($emailContent, function ($message) use ($client) {
                    $message->to($client->email)
                        ->subject($this->settings->email_subject);
                });

                EmailLog::create([
                    'client_id' => $client->id,
                    'sent_date' => Carbon::now(),
                    'email_content' => $emailContent,
                    'invoices_included' => $invoices->pluck('id')->toJson()
                ]);

                $this->info("Email sent successfully");
            } catch (\Exception $e) {
                $this->error("Error sending email: {$e->getMessage()}");
            }
        }
    }

    private function associateInvoicesToClients()
    {
        $invoices = Invoice::whereNull('client_id')->get();
        foreach ($invoices as $invoice) {
            $client = Client::where('fiscal_code', $invoice->tax_code)
                ->orWhere('vat_number', $invoice->tax_code)
                ->first();

            if ($client) {
                $invoice->client_id = $client->id;
                $invoice->save();
                $this->line("Invoice {$invoice->invoice_number} associated with client {$client->name}");
            }
        }
    }

    private function prepareEmailContent($template, $data)
    {
        $content = $template;

        // Sostituisci il nome del cliente
        $content = str_replace('{cliente}', $data['cliente'], $content);

        // Aggiungi la lista delle fatture
        $fattureHtml = "";
        foreach ($data['fatture'] as $fattura) {
            $fattureHtml .= "Fattura n. {$fattura['numero']} del {$fattura['data']}: € {$fattura['importo']}\n";
        }
        $content = str_replace('{fatture}', $fattureHtml, $content);

        // Sostituisci il totale
        $content = str_replace('{totale}', $data['totale'], $content);

        return $content;
    }
}
