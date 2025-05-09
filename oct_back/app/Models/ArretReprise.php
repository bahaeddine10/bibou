<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArretReprise extends Model
{
    use HasFactory;

    protected $table = 'arret_reprise'; // Explicit table name

    protected $fillable = [
        'employee_name',
        'position',
        'department',
        'matricule',
        'departmentId',
        'reason',
        'date_time',
        'type_arret',
        'documents', // <-- changé de 'document' à 'documents'
        'status_chef',
        'status_rh',
        'created_at',
        'updated_at',
    ];
    
    protected $casts = [
        'documents' => 'array', // <-- pour cast en tableau
    ];
    
    public function getDocumentUrlAttribute()
    {
        if (!$this->documents) return [];
        return array_map(function ($doc) {
            return asset('storage/arret_reprise/' . $doc);
        }, $this->documents);
    }
    
    protected $appends = ['document_url'];
    

}
