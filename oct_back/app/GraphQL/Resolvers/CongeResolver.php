<?php

namespace App\GraphQL\Resolvers;

use App\Models\Conge;
use App\Models\User;
use Illuminate\Support\Facades\DB;


class CongeResolver {
    public function resolveConges($root, array $args)
    {
        $conges = Conge::all();
    
        return $conges->map(function ($conge) {
            $conge->type_label = DB::connection('oracle')
                ->table('GRH_OCT.TYPCONG')
                ->where('TYC_TYPE', $conge->typeconge)
                ->value('TYC_DSG');
    
            if ($conge->certificat) {
                $conge->certificat_url = asset('storage/' . $conge->certificat);
            }
    
            return $conge;
        });
    }

    

    public function resolveCongesByMatricule($root, array $args)
    {
        $conges = Conge::where('matricule', $args['matricule'])->get();
    
        return $conges->map(function ($conge) {
            $conge->type_label = DB::connection('oracle')
                ->table('GRH_OCT.TYPCONG')
                ->where('TYC_TYPE', $conge->typeconge)
                ->value('TYC_DSG');
    
            $conge->certificat_url = asset('storage/' . $conge->certificat);
    
            return $conge;
        });
    }
    

    public function resolveCongesByDepartment($_, array $args)
{
    $usersInSameDept = User::where('departmentId', $args['departmentId'])->pluck('matricule');

    $conges = Conge::whereIn('matricule', $usersInSameDept)
                ->where('etatchef', 0) // Only show those with "en attente" status
                ->get();

    return $conges->map(function ($conge) {
        $conge->type_label = DB::connection('oracle')
            ->table('GRH_OCT.TYPCONG')
            ->where('TYC_TYPE', $conge->typeconge)
            ->value('TYC_DSG');

        $conge->certificat_url = $conge->certificat ? asset('storage/' . $conge->certificat) : null;

        return $conge;
    });
}


    // Query for RH
    public function resolveAllConges()
    {
        // Return all conges where etat chef accepté
        $conges = Conge::where('etatchef', 1)->get();

        // Add the full URL for the certificat field
        return $conges->map(function ($conge) {
            $conge->certificat_url = asset('storage/' . $conge->certificat);
            return $conge;
        });
    }
}
