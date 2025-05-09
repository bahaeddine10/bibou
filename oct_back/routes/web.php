<?php

use Illuminate\Support\Facades\Route;
use App\Models\MvtCong;

Route::get('/', function () {
    return view('welcome');
});

Route::options('/graphql', function () {
    return response()->json([], 204);
});

/*
Route::get('/test-MvtCong', function () {
    $record = MvtCong::where('IDT_MATAG', '38370')
        ->whereBetween('mvc_datesai', ['2023-01-01', '2025-12-31']) // 👈 Check if date is between 2023 and 2025
        ->get(); // 👈 use get() because maybe multiple results

    if ($record->isNotEmpty()) {
        return response()->json($record); // 👈 Return clean JSON
    } else {
        return response()->json(['message' => 'No records found for IDT_MATAG 38370 between 2023 and 2025'], 404);
    }
});
*/

