<?php
// app/GraphQL/Mutations/DemandeVoitureMutation.php

namespace App\GraphQL\Mutations;

use App\Models\DemandeVoiture;

class DemandeVoitureMutation
{
    public function create($_, array $args)
    {
        return DemandeVoiture::create([
            'nom' => $args['nom'],
            'matricule' => $args['matricule'],
            'date_debut' => $args['date_debut'],
            'date_fin' => $args['date_fin'],
            'accompagnant' => $args['accompagnant'] ?? null,
            'departmentId' => $args['departmentId'],
            'status_chef' => 0,
            'status_dmb' => 0,
            'chauffeur' => null,
            'voiture_matricule' => null,
        ]);
    }

    public function updateChefStatus($_, array $args)
    {
        $demande = DemandeVoiture::findOrFail($args['id']);
        $demande->status_chef = $args['status_chef'];
        $demande->save();

        return $demande;
    }

    public function updateDmbStatus($_, array $args)
    {
        $demande = DemandeVoiture::findOrFail($args['id']);
        $demande->status_dmb = $args['status_dmb'];
        $demande->chauffeur = $args['chauffeur'];
        $demande->voiture_matricule = $args['voiture_matricule'];
        $demande->save();

        return $demande;
    }
}
