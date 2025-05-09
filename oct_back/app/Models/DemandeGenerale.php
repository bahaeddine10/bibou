<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeGenerale extends Model
{
    use HasFactory;

    protected $table = 'demande_generale'; // ✅ table name (you can pluralize if needed)

    protected $fillable = [
        'id',
        'nom',
        'prenom',
        'matricule',
        'type',
        'status',
        'date_soumission',
        'date_traitement',
        'document',
        'department',
        'fonction'
    ];

    public function typeDemande()
{
    return $this->belongsTo(TypeDemandeGenerale::class, 'type');
}

}
