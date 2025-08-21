<?php
function body(){ return json_decode(file_get_contents('php://input'), true) ?: []; }
function now(){ return date('Y-m-d H:i:s'); }
function hash_password($plain){ return hash('sha256',$plain); } // demo; có thể đổi thành password_hash()

//phân trang
function q_int($key, $default, $min=1, $max=100){
  $v = isset($_GET[$key]) ? (int)$_GET[$key] : $default;
  if ($v < $min) $v = $min;
  if ($v > $max) $v = $max;
  return $v;
}
function meta_pagination($total, $page, $pageSize){
  $totalPages = (int)ceil(($total ?: 0) / $pageSize);
  return [
    'total'       => (int)$total,
    'page'        => (int)$page,
    'page_size'   => (int)$pageSize,
    'total_pages' => $totalPages,
    'has_next'    => $page < $totalPages,
    'has_prev'    => $page > 1
  ];
}