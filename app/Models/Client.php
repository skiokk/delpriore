<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'name',
        'type',
        'fiscal_code',
        'vat_number',
        'address',
        'email',
        'phone',
        'mobile',
        'license_number',
        'license_expiry',
        'license_type',
        'notes',
        'is_active'
    ];

    protected $casts = [
        'license_expiry' => 'date',
        'is_active' => 'boolean'
    ];
}
