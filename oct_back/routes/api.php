<?php

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:api');
Route::get('test-oracle', function () {
    $param = DB::connection('oracle')->table('users')->get();
    dd($param);
});

Route::post('/upload-certificat', function (Request $request) {
    // Manually clear duplicate CORS headers before setting
    header_remove('Access-Control-Allow-Origin');
    header_remove('Access-Control-Allow-Methods');
    header_remove('Access-Control-Allow-Headers');

    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

    if ($request->hasFile('file')) {
        $file = $request->file('file');
        $fileName = time().'_'.$file->getClientOriginalName();
        $file->move(public_path('certificats'), $fileName);

        return response()->json(['path' => 'certificats/' . $fileName]);
    }

    return response()->json(['error' => 'No file uploaded'], 400);
});
