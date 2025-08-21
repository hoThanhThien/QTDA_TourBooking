<?php
$routes = [];
function route($method,$path,$handler,$middlewares=[]){
  global $routes; $routes[] = compact('method','path','handler','middlewares');
}
function run_router(){
  global $routes;
  $uri = parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
  $method = $_SERVER['REQUEST_METHOD'];
  if($method==='OPTIONS'){ header('Access-Control-Allow-Origin: *'); header('Access-Control-Allow-Headers: Content-Type, Authorization'); header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS'); exit; }
  foreach($routes as $r){
    $pattern = "@^".preg_replace('@\{(\w+)\}@','(?P<$1>[^/]+)',$r['path'])."$@";
    if($method===$r['method'] && preg_match($pattern,$uri,$m)){
      $params = array_filter($m,'is_string',ARRAY_FILTER_USE_KEY);
      foreach($r['middlewares'] as $mw){ if($mw()===false) return; }
      return call_user_func($r['handler'],$params);
    }
  }
  json_err('Not Found',404);
}
