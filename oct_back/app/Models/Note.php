<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    protected $table = 'notes';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'matricule',
        'annee',
        'note',
        'noteAnnTr1',
        'noteAnnTr2',
        'noteAnnTr3',
        'noteAnnTr4',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'annee' => 'integer',
        'note' => 'float',
        'noteAnnTr1' => 'float',
        'noteAnnTr2' => 'float',
        'noteAnnTr3' => 'float',
        'noteAnnTr4' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Valeurs par défaut pour les nouvelles instances du modèle.
     *
     * @var array
     */
    protected $attributes = [
        'note' => 0.0, // Conservez une valeur par défaut si pertinent
        'noteAnnTr1' => 0.0, // Ou null
        'noteAnnTr2' => 0.0, // Ou null
        'noteAnnTr3' => 0.0, // Ou null
        'noteAnnTr4' => 0.0, // Ou null
    ];
} 