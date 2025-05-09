<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserOracle extends Model
{
    protected $connection = 'oracle'; // Specify the connection to Oracle
    protected $table = 'GRH_OCT.IDTAGENT'; // Just the table name, Oracle will handle the schema
    protected $primaryKey = 'IDT_MATAG'; // Adjust based on your primary key
    public $incrementing = false; // If the primary key is not auto-incremented

    protected $fillable = ['IDT_MATAG']; // Add any other fields you need

    // Optionally, if UTIL is a string, set the casts
    protected $casts = [
        'IDT_MATAG' => 'string',
    ];
}