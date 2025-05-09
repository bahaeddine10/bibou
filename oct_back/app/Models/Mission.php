<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mission extends Model
{
    use HasFactory;

    // Le nom de la table dans la base de données
    protected $table = 'mission';

    // Les champs que l'on peut remplir (mass assignment)
    protected $fillable = [
        'id',
        'nom',
        'matricule',
        'fonction',
        'department',
        'datedebut',
        'datefin',
        'fromlocation',
        'tolocation',
        'sujet',
        'statusrh',
        'statusdmb',
        'chauffeur',
        'voiture',
        'residence',
        'accompagnant',
    ];

    // Format des dates
    protected $dates = ['datedebut', 'datefin'];
}
