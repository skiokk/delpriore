<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('email_settings', function (Blueprint $table) {
            $table->id();
            $table->integer('days_before_reminder')->default(30);
            $table->text('email_template');
            $table->string('email_subject');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('email_settings');
    }
};
