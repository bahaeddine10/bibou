<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class LoginMutation
{
    public function __invoke($root, array $args)
    {
        // Debug: Log the input email and password
        Log::info('Login attempt:', [
            'email' => $args['email'],
            'password' => $args['password'],
        ]);

        // Find the user by email
        $user = User::where('EMAIL', $args['email'])->first();

        // Debug: Log the user found (if any)
        Log::info('User found:', $user ? $user->toArray() : ['message' => 'No user found']);

        // Check if the user exists
        if (!$user) {
            Log::error('User not found for email:', ['email' => $args['email']]);
            throw new \Exception('Invalid credentials.');
        }

        // Debug: Log the hashed password from the database
        Log::info('Hashed password from database:', ['hashed_password' => $user->getAuthPassword()]);

        // Check if the password is correct
        if (!Hash::check($args['password'], $user->getAuthPassword())) {
            Log::error('Password check failed:', [
                'input_password' => $args['password'],
                'hashed_password' => $user->getAuthPassword(),
            ]);
            throw new \Exception('Invalid credentials.');
        }

        // Generate an access token using Passport
        $tokenResult = $user->createToken('Personal Access Token');
        $token = $tokenResult->accessToken;

        // Convert expires_at to a Unix timestamp (integer)
        $expiresIn = $tokenResult->token->expires_at->getTimestamp();

        return [
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => $expiresIn, // Return the timestamp instead of a DateTime object
            'user' => $user->load('modules'),
        ];
    }
}