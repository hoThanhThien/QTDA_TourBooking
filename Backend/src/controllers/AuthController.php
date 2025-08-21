<?php
function register_auth_routes(){
  route('POST','/auth/register', function(){
    $b = body(); required($b,['username','email','password']);
    $stmt = db()->prepare("SELECT id FROM users WHERE email=? OR username=?");
    $stmt->execute([$b['email'],$b['username']]); if($stmt->fetch()) json_err('User exists',409);
    $roleId = 2; // customer
    $stmt = db()->prepare("INSERT INTO users(username,email,phone,password_hash,role_id) VALUES (?,?,?,?,?)");
    $stmt->execute([$b['username'],$b['email'],$b['phone']??null,hash_password($b['password']),$roleId]);
    json_ok(['id'=>db()->lastInsertId()],'Registered',201);
  });
  route('POST','/auth/login', function(){
    $b = body(); required($b,['email','password']);
    $s = db()->prepare("SELECT u.*, r.name role_name FROM users u JOIN roles r ON r.id=u.role_id WHERE email=?");
    $s->execute([$b['email']]); $u = $s->fetch(); if(!$u || $u['password_hash']!==hash_password($b['password'])) json_err('Invalid credentials',401);
    $token = jwt_sign(['uid'=>$u['id'],'role'=>$u['role_name']], 86400*7);
    json_ok(['token'=>$token,'user'=>['id'=>$u['id'],'username'=>$u['username'],'email'=>$u['email'],'role'=>$u['role_name']]]);
  });
}
