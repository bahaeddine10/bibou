<?php

namespace App\GraphQL\Queries;

use App\Models\Voiture;

class VoituresQuery
{
    public function resolve(): array
    {
        return Voiture::where('disponibilite', 1)->get()->toArray();
    }
}
