<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    protected $fillable = [
        'client_id',
        'sent_date',
        'email_content',
        'invoices_included'
    ];

    protected $casts = [
        'sent_date' => 'date',
        'invoices_included' => 'json'
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
