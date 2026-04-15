<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Horizon Domain
    |--------------------------------------------------------------------------
    |
    | This is the subdomain where Horizon will be accessible from. If this
    | setting is null, Horizon will reside under the same domain as the
    | application. Otherwise, this value will serve as the subdomain.
    |
    */

    'domain' => env('HORIZON_DOMAIN', null),

    /*
    |--------------------------------------------------------------------------
    | Horizon Path
    |--------------------------------------------------------------------------
    |
    | This is the URI path where Horizon will be accessible from. Feel free
    | to change this path to anything you like. Note that the URI will not
    | affect the paths of its internal API that aren't exposed to users.
    |
    */

    'path' => env('HORIZON_PATH', 'horizon'),

    /*
    |--------------------------------------------------------------------------
    | Horizon Redis Connection
    |--------------------------------------------------------------------------
    |
    | This is the name of the Redis connection where Horizon will store the
    | meta information required for it to function. It includes the list
    | of supervisors, failed jobs, job metrics, and other information.
    |
    */

    'use' => 'default',

    /*
    |--------------------------------------------------------------------------
    | Queue Wait Time Thresholds
    |--------------------------------------------------------------------------
    |
    | You may define a queue wait time threshold (in seconds) for each of your
    | queues. If a job has been waiting on a queue for longer than this
    | number of seconds it will be added to the list of jobs with long wait
    | times in the Horizon dashboard. You may use a wildcard to define the
    | threshold for every queue:
    |
    |      'waits' => [
    |          'default' => 60,
    |          'critical' => 5,
    |      ],
    |
    */

    'waits' => [
        'redis:critical' => 5,
        'redis:high' => 30,
        'redis:default' => 60,
        'redis:low' => 120,
        'redis:notifications' => 45,
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Worker Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may define the queue worker settings used by your application
    | in all environments. These supervisors and settings handle all your
    | queued jobs and will be provisioned by Horizon during deployment.
    |
    */

    'environments' => [
        'production' => [
            'supervisor-critical' => [
                'connection' => 'redis',
                'queue' => ['critical'],
                'balance' => 'simple',
                'processes' => 2,
                'tries' => 5,
                'nice' => -5,
                'memory' => 512,
                'timeout' => 300,
            ],
            'supervisor-high' => [
                'connection' => 'redis',
                'queue' => ['high'],
                'balance' => 'simple',
                'processes' => 3,
                'tries' => 3,
                'nice' => 0,
                'memory' => 256,
                'timeout' => 180,
            ],
            'supervisor-default' => [
                'connection' => 'redis',
                'queue' => ['default'],
                'balance' => 'simple',
                'processes' => 4,
                'tries' => 3,
                'nice' => 0,
                'memory' => 256,
                'timeout' => 120,
            ],
            'supervisor-notifications' => [
                'connection' => 'redis',
                'queue' => ['notifications'],
                'balance' => 'simple',
                'processes' => 2,
                'tries' => 5,
                'nice' => 0,
                'memory' => 256,
                'timeout' => 180,
            ],
            'supervisor-low' => [
                'connection' => 'redis',
                'queue' => ['low'],
                'balance' => 'simple',
                'processes' => 2,
                'tries' => 2,
                'nice' => 10,
                'memory' => 128,
                'timeout' => 60,
            ],
        ],

        'local' => [
            'supervisor-1' => [
                'connection' => 'redis',
                'queue' => ['default', 'critical', 'high', 'low'],
                'balance' => 'simple',
                'processes' => 3,
                'tries' => 3,
                'nice' => 0,
            ],
        ],

        'testing' => [
            'supervisor-1' => [
                'connection' => 'sync',
                'queue' => ['default'],
                'balance' => 'simple',
                'processes' => 1,
                'tries' => 1,
                'nice' => 0,
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    |
    | This configuration controls the authentication gate for Horizon. You may
    | change this to your own authentication logic. The gate will be called
    | whenever someone attempts to access the Horizon dashboard.
    |
    */

    'auth' => [
        /*
        |--------------------------------------------------------------------------
        | Authentication Gate
        |--------------------------------------------------------------------------
        |
        | This closure determines who can access the Horizon dashboard. The
        | closure receives the incoming HTTP request and should return a
        | boolean indicating whether the user can access Horizon.
        |
        */

        'gate' => 'App\Providers\HorizonServiceProvider@horizonGate',

        /*
        |--------------------------------------------------------------------------
        | Authentication Paths
        |--------------------------------------------------------------------------
        |
        | These are the paths that Horizon will redirect to when a user is
        | not authenticated. You may customize these paths as needed.
        |
        */

        'paths' => [
            'login' => 'login',
            'logout' => 'logout',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Memory Limits
    |--------------------------------------------------------------------------
    |
    | Here you may define the memory limits for your workers. These limits
    | will be used to restart workers that exceed the specified memory
    | limit. You may use "auto" to let Horizon determine the best limit.
    |
    */

    'memory_limit' => 256,

    /*
    |--------------------------------------------------------------------------
    | Route Middleware
    |--------------------------------------------------------------------------
    |
    | These middleware will be applied to every route Horizon registers.
    | You are free to add your own middleware to this stack if you wish.
    |
    */

    'middleware' => [
        'web',
        'auth',
    ],

    /*
    |--------------------------------------------------------------------------
    | Dark Mode
    |--------------------------------------------------------------------------
    |
    | Here you may enable or disable dark mode for the Horizon dashboard.
    |
    */

    'dark' => env('HORIZON_DARK_MODE', false),

];
