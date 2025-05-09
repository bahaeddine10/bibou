<?php

namespace App\GraphQL\Queries;

use Illuminate\Support\Facades\DB;

class TestMvtPaieQuery
{
    public function resolve($root, array $args)
    {
        return DB::connection('oracle')
            ->table('GRH_OCT.MVTPAIE')
            ->select(
                'IDT_MATAG as idt_matag',
                'MOIS_P as mois_p',
                'ANNEE_P as annee_p',
                'MVP_DATECH as mvp_datech',
                'MVP_MNT as mvp_mnt',
                'NUM_PAIE as num_paie'
            )
            ->where('IDT_MATAG', $args['idt_matag'])
            ->limit(20)
            ->get();
    }
}
