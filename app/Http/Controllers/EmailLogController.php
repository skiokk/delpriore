<?php

namespace App\Http\Controllers;

use App\Models\EmailLog;
use Illuminate\Http\Request;

class EmailLogController extends Controller
{
    public function getContent($id)
    {
        $log = EmailLog::findOrFail($id);
        return response()->json([
            'content' => $log->email_content
        ]);
    }
}
