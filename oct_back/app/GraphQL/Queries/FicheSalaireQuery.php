<?php

namespace App\GraphQL\Queries;

use Illuminate\Support\Facades\DB;

class FicheSalaireQuery
{
    public function resolve($root, array $args)
    {
        $idt_matag = $args['idt_matag'];
        $annee = $args['annee'];
        $mois = $args['mois'];

        $salaryData = DB::connection('oracle')
            ->table('GRH_OCT.MVTPAIE as m')
            ->join('GRH_OCT.INDEM as i', 'm.IND_CODE', '=', 'i.IND_CODE')
            ->select(
                'm.IND_CODE as ind_code',
                DB::raw("CASE WHEN m.MVP_NBR IS NOT NULL THEN i.IND_DSG || ' (' || m.MVP_NBR || ')' ELSE i.IND_DSG END as ind_dsg"),
                'm.MVP_MNT as mvp_mnt',
                'm.SENS as sens',
                'i.FAMILLE as famille'
            )
            
            ->where('m.IDT_MATAG', $idt_matag)
            ->where('m.ANN_AN', $annee)
            ->where('m.NMM_CODE', $mois)
            ->whereNotNull('m.MVP_MNT')
            ->get();

        $gains_fixe = $salaryData->filter(fn($r) => $r->sens == 1 && in_array($r->famille, [1, 2, 3, 4, 5]))->values();
        $gains_variable = $salaryData->filter(fn($r) => $r->sens == 1 && !in_array($r->famille, [1, 2, 3, 4, 5]))->values();
        $retenues_fixe = $salaryData->filter(fn($r) => $r->sens == 2 && in_array($r->famille, [1, 2, 3, 4, 5]))->values();
        
        $retenues_variable = $salaryData
            ->filter(fn($r) => $r->sens == 2 && !in_array($r->famille, [1, 2, 3, 4, 5]) && $r->ind_code != 999999) // ❗ EXCLUDE 999999
            ->values();

        $salaire_brut = optional($salaryData->firstWhere('ind_code', 99999))->mvp_mnt ?? 0;
        $net_a_payer = optional($salaryData->firstWhere('ind_code', 999999))->mvp_mnt ?? 0;

        return [
            'gains_fixe' => $gains_fixe,
            'gains_variable' => $gains_variable,
            'retenues_fixe' => $retenues_fixe,
            'retenues_variable' => $retenues_variable,
            'salaire_de_base' => $salaryData->firstWhere('ind_code', 1001),
            'prc' => $salaryData->firstWhere('ind_code', 1042),
            'salaire_brut' => $salaire_brut,
            'net_a_payer' => $net_a_payer,
            'cum_imposable' => null,
            'cum_irpp' => null,
            'retenues_sociales' => [],
            'capital_deces' => [],
        ];
    }
}
