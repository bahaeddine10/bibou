<?php

namespace App\GraphQL\Resolvers;

use App\Models\IdTagent;
use App\Models\User;

class UserResolver
{
    public function usersByDepartment($_, array $args)
    {
        $departmentId = $args['departmentId'];
        $excludeMatricule = $args['matricule'] ?? null; // 👈 optional but expected
    
        $agents = IdTagent::where('UFA', $departmentId)
                          ->where('IDT_SPOS_CODE', 5) // ✅ en activité
                          ->when($excludeMatricule, function ($query, $excludeMatricule) {
                              return $query->where('IDT_MATAG', '!=', $excludeMatricule);
                          })
                          ->get();
    
        return $agents->map(function ($agent) {
            return [
                'matricule' => $agent->idt_matag,
                'nom'       => $agent->idt_nomag,
                'prenom'    => $agent->idt_prnag,
            ];
        })->values();
    }
    public function activeUsers()
{
    $agents = IdTagent::where('IDT_SPOS_CODE', 5) // ✅ Actif uniquement
                      ->get();

    return $agents->map(function ($agent) {
        return [
            'matricule' => $agent->idt_matag,
            'nom'       => $agent->idt_nomag,
            'prenom'    => $agent->idt_prnag,
        ];
    })->values();
}

    
    public function allUsers()
    {
        return User::with('modules')->get();
    }
}
