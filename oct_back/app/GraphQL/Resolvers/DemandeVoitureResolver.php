<?php

namespace App\GraphQL\Resolvers;

use App\Models\DemandeVoiture;

class DemandeVoitureResolver
{
    public function all()
    {
        return DemandeVoiture::all();
    }

    public function byMatricule($_, array $args)
    {
        return DemandeVoiture::where('matricule', $args['matricule'])->get();
    }

    public function byDepartment($_, array $args)
    {
        return DemandeVoiture::where('departmentId', $args['departmentId'])->get();
    }
}
