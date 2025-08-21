<?php
// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

require __DIR__.'/../src/db.php';
require __DIR__.'/../src/response.php';
require __DIR__.'/../src/helpers.php';
require __DIR__.'/../src/auth.php';
require __DIR__.'/../src/validator.php';
require __DIR__.'/../src/sepay.php';
require __DIR__.'/../src/router.php';

// Controllers
require __DIR__.'/../src/controllers/AuthController.php';
require __DIR__.'/../src/controllers/UserController.php';
require __DIR__.'/../src/controllers/RoleController.php';
require __DIR__.'/../src/controllers/CategoryController.php';
require __DIR__.'/../src/controllers/TourController.php';
require __DIR__.'/../src/controllers/PhotoController.php';
require __DIR__.'/../src/controllers/DiscountController.php';
require __DIR__.'/../src/controllers/BookingController.php';
require __DIR__.'/../src/controllers/PaymentController.php';

// Register all routes
register_auth_routes();
register_user_routes();
register_role_routes();
register_category_routes();
register_tour_routes();
register_photo_routes();
register_discount_routes();
register_booking_routes();
register_payment_routes();

// Run
run_router();
