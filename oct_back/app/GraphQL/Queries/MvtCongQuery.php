<?php

namespace App\GraphQL\Queries;

use App\Models\MvtCong;
use Illuminate\Support\Facades\DB;

class MvtCongQuery
{
    public function resolve($_, array $args)
    {
        $mvtCongs = DB::connection('oracle')
            ->table('GRH_OCT.MVTCON as m')
            ->leftJoin('GRH_OCT.TYPCONG as t', 'm.TYC_TYPE', '=', 't.TYC_TYPE')
            ->select(
                'm.IDT_MATAG',
                'm.MVC_DATDEB',
                'm.MVC_DATFIN',
                'm.TYC_TYPE',
                't.TYC_DSG as type_label',
                't.TYC_DSGAR as type_label_ar'

            )
            ->where('m.IDT_MATAG', $args['matricule'])
            ->orderBy('m.MVC_DATDEB', 'asc') // Corrected line
            ->get();
    
        return $mvtCongs;
    }
}