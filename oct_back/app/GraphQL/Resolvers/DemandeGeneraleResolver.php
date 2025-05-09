<?php

namespace App\GraphQL\Resolvers;

use App\Models\DemandeGenerale;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\TypeDemandeGenerale;

class DemandeGeneraleResolver
{
    // 🔍 Affiche toutes les demandes
    public function resolveAll(): \Illuminate\Database\Eloquent\Collection
    {
        $demandes = DemandeGenerale::all();
    
        return $demandes->map(function ($demande) {
            // Ajouter le libellé du type depuis la table type_demande_generale
            $demande->type_label = DB::table('type_demande_generale')
                ->where('id', $demande->type)
                ->value('name');
    
            // Ajouter l'URL du document
            $demande->document_url = $demande->document
                ? asset('storage/demande_generale/' . $demande->document)
                : null;
    
            return $demande;
        });
    }
    // 🔍 Affiche par matricule
    public function resolveByMatricule($rootValue, array $args)
    {
        $demandes = DemandeGenerale::where('matricule', $args['matricule'])->get();
    
        return $demandes->map(function ($demande) {
            $demande->type_label = DB::table('type_demande_generale')
                ->where('id', $demande->type)
                ->value('name');
    
            $demande->document_url = $demande->document
                ? asset('storage/demande_generale/' . $demande->document)
                : null;
    
            return $demande;
        });
    }

    // ➕ Crée une nouvelle demande générale (document est null ici)
    public function create($rootValue, array $args)
    {
        return DemandeGenerale::create([
            'nom' => $args['nom'],
            'prenom' => $args['prenom'],
            'matricule' => $args['matricule'],
            'type' => $args['type'],
            'department' => $args['department'],
            'fonction' => $args['fonction'],
            'status' => "0",
            'date_soumission' => now(),
            'date_traitement' => null,
            'document' => null,
        ]);
    }

    // ✅ Met à jour le statut + ajoute le document s'il existe
    public function update($rootValue, array $args)
    {
        $demande = DemandeGenerale::findOrFail($args['id']);

        // Upload du fichier si fourni
        if (isset($args['document']) && $args['document'] instanceof UploadedFile) {
            $file = $args['document'];
            $extension = $file->getClientOriginalExtension();
            $fileName = 'demande_' . $demande->id . '.' . $extension;

            // Stocker dans storage/app/public/demande_generale
            $file->storeAs('demande_generale', $fileName, 'public');

            // Enregistrer dans la base uniquement le nom
            $demande->document = $fileName;
        }

        // Mise à jour du statut et de la date
        $demande->status = $args['status'];
        $demande->date_traitement = now();
        $demande->save();

        return $demande;
    }
    public function types()
{
    return TypeDemandeGenerale::all();
}
}
