<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MvtCong extends Model
{
    protected $connection = 'oracle'; // Connect to the Oracle database
    protected $table = 'GRH_OCT.MVTCON'; // Full table name
    protected $primaryKey = null; // No real primary key
    public $incrementing = false; // No auto-incrementing
    public $timestamps = false;   // No Laravel timestamps

    // Define the correct field names as lowercase
    protected $fillable = [
        'idt_matag',
        'mvc_datdeb',
        'mvc_datfin',
    ];

    // Cast dates properly
    protected $casts = [
        'mvc_datdeb' => 'datetime:Y-m-d',
        'mvc_datfin' => 'datetime:Y-m-d',
    ];
}
