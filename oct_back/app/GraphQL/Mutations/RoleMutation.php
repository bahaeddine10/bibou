<?php

namespace App\GraphQL\Mutations;

use Illuminate\Support\Facades\DB;

class RoleMutation
{
    public function assignModule($_, array $args)
    {
        // Avoid duplicates
        $exists = DB::table('role')->where('users_id', $args['user_id'])->where('module_id', $args['module_id'])->exists();

        if ($exists) {
            return [
                'success' => false,
                'message' => 'Module already assigned to user.'
            ];
        }

        DB::table('role')->insert([
            'users_id' => $args['user_id'],
            'module_id' => $args['module_id']
        ]);

        return [
            'success' => true,
            'message' => 'Module assigned successfully.'
        ];
    }

    public function removeModule($_, array $args)
    {
        $deleted = DB::table('role')
            ->where('users_id', $args['user_id'])
            ->where('module_id', $args['module_id'])
            ->delete();

        return [
            'success' => $deleted > 0,
            'message' => $deleted ? 'Module removed.' : 'No such module found for user.'
        ];
    }
}
