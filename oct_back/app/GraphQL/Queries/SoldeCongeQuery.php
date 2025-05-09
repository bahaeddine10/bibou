<?php

namespace App\GraphQL\Queries;

use Illuminate\Support\Facades\DB;

class SoldeCongeQuery
{
    /**
     * Retrieve the solde from the Oracle database by IDT_MATAG.
     *
     * @param mixed $root
     * @param array $args
     * @return array
     */
    public function resolve($root, array $args)
    {
        // Ensure the args contain the necessary parameters
        if (!isset($args['idt_matag'])) {
            throw new \Exception('Missing required parameter: idt_matag');
        }

        // Fetch records ordered by year descending
        $droitCongeRecords = DB::connection('oracle')->table('GRH_OCT.DROIT_CONGE')
            ->where('IDT_MATAG', $args['idt_matag'])
            ->orderBy('ANN_AN', 'desc')
            ->get();

        // Keep only the last 3 records (latest 3 years)
        $recentYears = array_slice($droitCongeRecords->toArray(), 0, 3);
       
        // Calculate solde: sum of (dcg_droit - dcg_pris), treating NULL as 0
        $solde = 0;

        foreach ($recentYears as $record) {
            $droit = $record->dcg_droit ?? 0;
            $pris = $record->dcg_pris ?? 0;
            $solde += ($droit - $pris);
        }

        // Return the solde
        return [
            'solde' => $solde
        ];
    }
}
