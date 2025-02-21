<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained()->onDelete('set null');
            $table->string('invoice_number');
            $table->date('invoice_date');
            $table->string('customer_name');
            $table->string('address')->nullable();
            $table->string('residence')->nullable();
            $table->string('province', 2)->nullable();
            $table->string('tax_code')->nullable(); // Codice Fiscale o P.IVA
            $table->decimal('taxable_amount', 10, 2); // Competenze
            $table->decimal('vat_amount', 10, 2); // IVA
            $table->decimal('exempt_amount', 10, 2); // Importi esenti
            $table->decimal('total_amount', 10, 2); // Totale documento
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('invoices');
    }
};
