<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoldeConge extends Model
{
    protected $connection = 'oracle'; // Specify the connection to Oracle
    protected $table = 'GRH_OCT.DROIT_CONGE'; // Table name in Oracle
    protected $primaryKey = 'IDT_MATAG'; // Adjust based on your primary key if needed
    public $incrementing = false; // If the primary key is not auto-incremented

    // Define the fields you want to access
    protected $fillable = [
        'ANN_AN',
        'IDT_MATAG',
        'DCG_MOIS',
        'DCG_DROIT',
        'DCG_PRIS',
        'DCG_VALIDE',
        'UTIL',
        'OP',
        'DATOP',
        'REST_DIV',
        'CUM_ABS',
        'TP',
        'DT_FIN',
    ];

    // Optionally, if necessary, you can define casts for the fields
    protected $casts = [
        'ANN_AN' => 'string',
        'IDT_MATAG' => 'string',
        'DCG_MOIS' => 'integer', // Assuming this is an integer for month
        'DCG_DROIT' => 'float',   // Adjust type as needed
        'DCG_PRIS' => 'float',     // Adjust type as needed
        'DCG_VALIDE' => 'boolean',  // Assuming this is a boolean
        'UTIL' => 'string',
        'OP' => 'string',
        'DATOP' => 'datetime',      // Assuming this is a datetime
        'REST_DIV' => 'float',
        'CUM_ABS' => 'float',
        'TP' => 'string',
        'DT_FIN' => 'date',        // Assuming this is a date
    ];

    // You can also add any additional methods here for querying or business logic
}