<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;
use Illuminate\Http\Middleware\HandleCors;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');

        // Enable CORS globally
        $this->app->singleton(\Illuminate\Contracts\Http\Kernel::class, function ($app) {
            return new class($app) extends \Illuminate\Foundation\Http\Kernel {
                protected $middleware = [
                    HandleCors::class, // Add CORS middleware
                ];
            };
        });
    }
}
