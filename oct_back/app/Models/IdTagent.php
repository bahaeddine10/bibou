<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class IdTagent extends Model
{
    protected $connection = 'oracle'; // Connection to Oracle DB
    protected $table = 'idtagent';
    protected $primaryKey = 'IDT_MATAG'; // Primary key
    public $incrementing = false;     // No auto-increment
    public $timestamps = false;       // No timestamps (created_at, updated_at)

    // Here the fields you want to allow mass assignment
    protected $fillable = [
        'IDT_MATAG',
        'IDT_NOMAG',
        'IDT_PRNAG',
        'IDT_NOMAGAR',
        'IDT_PRNAGAR',
        'IDT_POS_CODE',
        'IDT_SPOS_CODE',
        'IDT_BNK',
        'RIB',
        'IDT_CATEGORIE',
        'GRP_CATEG',
        'IDT_CHO_CODE',
        'IDT_DATE_CHO',
        'IDT_DATE_CAT',
        'IDT_DATE_POS',
        'IDT_DATE_SPOS',
        'IDT_CLASSEP',
        'IDT_DATE_CLASSEP',
        'IDT_SXAGE',
        'IDT_MATAS',
        'IDT_EMP_CODE',
        'IDT_FON_CODE',
        'IDT_CIN',
        'IDT_ADHERENT',
        'IDT_ADRES',
        'IDT_DATREC',
        'IDT_DATTIT',
        'IDT_DATE_FON',
        'RGH_TYPE',
        'IDT_DATNAIS',
        'UFA',

    ];

    // Very important: Eloquent uses lowercase attributes!
    protected $casts = [
        'IDT_MATAG' => 'string', // To avoid integer/leading zero problems
    ];

    protected $guarded = []; // allow all attributes

    public function getAttribute($key)
{
    // Try normal lowercase
    if (array_key_exists($key, $this->attributes)) {
        return parent::getAttribute($key);
    }

    // Try UPPERCASE Oracle style
    $upperKey = strtoupper($key);
    if (array_key_exists($upperKey, $this->attributes)) {
        return $this->attributes[$upperKey];
    }

    // Debug log if not found
    Log::warning("[IDTAGENT] Attribute '{$key}' not found in: " . json_encode(array_keys($this->attributes)));
    
    return parent::getAttribute($key);
}
    

}
