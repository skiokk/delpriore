<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailSetting extends Model
{
    protected $fillable = [
        'days_before_reminder',
        'email_template',
        'email_subject'
    ];
}
