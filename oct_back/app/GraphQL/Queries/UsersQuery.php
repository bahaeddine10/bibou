<?php

namespace App\GraphQL\Queries;


use Illuminate\Support\Facades\DB;

class UsersQuery
{
    /**
     * Retrieve all users from the Oracle database.
     *
     * @return array
     */
    public function __invoke()
    {
        // Fetch specific fields from the users table in the Oracle database
        $users = DB::connection('oracle')->table('GRH_OCT.IDTAGENT')
            ->select('IDT_MATAG') // specify the fields you want
            ->get();
        
        // Prepare an array to hold formatted users
        $formattedUsers = [];

        // Loop through each user and format the data
        foreach ($users as $user) {
            $formattedUsers[] = [
                'IDT_MATAG' => $user->IDT_MATAG,   // Access properties using -> instead of []
            ];
        }
        
        // Return the formatted results as an array
        return $formattedUsers;
    }
}