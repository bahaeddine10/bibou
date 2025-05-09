<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TestTable extends Model
{
    // test cron 1
    //test cron 2 
        //test cron 3

    protected $table = 'C##username.TEST_TABLE'; // Fully qualified table name
    protected $primaryKey = 'ID'; // Explicitly set primary key
    public $incrementing = false; // If ID is not auto-incremented

    protected $fillable = ['ID', 'NAME', 'CREATED_AT'];

    protected $casts = [
        'ID' => 'integer', // Change to integer since your database stores it as a NUMBER
        'CREATED_AT' => 'datetime', // DateTime field is correct
    ];
}
