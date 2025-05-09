<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use App\Models\IdTagent;
use Illuminate\Support\Facades\Hash;

class SignupMutation
{
    public function __invoke($root, array $args)
    {
        //throw new \Exception('Matricule does not exist in the agent records.');
        // Validate email uniqueness
        if (User::where('email', $args['email'])->exists()) {
            throw new \Exception('Email already exists.');
        }

        // Validate matricule uniqueness
        if (User::where('matricule', $args['matricule'])->exists()) {
            throw new \Exception('Matricule already exists.');
        }

        // Fetch the agent from Oracle
        $agent = IdTagent::where('IDT_MATAG', $args['matricule'])->first();
        if (!$agent) {
            throw new \Exception('Matricule does not exist in the agent records.');
        }

        // Get the department ID (UFA code) from the agent
        $ufaCode = $agent->ufa;

        // Fetch the department name from UFA table
        $ufaLabel = \DB::connection('oracle')
            ->table('UFA')
            ->where('CODE_UFA', $ufaCode)
            ->value('LIB_UFA');
        if (!$ufaLabel) {
            throw new \Exception('UFA department label not found.');
        }

        // Create the user
        $user = User::create([
            'nom' => $agent->idt_nomag,
            'prenom' => $agent->idt_prnag,
            'email' => $args['email'],
            'password' => Hash::make($args['password']),
            'matricule' => $args['matricule'],
            'department' => $ufaLabel,
            'departmentId' => $ufaCode,
            'isValidator' => false,
        ]);
     // Assign default module (ID 1)
\DB::table('role')->insert([
    'users_id' => $user->id,
    'module_id' => 1
]);

        
        // Generate access token
        $tokenResult = $user->createToken('Personal Access Token');
        $token = $tokenResult->accessToken;
        $expiresIn = $tokenResult->token->expires_at->getTimestamp();

        return [
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => $expiresIn,
            'user' => $user,
        ];
    }
}
