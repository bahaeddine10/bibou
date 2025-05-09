<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $table = 'module';
    public $timestamps = false;

    protected $fillable = ['name'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'role', 'module_id', 'users_id');
    }
}
