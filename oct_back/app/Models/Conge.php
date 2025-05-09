<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conge extends Model
{
    use HasFactory;

    protected $table = 'conges'; // Explicitly defining the table

    protected $fillable = [
        'id',
        'nom',
        'prenom',
        'matricule',  // Make sure this is included in fillable
        'datedebut',
        'datefin',
        'duree',
        'etatchef',
        'etatrh',
        'typeconge',
        'certificat',
        'replacementName',       // ✅ nouveau
        'replacementMatricule',   // ✅ nouveau
        'datedebutchef',
        'datefinchef',
        'chefName',
        'chefID'
    ];
    
}
