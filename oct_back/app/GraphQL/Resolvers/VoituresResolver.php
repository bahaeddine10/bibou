<?php

namespace App\GraphQL\Resolvers;

use App\Models\Voiture;

class VoituresResolver
{
    public function all(): array
    {
        return Voiture::all()->toArray();
    }

    public function byId($_, array $args): ?Voiture
    {
        return Voiture::find($args['id']);
    }

    public function create($_, array $args): Voiture
    {
        return Voiture::create($args);
    }

    public function update($_, array $args): ?Voiture
    {
        $voiture = Voiture::findOrFail($args['id']);
        $voiture->update($args);
        return $voiture;
    }

    public function delete($_, array $args): bool
    {
        $voiture = Voiture::findOrFail($args['id']);
        return $voiture->delete();
    }
}
