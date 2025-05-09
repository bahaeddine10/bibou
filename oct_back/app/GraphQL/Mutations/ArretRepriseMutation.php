<?php

namespace App\GraphQL\Mutations;

use App\Models\ArretReprise;
use Illuminate\Support\Facades\Storage;

class ArretRepriseMutation
{
    public function create($_, array $args)
{
    \Log::info('📥 Requête reçue pour createArretReprise');
    \Log::info('📄 Arguments reçus:', $args);

    $storedFiles = [];

    // Vérifie si le champ documents est bien un tableau et contient des fichiers
    if (isset($args['documents']) && is_array($args['documents'])) {
        foreach ($args['documents'] as $file) {
            \Log::info('➡️ Fichier détecté:', ['nom' => $file->getClientOriginalName()]);

            $filename = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('arret_reprise', $filename, 'public');
            $storedFiles[] = $filename;
        }
    } else {
        \Log::warning('⚠️ Aucun document reçu ou documents n\'est pas un tableau');
    }

    \Log::info('📦 Fichiers stockés:', $storedFiles);

    return ArretReprise::create([
        'employee_name' => $args['employee_name'],
        'position'      => $args['position'],
        'matricule'     => $args['matricule'],
        'department'    => $args['department'],
        'departmentId'  => $args['departmentId'],
        'reason'        => $args['reason'],
        'date_time'     => $args['date_time'],
        'type_arret'    => $args['type_arret'],
        'documents'     => $storedFiles,
        'status_chef'   => 0,
        'status_rh'     => 0,
    ]);
}

    

    public function updateChefStatus($_, array $args)
    {
        $arret = ArretReprise::findOrFail($args['id']);
        $arret->status_chef = $args['status_chef'];
        $arret->save();

        return $arret;
    }

    public function updateRHStatus($_, array $args)
    {
        $arret = ArretReprise::findOrFail($args['id']);
        $arret->status_rh = $args['status_rh'];
        $arret->save();

        return $arret;
    }
}
