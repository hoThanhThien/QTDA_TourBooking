<?php
function register_category_routes(){
  route('GET','/categories', function(){
  $q = trim($_GET['q'] ?? '');
  $page = q_int('page', 1);
  $pageSize = q_int('page_size', 10);

  $where = []; $params=[];
  if ($q!==''){ $where[]="name LIKE ?"; $params[]="%$q%"; }
  $whereSql = $where ? ('WHERE '.implode(' AND ',$where)) : '';

  $stc = db()->prepare("SELECT COUNT(*) c FROM categories $whereSql");
  $stc->execute($params); $total = (int)$stc->fetch()['c'];

  $offset = ($page-1)*$pageSize;
  $st = db()->prepare("SELECT * FROM categories $whereSql ORDER BY name LIMIT $pageSize OFFSET $offset");
  $st->execute($params); $rows = $st->fetchAll();

  json_ok(['items'=>$rows,'meta'=>meta_pagination($total,$page,$pageSize)]);
});

  route('POST','/categories', function(){
    $b=body(); required($b,['name']); $s=db()->prepare("INSERT INTO categories(name,description) VALUES(?,?)");
    $s->execute([$b['name'],$b['description']??null]); json_ok(['id'=>db()->lastInsertId()], 'Created',201);
  }, [require_role(['admin'])]);
}
