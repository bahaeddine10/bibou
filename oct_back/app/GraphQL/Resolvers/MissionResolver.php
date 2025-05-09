<?php

namespace App\GraphQL\Resolvers;

use App\Models\Mission;
use Illuminate\Support\Facades\Log;

class MissionResolver
{
    // Résoudre la création d'une mission
    public function resolveCreateMission($_, array $args)
    {
        return Mission::create([
            'datedebut' => $args['datedebut'],
            'datefin' => $args['datefin'],
            'fromlocation' => $args['fromlocation'],
            'tolocation' => $args['tolocation'],
            'sujet' => $args['sujet'],
            'nom' => $args['nom'] ,
            'matricule' => $args['matricule'] ,
            'fonction' => $args['fonction'] ,
            'department' => $args['department'] ,
            'residence' => $args['residence'] ,
            'accompagnant' => $args['accompagnant'] ,


        ]);
    }
    
    

    // Résoudre la récupération d'une mission par son ID
    public function resolveMissionById($root, array $args)
    {
        return Mission::find($args['id']);
    }


    public function updateStatusRH($_, array $args)
{
    $mission = Mission::findOrFail($args['id']);
    $mission->statusrh = $args['statusrh'];
    $mission->save();
    return $mission;
}

public function updateStatusDMB($_, array $args)
{
    $mission = Mission::findOrFail($args['id']);
    $mission->statusdmb = $args['statusdmb'];
    if (isset($args['voiture'])) {
        $mission->voiture = $args['voiture'];
    }
    if (isset($args['chauffeur'])) {
        $mission->chauffeur = $args['chauffeur'];
    }
    $mission->save();
    return $mission;
}

public function resolveAllMissions()
{
    return Mission::all();
}

public function resolveMissionsByMatricule($_, array $args)
{
    return Mission::where('matricule', $args['matricule'])->get();
}

}
