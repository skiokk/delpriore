<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained();
            $table->date('sent_date');
            $table->text('email_content');
            $table->json('invoices_included'); // Array di ID fatture incluse nell'email
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('email_logs');
    }
};
