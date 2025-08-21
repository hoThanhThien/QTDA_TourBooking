<?php
function sepay_create_payment($bookingId,$amount){
  $cfg = require __DIR__.'/config.php';
  $payload = [
    'partner_code' => $cfg['sepay']['partner_code'],
    'api_key'      => $cfg['sepay']['api_key'],
    'amount'       => (int)round($amount),
    'order_id'     => 'BK'.$bookingId.'-'.time(),
    'return_url'   => $cfg['sepay']['return_url'],
    'callback_url' => $cfg['sepay']['callback_url'],
    'description'  => "Thanh toan booking #$bookingId"
  ];
  $ch = curl_init('https://api.sepay.vn/v1/payments/create');
  curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>http_build_query($payload),CURLOPT_RETURNTRANSFER=>true]);
  $res = curl_exec($ch);
  if($res===false){ json_err('SePay error: '.curl_error($ch),502); }
  $code = curl_getinfo($ch,CURLINFO_RESPONSE_CODE);
  curl_close($ch);
  if($code>=400){ json_err('SePay HTTP '.$code.': '.$res,502); }
  $decoded = json_decode($res,true);
  return $decoded ?: ['raw'=>$res];
}
function sepay_verify_callback($data){
  // TODO: thay bằng cơ chế ký thực theo tài liệu SePay
  return true;
}
