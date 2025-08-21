<?php
function register_tour_routes(){
  route('GET','/tours', function(){
  $q = trim($_GET['q'] ?? '');
  $sort = $_GET['sort'] ?? 'created_at_desc';
  $page = q_int('page', 1);
  $pageSize = q_int('page_size', 10);

  // WHERE
  $where = []; $params = [];
  if ($q !== '') { $where[] = "(t.title LIKE ? OR t.location LIKE ?)"; $params[]="%$q%"; $params[]="%$q%"; }
  $whereSql = $where ? ('WHERE '.implode(' AND ',$where)) : '';

  // SORT allowlist
  $orderMap = [
    'created_at_desc' => 't.id DESC',
    'price_asc'       => 't.price ASC',
    'price_desc'      => 't.price DESC',
    'start_date_asc'  => 't.start_date ASC',
    'start_date_desc' => 't.start_date DESC'
  ];
  $orderSql = $orderMap[$sort] ?? $orderMap['created_at_desc'];

  // COUNT
  $sqlCount = "SELECT COUNT(*) AS c
               FROM tours t JOIN categories c ON c.id=t.category_id $whereSql";
  $stc = db()->prepare($sqlCount); $stc->execute($params); $total = (int)$stc->fetch()['c'];

  // DATA
  $offset = ($page-1)*$pageSize;
  $sql = "SELECT t.*, c.name category_name
          FROM tours t JOIN categories c ON c.id=t.category_id
          $whereSql
          ORDER BY $orderSql
          LIMIT $pageSize OFFSET $offset";
  $st = db()->prepare($sql); $st->execute($params); $rows = $st->fetchAll();

  // gắn primary photo
  if ($rows) {
    $ids = array_column($rows,'id');
    $in = implode(',', array_fill(0,count($ids),'?'));
    $ph = db()->prepare("SELECT tour_id,image_url FROM photos WHERE tour_id IN ($in) AND is_primary=1");
    $ph->execute($ids); $map=[]; foreach($ph->fetchAll() as $r){ $map[$r['tour_id']]=$r['image_url']; }
    foreach($rows as &$r){ $r['primary_photo']=$map[$r['id']]??null; }
  }

  json_ok([
    'items' => $rows,
    'meta'  => meta_pagination($total,$page,$pageSize)
  ]);
});

  route('POST','/tours', function(){
    $b=body(); required($b,['category_id','title','price']);
    $sql="INSERT INTO tours(category_id,title,description,location,capacity,price,start_date,end_date,status) VALUES (?,?,?,?,?,?,?,?,?)";
    db()->prepare($sql)->execute([
      $b['category_id'],$b['title'],$b['description']??null,$b['location']??null,$b['capacity']??0,$b['price'],
      $b['start_date']??null,$b['end_date']??null,$b['status']??'Available'
    ]);
    json_ok(['id'=>db()->lastInsertId()],'Created',201);
  }, [require_role(['admin'])]);
  route('PUT','/tours/{id}', function($p){
    $b=body(); $sql="UPDATE tours SET category_id=?,title=?,description=?,location=?,capacity=?,price=?,start_date=?,end_date=?,status=? WHERE id=?";
    db()->prepare($sql)->execute([
      $b['category_id'],$b['title'],$b['description']??null,$b['location']??null,$b['capacity']??0,$b['price'],
      $b['start_date']??null,$b['end_date']??null,$b['status']??'Available',$p['id']
    ]);
    json_ok(null,'Updated');
  }, [require_role(['admin'])]);
  route('DELETE','/tours/{id}', function($p){
    db()->prepare("DELETE FROM photos WHERE tour_id=?")->execute([$p['id']]);
    db()->prepare("DELETE FROM tours WHERE id=?")->execute([$p['id']]);
    json_ok(null,'Deleted');
  }, [require_role(['admin'])]);
}
