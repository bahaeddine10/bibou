<?php

namespace App\GraphQL\Queries;

use App\Models\IdTagent;
use Illuminate\Support\Facades\Log;

class ChauffeursQuery {
    public function resolve(): array {
        $chauffeurs = IdTagent::where('IDT_POS_CODE', 15)
            ->whereIn('IDT_EMP_CODE', [7, 19, 20, 33, 42])
            ->where(function ($query) {
                $query->whereNull('RGH_TYPE')
                      ->orWhereRaw("TRIM(RGH_TYPE) != 'D'");
            })
            ->get()
            ->map(function ($agent) {
                Log::info('[CHAUFFEUR_RAW]', $agent->getAttributes());
            
                return [
                    'IDT_MATAG' => $agent->idt_matag,
                    'IDT_NOMAG' => $agent->idt_nomag,
                    'IDT_PRNAG' => $agent->idt_prnag,
                ];
            })
            
            
            ->toArray();

        return $chauffeurs;
    }
}

