<?php

namespace App\GraphQL\Queries;

use App\Models\IdTagent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FicheIdentiteQuery
{
    public function resolve($root, array $args)
    {
        $idt_matag = $args['idt_matag'];

        // Find agent
        $rawIdentity = IdTagent::where('idt_matag', (int) $idt_matag)->first();
        if (!$rawIdentity) {
            Log::error('Agent not found for idt_matag: ' . $idt_matag);
            return null;
        }
    
        // Fetch Conjoint
        $conjoint = DB::connection('oracle')->table('GRH_OCT.CONJOINT')
            ->where('IDT_MATAG', $idt_matag)
            ->first();
    
        // Fetch children with extended info
        $children = DB::connection('oracle')->select("
            SELECT 
                e.ENF_PRN, e.ENF_PRNAR, e.ENF_JFNM, e.ENF_DATNAIS, e.ENF_RANG, e.CON_RANG,
                c.CON_NOM, c.CON_PRN
            FROM GRH_OCT.ENFANT e
            LEFT JOIN GRH_OCT.CONJOINT c ON e.IDT_MATAG = c.IDT_MATAG
            WHERE e.IDT_MATAG = ?", [(string) $rawIdentity->idt_matag]);
    
        $children = collect($children)->map(function ($child) {
            return [
                'ENF_PRN' => $child->enf_prn,
                'ENF_PRNAR' => $child->enf_prnar,
                'ENF_JFNM' => $child->enf_jfnm,
                'ENF_DATNAIS' => $child->enf_datnais,
                'ENF_RANG' => $child->enf_rang,
                'CON_RANG' => $child->con_rang,
                'CON_NOM' => $child->con_nom,
                'CON_PRN' => $child->con_prn,
            ];
        })->toArray();
        $children = collect($children)->sortBy(function ($child) {
            return intval($child['ENF_RANG']);
        })->values()->toArray();
        
    
        $posteLabel = optional(DB::connection('oracle')->table('GRH_OCT.POSITION')
    ->where('POS_CODE', $rawIdentity->idt_pos_code)
    ->first())->pos_dsg;

    
        $sousPosteLabel = optional(DB::connection('oracle')->table('GRH_OCT.SOUPOS')
            ->where('SPS_CODE', $rawIdentity->idt_spos_code)
            ->first())->sps_dsg;
    
        $bankLabel = $rawIdentity?->idt_bnk
            ? DB::connection('oracle')->table('GRH_OCT.BANQUE')
                ->where('BNQ_CODE', (string) $rawIdentity->idt_bnk)
                ->value('BNQ_DSG')
            : null;
    
        $emploiLabel = optional(DB::connection('oracle')->table('GRH_OCT.EMPLOI_DT')
            ->where('EMP_CODE', $rawIdentity->idt_emp_code)
            ->first())->emp_dsg;
    
        $fonctionLabel = $rawIdentity?->idt_fon_code
            ? DB::connection('oracle')->table('GRH_OCT.FONCTION_DT')
                ->where('FON_CODE', (string) $rawIdentity->idt_fon_code)
                ->value('FON_DSG')
            : null;
    
        $ufaLabel = $rawIdentity?->ufa
            ? DB::connection('oracle')->table('GRH_OCT.UFA')
                ->where('CODE_UFA', (string) $rawIdentity->ufa)
                ->value('LIB_UFA')
            : null;
    
        $gender = ($rawIdentity->idt_sxage == 1) ? 'M' : 'F';
    
        return [
            'IDT_MATAG' => $rawIdentity->idt_matag,
            'NOM' => $rawIdentity->idt_nomag,
            'NOMAR' => $rawIdentity->idt_nomagar,
            'PRENOM' => $rawIdentity->idt_prnag,
            'PRENOMAR' => $rawIdentity->idt_prnagar,
        
            // Nouvelles infos ajoutées
            'CIN' => $rawIdentity->idt_cin,
            'ADHERENT' => $rawIdentity->idt_adherent,
            'ADRESSE' => $rawIdentity->idt_adres,
            'DATE_RECRUTEMENT' => $rawIdentity->idt_datrec,
            'DATE_TITULARISATION' => $rawIdentity->idt_dattit,
            'DATE_FONCTION' => $rawIdentity->idt_date_fon,
        
            'POSITION' => $posteLabel,
            'SOUS_POSITION' => $sousPosteLabel,
            'DATE_POSITION' => $rawIdentity->idt_date_pos,
            'DATE_SOUS_POSITION' => $rawIdentity->idt_date_spos,
        
            'SERVICE' => null,
            'BANQUE' => $bankLabel,
            'RIB' => $rawIdentity->rib,
            'CATEGORIE' => $rawIdentity->idt_categorie,
            'ECHELLE' => $rawIdentity->grp_categ,
            'ECHELON' => $rawIdentity->idt_cho_code,
            'DATE_ECHELON' => $rawIdentity->idt_date_cho,
            'DATE_CATEGORIE' => $rawIdentity->idt_date_cat,
            'CLASSE' => $rawIdentity->idt_classep,
            'DATE_CLASSE' => $rawIdentity->idt_date_classep,
        
            'SEXE' => $gender,
            'NOMBRE_ENFANTS' => count($children),
            'ENFANTS_LISTE' => $children,
            'CONJOINT' => $conjoint ? [
                'CON_NOM' => $conjoint->con_nom,
                'CON_PRN' => $conjoint->con_prn,
                'CON_NOMAR' => $conjoint->con_nomar,
                'CON_PRNAR' => $conjoint->con_prnar,
                'CON_DATNAIS' => $conjoint->con_datnais,
            ] : null,
        
            'IDENTIFIANT_UNIQUE' => $rawIdentity->idt_matas,
            'EMPLOI' => $emploiLabel,
            'FONCTION' => $fonctionLabel,
            'AFFECTATION' => $ufaLabel,
            'REGIME' => $rawIdentity->rgh_type,
            'DATE_NAISSANCE' => $rawIdentity->idt_datnais,

        ];
        
    }
    
}