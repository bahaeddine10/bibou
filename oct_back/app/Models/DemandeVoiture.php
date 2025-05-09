<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeVoiture extends Model
{
    use HasFactory;

    protected $table = 'demande_voiture';

    protected $fillable = [
        'nom',
        'matricule',
        'date_debut',
        'date_fin',
        'accompagnant',
        'departmentId',
        'status_chef',
        'status_dmb',
        'chauffeur',
        'voiture_matricule',
    ];

    public $timestamps = true;
}
