<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmailSetting;

class EmailSettingsSeeder extends Seeder
{
    public function run()
    {
        EmailSetting::create([
            'days_before_reminder' => 30,
            'email_subject' => 'Sollecito pagamento fatture scadute',
            'email_template' => "Gentile {cliente},\n\n" .
                "La presente per ricordarLe il pagamento delle seguenti fatture scadute:\n\n" .
                "{fatture}\n\n" .
                "Per un totale di € {totale}\n\n" .
                "La preghiamo di provvedere al pagamento quanto prima.\n\n" .
                "Cordiali saluti"
        ]);
    }
}