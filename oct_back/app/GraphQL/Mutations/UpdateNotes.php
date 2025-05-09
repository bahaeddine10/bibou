<?php

namespace App\GraphQL\Mutations;

use App\Models\Note;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use Illuminate\Support\Arr;

class UpdateNotes
{
    /**
     * Met à jour un enregistrement Note existant ou en crée un nouveau.
     *
     * @param  mixed  $root
     * @param  array<string, mixed>  $args
     * @param  \Nuwave\Lighthouse\Support\Contracts\GraphQLContext  $context
     * @param  \GraphQL\Type\Definition\ResolveInfo  $resolveInfo
     * @return \App\Models\Note
     */
    public function resolve($root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): Note
    {
        $input = $args['input'];
        $matricule = $input['matricule'];
        $annee = $input['annee'];

        // Attributs pour rechercher/identifier l'enregistrement
        $findAttributes = [
            'matricule' => $matricule,
            'annee' => $annee,
        ];

        // Champs de note pouvant être mis à jour ou créés
        $noteFields = ['note', 'noteAnnTr1', 'noteAnnTr2', 'noteAnnTr3', 'noteAnnTr4'];
        $valuesToUpdateOrCreate = [];

        // Prépare les données à mettre à jour/créer uniquement pour les champs fournis dans l'input
        foreach ($noteFields as $field) {
            if (Arr::has($input, $field)) {
                 // Si vous voulez permettre de définir explicitement à null:
                 // $valuesToUpdateOrCreate[$field] = $input[$field];

                 // Si vous préférez ignorer les nulls explicites (ne pas écraser avec null):
                 if ($input[$field] !== null) {
                      $valuesToUpdateOrCreate[$field] = $input[$field];
                 }
            }
        }

        // Utilise updateOrCreate:
        // 1. Cherche une Note avec $findAttributes.
        // 2. Si trouvée, met à jour avec $valuesToUpdateOrCreate.
        // 3. Si non trouvée, crée une nouvelle Note en fusionnant
        //    $findAttributes et $valuesToUpdateOrCreate.
        //    Les valeurs par défaut du modèle pour les champs non fournis seront appliquées.
        $note = Note::updateOrCreate(
            $findAttributes,
            $valuesToUpdateOrCreate
        );

        // Retourne la note mise à jour ou nouvellement créée
        return $note;
    }
} 