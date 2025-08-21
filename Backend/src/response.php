<?php
function json_ok($data=null,$msg='OK',$code=200){
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['success'=>true,'message'=>$msg,'data'=>$data], JSON_UNESCAPED_UNICODE);
  exit;
}
function json_err($msg='Error',$code=400,$errors=null){
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['success'=>false,'message'=>$msg,'errors'=>$errors], JSON_UNESCAPED_UNICODE);
  exit;
}
