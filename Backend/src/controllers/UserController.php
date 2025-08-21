<?php
function register_user_routes(){
  route('GET','/users', function(){
  require_role(['admin','super_admin'])();
  $q = trim($_GET['q'] ?? '');
  $sort = $_GET['sort'] ?? 'newest';
  $page = q_int('page', 1);
  $pageSize = q_int('page_size', 10);

  $where=[]; $params=[];
  if ($q!==''){ $where[]="(username LIKE ? OR email LIKE ? OR phone LIKE ?)"; $params[]="%$q%"; $params[]="%$q%"; $params[]="%$q%"; }
  $whereSql = $where ? ('WHERE '.implode(' AND ',$where)) : '';

  $orderMap = [
    'newest' => 'id DESC',
    'oldest' => 'id ASC'
  ];
  $orderSql = $orderMap[$sort] ?? $orderMap['newest'];

  $stc = db()->prepare("SELECT COUNT(*) c FROM users $whereSql"); $stc->execute($params); $total=(int)$stc->fetch()['c'];

  $offset = ($page-1)*$pageSize;
  $st = db()->prepare("SELECT id,username,email,phone,role_id,created_at FROM users $whereSql ORDER BY $orderSql LIMIT $pageSize OFFSET $offset");
  $st->execute($params); $rows = $st->fetchAll();

  json_ok(['items'=>$rows,'meta'=>meta_pagination($total,$page,$pageSize)]);
}, [require_role(['admin','super_admin'])]);

  route('GET','/users/{id}', function($p){
    $stmt = db()->prepare("SELECT id,username,email,phone,role_id,created_at FROM users WHERE id=?");
    $stmt->execute([$p['id']]); $u=$stmt->fetch(); if(!$u) json_err('Not found',404); json_ok($u);
  }, [require_role(['admin'])]);
}
