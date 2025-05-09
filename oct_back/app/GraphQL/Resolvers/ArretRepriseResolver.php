<?php

namespace App\GraphQL\Resolvers;

use App\Models\ArretReprise;

class ArretRepriseResolver
{
    public function resolveAcceptedByChef()
    {
        return ArretReprise::where('status_chef', 1)->get();
    }

    public function resolveByDepartment($_, array $args)
    {
        return ArretReprise::where('departmentId', $args['departmentId'])->get();
    }

    public function resolveAll()
    {
        return ArretReprise::all();
    }
    public function resolveByMatricule($_, array $args)
{
    return \App\Models\ArretReprise::where('matricule', $args['matricule'])->get();
}

}
