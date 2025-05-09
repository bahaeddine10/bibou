<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeDemandeGenerale extends Model
{
    use HasFactory;

    protected $table = 'type_demande_generale';

    protected $fillable = ['name'];

    public $timestamps = false; // optional if you don't use created_at/updated_at
}
