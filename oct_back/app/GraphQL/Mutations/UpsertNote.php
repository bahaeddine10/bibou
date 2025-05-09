<?php

namespace App\GraphQL\Mutations;

use App\Models\Note;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;
use Illuminate\Support\Facades\Log; // Optional for debugging

class UpsertNote
{
    /**
     * Resolve the mutation.
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
        $trimestre = $input['trimestre'];
        $noteTrimestre = $input['note_trimestre'];

        $noteColumn = 'noteAnnTr' . $trimestre;

        $note = Note::firstOrNew(
            [
                'matricule' => $matricule,
                'annee' => $annee,
            ]
        );

        // Met à jour SEULEMENT la note pour le trimestre spécifique
        $note->{$noteColumn} = $noteTrimestre;

        // ---- SUPPRESSION DE LA LOGIQUE DE CALCUL POUR 'note' ----
        // Le champ 'note' global n'est pas affecté par cette mutation.
        // Il doit être mis à jour via la mutation 'updateNotes'.
        // ---- FIN DE LA SUPPRESSION ----

        $note->save();

        return $note;
    }
} 