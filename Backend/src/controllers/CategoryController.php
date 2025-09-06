<?php
function register_category_routes(){

  // List + filter + pagination
  route('GET','/categories', function(){
    $q       = trim($_GET['q'] ?? '');
    $page    = q_int('page', 1);
    $size    = q_int('page_size', 10);

    $where=[]; $params=[];
    if($q!==''){ $where[]="name LIKE ?"; $params[]="%$q%"; }
    $whereSql = $where ? ("WHERE ".implode(" AND ", $where)) : "";

    $stc = db()->prepare("SELECT COUNT(*) c FROM categories $whereSql");
    $stc->execute($params);
    $total = (int)$stc->fetch()['c'];

    $offset = ($page-1)*$size;
    $st = db()->prepare("SELECT * FROM categories $whereSql ORDER BY name LIMIT $size OFFSET $offset");
    $st->execute($params);
    $rows = $st->fetchAll();

    json_ok(['items'=>$rows,'meta'=>meta_pagination($total,$page,$size)]);
  });

  // Get detail
  route('GET','/categories/{id}', function($p){
    $st = db()->prepare("SELECT * FROM categories WHERE id=?");
    $st->execute([$p['id']]);
    $row = $st->fetch();
    if(!$row) json_err('Not found',404);
    json_ok($row);
  });

  // Create
  route('POST','/categories', function(){
    $b = body(); required($b,['name']);
    db()->prepare("INSERT INTO categories(name,description) VALUES(?,?)")
       ->execute([$b['name'], $b['description']??null]);
    json_ok(['id'=>db()->lastInsertId()], 'Created', 201);
  }, [require_role(['admin'])]);

  // Update
  route('PUT','/categories/{id}', function($p){
    $b = body(); required($b,['name']);
    db()->prepare("UPDATE categories SET name=?, description=? WHERE id=?")
       ->execute([$b['name'], $b['description']??null, $p['id']]);
    json_ok(null,'Updated');
  }, [require_role(['admin'])]);

  // Delete
  route('DELETE','/categories/{id}', function($p){
    db()->prepare("DELETE FROM categories WHERE id=?")->execute([$p['id']]);
    json_ok(null,'Deleted');
  }, [require_role(['admin'])]);
}
