<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\EmailSetting;
use App\Models\EmailLog;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendManualInvoiceReminders extends Command
{
    protected $signature = 'reminders:send-manual {--days=30 : Giorni di ritardo}';
    protected $description = 'Invia manualmente i solleciti per le fatture scadute';

    private $settings;

    public function handle()
    {
        // Recupera le impostazioni email
        $this->settings = EmailSetting::first();
        if (!$this->settings) {
            $this->error('Impostazioni email non configurate. Configura prima le impostazioni email.');
            return 1;
        }

        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);

        $this->info("\nCerco fatture scadute prima del: " . $cutoffDate->format('d/m/Y'));

        // Prima associamo tutte le fatture ai clienti censiti
        $this->info("Associazione delle fatture ai clienti...");
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
            $this->info("Nessuna fattura scaduta da sollecitare.");
            return;
        }

        $this->info("Trovate " . $overdueInvoices->count() . " fatture scadute.");

        // Raggruppa per codice fiscale/partita IVA
        $groupedInvoices = $overdueInvoices->groupBy('tax_code');

        foreach ($groupedInvoices as $taxCode => $invoices) {
            $client = Client::where('fiscal_code', $taxCode)
                ->orWhere('vat_number', $taxCode)
                ->first();

            if (!$client) {
                $this->warn("Cliente con CF/P.IVA $taxCode non trovato.");
                continue;
            }

            if (!$client->email) {
                $this->warn("Cliente {$client->name} non ha un indirizzo email.");
                continue;
            }

            $totalAmount = $invoices->sum('total_amount');

            $this->info("\nCliente: {$client->name}");
            $this->info("Email: {$client->email}");
            $this->info("Totale da pagare: € " . number_format($totalAmount, 2, ',', '.'));

            foreach ($invoices as $invoice) {
                $this->line("- Fattura {$invoice->invoice_number}: € " . number_format($invoice->total_amount, 2, ',', '.'));
            }

            if ($this->confirm("Vuoi inviare il sollecito a questo cliente?")) {
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

                    $this->info("Email inviata con successo");
                } catch (\Exception $e) {
                    $this->error("Errore nell'invio dell'email: {$e->getMessage()}");
                }
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
                $this->line("Fattura {$invoice->invoice_number} associata al cliente {$client->name}");
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
