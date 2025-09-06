<?php
// ==== Static file fallback ====
$uri  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$file = __DIR__ . $uri;
if ($uri !== '/' && file_exists($file) && !is_dir($file) && realpath($file) !== __FILE__) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $types = [
        'css' => 'text/css','js'=>'application/javascript','png'=>'image/png',
        'jpg'=>'image/jpeg','jpeg'=>'image/jpeg','gif'=>'image/gif','svg'=>'image/svg+xml',
        'woff'=>'font/woff','woff2'=>'font/woff2','ttf'=>'font/ttf','eot'=>'application/vnd.ms-fontobject',
        'ico'=>'image/x-icon'
    ];
    if (isset($types[$ext])) header('Content-Type: '.$types[$ext]);
    readfile($file);
    exit;
}


// ==== CORS (cho Bearer token). Nếu bạn dùng cookie -> đổi origin cụ thể & Allow-Credentials) ====
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ==== App bootstrap (giữ nguyên) ====
require __DIR__.'/../src/db.php';
require __DIR__.'/../src/response.php';
require __DIR__.'/../src/helpers.php';
require __DIR__.'/../src/auth.php';
require __DIR__.'/../src/validator.php';
require __DIR__.'/../src/sepay.php';
require __DIR__.'/../src/router.php';

require __DIR__.'/../src/controllers/AuthController.php';
require __DIR__.'/../src/controllers/UserController.php';
require __DIR__.'/../src/controllers/RoleController.php';
require __DIR__.'/../src/controllers/CategoryController.php';
require __DIR__.'/../src/controllers/TourController.php';
require __DIR__.'/../src/controllers/PhotoController.php';
require __DIR__.'/../src/controllers/DiscountController.php';
require __DIR__.'/../src/controllers/BookingController.php';
require __DIR__.'/../src/controllers/PaymentController.php';

register_auth_routes();
register_user_routes();
register_role_routes();
register_category_routes();  // << quan trọng
register_tour_routes();
register_photo_routes();
register_discount_routes();
register_booking_routes();
register_payment_routes();

run_router();
