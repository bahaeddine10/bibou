<?php

namespace App\GraphQL\Resolvers;

use App\Models\UserOracle;

class UsersResolver
{
    /**
     * Resolve the users data from the Oracle database.
     *
     * @return array
     */
    public function resolveUsers($root, array $args)
    {
        // Fetch users using the correct column names
        $users = UserOracle::select('IDT_MATAG')->get();

        // Ensure correct field names for GraphQL schema
        return $users->map(function ($user) {
            return [
                'IDT_MATAG' => $user->IDT_MATAG,     // Use lowercase, matching database results
            ];
        })->toArray(); // Convert to array for GraphQL response
    }
}
