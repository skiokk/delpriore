<?php

namespace App\Http\Controllers;

use App\Models\EmailSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;


class EmailSettingController extends Controller
{
    public function edit()
    {
        $settings = EmailSetting::first() ?? new EmailSetting([
            'days_before_reminder' => 30,
            'email_subject' => 'Sollecito pagamento fatture scadute',
            'email_template' => "Gentile {cliente},\n\n" .
                "La presente per ricordarLe il pagamento delle seguenti fatture scadute:\n\n" .
                "{fatture}\n" .
                "Per un totale di € {totale}\n\n" .
                "La preghiamo di provvedere al pagamento quanto prima.\n\n" .
                "Cordiali saluti"
        ]);

        return view('settings.email', compact('settings'));
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'days_before_reminder' => 'required|integer|min:1',
            'email_subject' => 'required|string|max:255',
            'email_template' => 'required|string'
        ]);

        $settings = EmailSetting::first() ?? new EmailSetting();
        $settings->fill($validated);
        $settings->save();

        return redirect()->back()->with('success', 'Impostazioni aggiornate con successo');
    }

    public function testEmail(Request $request)
    {
        try {
            $settings = EmailSetting::first();
            if (!$settings) {
                return response()->json(['error' => 'Impostazioni email non configurate'], 400);
            }

            // Creiamo dati di esempio
            $testData = [
                'cliente' => 'Cliente di Test',
                'fatture' => [
                    [
                        'numero' => 'F123',
                        'data' => '01/01/2024',
                        'importo' => '1.000,00'
                    ],
                    [
                        'numero' => 'F124',
                        'data' => '15/01/2024',
                        'importo' => '500,00'
                    ]
                ],
                'totale' => '1.500,00'
            ];

            // Prepariamo il contenuto dell'email
            $emailContent = $settings->email_template;

            // Sostituiamo il nome del cliente
            $emailContent = str_replace('{cliente}', $testData['cliente'], $emailContent);

            // Prepariamo la lista delle fatture
            $fattureHtml = "";
            foreach ($testData['fatture'] as $fattura) {
                $fattureHtml .= "Fattura n. {$fattura['numero']} del {$fattura['data']}: € {$fattura['importo']}\n";
            }
            $emailContent = str_replace('{fatture}', $fattureHtml, $emailContent);

            // Sostituiamo il totale
            $emailContent = str_replace('{totale}', $testData['totale'], $emailContent);

            // Inviamo l'email di test
            Mail::raw($emailContent, function ($message) use ($settings) {
                $message->to(config('mail.from.address'))
                    ->subject('[TEST] ' . $settings->email_subject);
            });

            return response()->json(['message' => 'Email di test inviata con successo']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Errore nell\'invio dell\'email: ' . $e->getMessage()], 500);
        }
    }
}
