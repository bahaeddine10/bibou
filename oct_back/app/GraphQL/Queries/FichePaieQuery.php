<?php

namespace App\GraphQL\Queries;

use App\Models\IdTagent;
use Illuminate\Support\Facades\DB;

class FichePaieQuery
{
    public function resolve($root, array $args)
    {
        $idt_matag = $args['idt_matag'];
        $annee = $args['annee'];
        $mois = $args['mois'];

        // USE THE MODEL
        $rawIdentity = IdTagent::where('IDT_MATAG', (int) $idt_matag)->first();

        if (!$rawIdentity) {
            return null;
        }

        $posteLabel = optional(DB::connection('oracle')->table('GRH_OCT.POS')->where('POS_CODE', $rawIdentity->IDT_POS_CODE)->first())->POS_DSG;
        $sousPosteLabel = optional(DB::connection('oracle')
        ->table('GRH_OCT.SOUPOS')
        ->where('SPS_CODE', $rawIdentity->IDT_SPOS_CODE)  
        ->first())->SPS_DSG;
            $bankLabel = optional(DB::connection('oracle')->table('GRH_OCT.BANQUE')->where('BNQ_CODE', $rawIdentity->IDT_BNK)->first())->BNQ_DSG;
        $emploiLabel = optional(DB::connection('oracle')->table('GRH_OCT.EMPLOI_DT')->where('EMP_CODE', $rawIdentity->IDT_EMP_CODE)->first())->EMP_DSG;
        $fonctionLabel = optional(DB::connection('oracle')->table('GRH_OCT.FONCTION_DT')->where('FON_CODE', $rawIdentity->IDT_FON_CODE)->first())->FON_DSG;

        $gender = ($rawIdentity->IDT_SXAGE == 1) ? 'M' : 'F';

        $nbrEnfants = DB::connection('oracle')
            ->table('GRH_OCT.PAIE_MOIS')
            ->where('IDT_MATAG', $idt_matag)
            ->where('ANNEE', $annee)
            ->where('MOIS', $mois)
            ->value('NBR_ENF_ALLOC') ?? 0;

        $salaryData = DB::connection('oracle')
            ->table('GRH_OCT.MVTPAIE as m')
            ->join('GRH_OCT.INDEM as i', 'm.IND_CODE', '=', 'i.IND_CODE')
            ->select(
                'm.IND_CODE as ind_code',
                'i.IND_DSG as ind_dsg',
                'm.MVP_MNT as mvp_mnt',
                'm.SENS as sens',
                'i.IND_TYPE as ind_type'
            )
            ->where('m.IDT_MATAG', $idt_matag)
            ->where('m.ANN_AN', $annee)
            ->where('m.NMM_CODE', $mois)
            ->whereNotNull('m.MVP_MNT')
            ->get();

        $gains_fixe = $salaryData->filter(fn($r) => $r->sens == 1 && $r->ind_type == 0)->values();
        $gains_variable = $salaryData->filter(fn($r) => $r->sens == 1 && $r->ind_type == 1)->values();
        $retenues_fixe = $salaryData->filter(fn($r) => $r->sens == 2 && $r->ind_type == 0)->values();
        $retenues_variable = $salaryData->filter(fn($r) => $r->sens == 2 && $r->ind_type == 1)->values();

        $salaire_brut = optional($salaryData->firstWhere('ind_code', 99999))->mvp_mnt ?? 0;
        $net_a_payer = optional($salaryData->firstWhere('ind_code', 999999))->mvp_mnt ?? 0;

        return [
            'identity' => [
                'IDT_MATAG' => $rawIdentity->IDT_MATAG,
                'NOM' => $rawIdentity->IDT_NOMAG,
                'PRENOM' => $rawIdentity->IDT_PRNAG,
                'POSTE' => $posteLabel,
                'SOUS_POSTE' => $sousPosteLabel,
                'BANQUE' => $bankLabel,
                'RIB' => $rawIdentity->RIB,
                'CATEGORIE' => $rawIdentity->IDT_CATEGORIE,
                'ECHELLE' => $rawIdentity->GRP_CATEG,
                'ECHELON' => $rawIdentity->IDT_CHO_CODE,
                'DATE_ECHELON' => $rawIdentity->IDT_DATE_CHO,
                'DATE_CATEGORIE' => $rawIdentity->IDT_DATE_CAT,
                'DATE_POSTE' => $rawIdentity->IDT_DATE_POS,
                'DATE_SOUS_POSTE' => $rawIdentity->IDT_DATE_SPOS,
                'CLASSE' => $rawIdentity->IDT_CLASSEP,
                'DATE_CLASSE' => $rawIdentity->IDT_DATE_CLASSEP,
                'SEXE' => $gender,
                'NOMBRE_ENFANTS' => $nbrEnfants,
                'IDENTIFIANT_UNIQUE' => $rawIdentity->IDT_MATAS,
                'EMPLOI' => $emploiLabel,
                'FONCTION' => $fonctionLabel,
            ],
            'gains_fixe' => $gains_fixe,
            'gains_variable' => $gains_variable,
            'retenues_fixe' => $retenues_fixe,
            'retenues_variable' => $retenues_variable,
            'salaire_brut' => $salaire_brut,
            'net_a_payer' => $net_a_payer,
        ];
    }
}
