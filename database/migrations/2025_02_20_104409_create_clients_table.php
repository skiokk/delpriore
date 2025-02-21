<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            // Dati Anagrafici
            $table->string('name');                    // Nome e Cognome o Ragione Sociale
            $table->enum('type', ['private', 'company'])->default('private');
            $table->string('fiscal_code')->nullable(); // Codice Fiscale
            $table->string('vat_number')->nullable();  // Partita IVA

            // Contatti
            $table->string('address')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();       // Telefono fisso
            $table->string('mobile')->nullable();      // Cellulare

            // Documenti
            $table->string('license_number')->nullable();      // Numero patente
            $table->date('license_expiry')->nullable();        // Scadenza patente
            $table->string('license_type')->nullable();        // Tipo patente

            // Extra
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('clients');
    }
};
