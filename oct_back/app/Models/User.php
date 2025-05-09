<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'users';
    protected $primaryKey = 'id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'ID',
        'nom',
        'prenom',
        'email',
        'password', // Ensure this matches the database column name
        'matricule', // Add matricule field
        'role',
        'department',
        'isValidator',     // ✅ Added
        'departmentId',    // ✅ Added
        'isSuperAdmin',

    ];

    protected $hidden = [
        'password', // Hide password for security
    ];
    protected $casts = [
        'isValidator' => 'boolean',
        'isSuperAdmin' => 'boolean',
        'departmentId' => 'string',
    ];
    

    // Manually map the PASSWORD field
    public function getAuthPassword()
    {
        return $this->attributes['password']; // Explicitly use the attribute array
    }
    public function modules()
{
    return $this->belongsToMany(Module::class, 'role', 'users_id', 'module_id');
}

    
}