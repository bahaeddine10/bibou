<?php

namespace App\GraphQL\Resolvers;

use App\Models\TestTable;

class TestTableResolver
{
    /**
     * Resolve the TestTable data.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function resolveTestTable($root, array $args)
    {
        return TestTable::all()->map(function ($item) {
            return [
                'id' => (int) $item->id,
                'name' => $item->name,
                'created_at' => $item->created_at->toIso8601String(),
            ];
        });
    }
}
