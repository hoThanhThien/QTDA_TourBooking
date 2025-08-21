<?php
return [
  'app_url' => 'http://127.0.0.1:8000',
  'jwt_secret' => 'change_me_to_long_random',
  'db' => [
    'host' => '127.0.0.1',
    'port' => 3306,
    'name' => 'tourdb',
    'user' => 'root',
    'pass' => '',
    'charset' => 'utf8mb4'
  ],
  'sepay' => [
    'partner_code' => 'YOUR_PARTNER',
    'api_key'      => 'YOUR_API_KEY',
    'return_url'   => 'http://127.0.0.1:8000/payment/return',
    'callback_url' => 'http://127.0.0.1:8000/payment/callback'
  ]
];
