<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'client_id',
        'invoice_number',
        'invoice_date',
        'customer_name',
        'address',
        'residence',
        'province',
        'tax_code',
        'taxable_amount',
        'vat_amount',
        'exempt_amount',
        'total_amount'
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'taxable_amount' => 'decimal:2',
        'vat_amount' => 'decimal:2',
        'exempt_amount' => 'decimal:2',
        'total_amount' => 'decimal:2'
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
