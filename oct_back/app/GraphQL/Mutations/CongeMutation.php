<?php

namespace App\GraphQL\Mutations;

use App\Models\Conge;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\UploadedFile;


class CongeMutation {

    // Create method to handle the file upload and saving it in 'public/certificats'
    public function create($root, array $args)
    {
        // 1. Créer le congé sans certificat pour récupérer l’ID
        $filePath ="";
        $conge = Conge::create([
            'nom' => $args['nom'],
            'prenom' => $args['prenom'],
            'matricule' => $args['matricule'],
            'datedebut' => $args['datedebut'],
            'datefin' => $args['datefin'],
            'datedebutchef' => $args['datedebutchef'],
            'datefinchef' => $args['datefinchef'],
            'duree' => $args['duree'],
            'etatchef' => $args['etatchef'],
            'etatrh' => $args['etatrh'],
            'typeconge' => $args['typeconge'],
            'typecongear' => $args['typecongear'],


            'certificat' => $filePath ? 'certificats/'.$fileName : null,  // Save file path or null
        ]);
    
        // 2. Gérer le certificat s’il existe
        if (isset($args['certificat']) && $args['certificat'] instanceof \Illuminate\Http\UploadedFile) {
            $file = $args['certificat'];
            $extension = $file->getClientOriginalExtension();
            $fileName = $conge->id . '.' . $extension;
    
            $file->storeAs('certificats', $fileName, 'public');
    
            // 3. Mettre à jour le champ certificat dans la base
            $conge->update([
                'certificat' => 'certificats/' . $fileName
            ]);
        }
    
        return $conge;
    }
    
    

    // Update method to handle updating the file if provided
    public function update($root, array $args)
    {
        $conge = Conge::findOrFail($args['id']);

        // Handle file upload if provided
        if (isset($args['certificat'])) {
            $file = $args['certificat'];
            $fileName = time().'_'.$file->getClientOriginalName();
            $filePath = $file->move(public_path('certificats'), $fileName);  // Store the file in the 'public/certificats' folder

            // Update the file path in the database
            $conge->certificat = 'certificats/'.$fileName;  // Save file path relative to 'public'
        }

        // Update other fields
        if (isset($args['nom'])) {
            $conge->nom = $args['nom'];
        }
        if (isset($args['prenom'])) {
            $conge->prenom = $args['prenom'];
        }
        if (isset($args['datedebut'])) {
            $conge->datedebut = $args['datedebut'];
        }
        if (isset($args['datefin'])) {
            $conge->datefin = $args['datefin'];
        }
        if (isset($args['duree'])) {
            $conge->duree = $args['duree'];
        }
        if (isset($args['etatchef'])) {
            $conge->etatchef = $args['etatchef'];
        }
        if (isset($args['etatrh'])) {
            $conge->etatrh = $args['etatrh'];
        }
        if (isset($args['typeconge'])) {
            $conge->typeconge = $args['typeconge'];
        }
        if (isset($args['typecongear'])) {
            $conge->typeconge = $args['typecongear'];
        }

        $conge->save();

        return $conge;
    }

    public function updateByChef($root, array $args)
    {
        $conge = \App\Models\Conge::findOrFail($args['id']);
    
        $conge->update([
            'datedebutchef' => $args['datedebutchef'] ?? $conge->datedebut,
            'datefinchef' => $args['datefinchef'] ?? $conge->datefin,
            'duree' => $args['duree'] ?? $conge->duree,
            'etatchef' => $args['etatchef'] ?? $conge->etatchef,
            'replacementName' => $args['replacementName'] ?? $conge->replacementName,
            'replacementMatricule' => $args['replacementMatricule'] ?? $conge->replacementMatricule,
            'chefID' => $args['chefID'] ?? $conge->chefID,
            'chefName' => $args['chefName'] ?? $conge->chefName,
        ]);
    
        return $conge;
    }
    

    public function updateByRH($root, array $args)
    {
        $conge = Conge::findOrFail($args['id']);
        $conge->etatrh = $args['etatrh'];
        $conge->save();
        return $conge;
    }
}