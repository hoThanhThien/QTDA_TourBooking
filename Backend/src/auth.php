<?php
$config = require __DIR__.'/config.php';

function base64url_encode($data){ return rtrim(strtr(base64_encode($data), '+/', '-_'), '='); }
function base64url_decode($data){ return base64_decode(strtr($data, '-_', '+/')); }

function jwt_sign($payload, $ttl=86400){
  global $config;
  $header = ['alg'=>'HS256','typ'=>'JWT'];
  $now = time();
  $payload['iat']=$now; $payload['exp']=$now+$ttl;
  $segments = [ base64url_encode(json_encode($header)), base64url_encode(json_encode($payload)) ];
  $sig = hash_hmac('sha256', implode('.',$segments), $config['jwt_secret'], true);
  $segments[] = base64url_encode($sig);
  return implode('.',$segments);
}
function jwt_verify($jwt){
  global $config;
  $parts = explode('.',$jwt); if(count($parts)!==3) return false;
  list($h,$p,$s) = $parts;
  $sig = base64url_encode(hash_hmac('sha256',"$h.$p",$config['jwt_secret'],true));
  if(!hash_equals($sig,$s)) return false;
  $pl = json_decode(base64url_decode($p),true);
  if(!$pl || ($pl['exp']??0) < time()) return false;
  return $pl;
}

function current_user_or_401(){
  $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if(!preg_match('/Bearer\s+(.+)/',$auth,$m)) json_err('Missing token',401);
  $pl = jwt_verify($m[1]); if(!$pl) json_err('Invalid/expired token',401);
  $stmt = db()->prepare("SELECT u.*, r.name role_name FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=?");
  $stmt->execute([$pl['uid']]); $u=$stmt->fetch(); if(!$u) json_err('User not found',401);
  return $u;
}
function require_role($roles=[]){
  return function() use ($roles){
    $u = current_user_or_401();
    if($roles && !in_array($u['role_name'],$roles)) json_err('Forbidden',403);
    $GLOBALS['_auth_user']=$u; return true;
  };
}
