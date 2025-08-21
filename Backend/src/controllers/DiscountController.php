<?php
function register_discount_routes(){
  route('GET','/discounts', function(){
  $page = q_int('page',1); $pageSize = q_int('page_size',10);
  $stc = db()->query("SELECT COUNT(*) c FROM discounts"); $total = (int)$stc->fetch()['c'];
  $offset = ($page-1)*$pageSize;
  $st = db()->prepare("SELECT * FROM discounts ORDER BY id DESC LIMIT $pageSize OFFSET $offset");
  $st->execute(); $rows = $st->fetchAll();
  json_ok(['items'=>$rows,'meta'=>meta_pagination($total,$page,$pageSize)]);
}, [require_role(['admin','super_admin'])]);

  route('POST','/discounts', function(){
    $b=body(); required($b,['code','discount_amount']);
    db()->prepare("INSERT INTO discounts(code,description,is_percent,discount_amount,start_date,end_date) VALUES(?,?,?,?,?,?)")
      ->execute([$b['code'],$b['description']??null,$b['is_percent']??1,$b['discount_amount'],$b['start_date']??null,$b['end_date']??null]);
    json_ok(['id'=>db()->lastInsertId()],'Created',201);
  }, [require_role(['admin'])]);
  route('GET','/discounts/check/{code}', function($p){
    $s=db()->prepare("SELECT * FROM discounts WHERE code=?"); $s->execute([$p['code']]); $d=$s->fetch();
    if(!$d) json_err('Invalid code',404);
    $today=date('Y-m-d');
    if(($d['start_date'] && $today<$d['start_date']) || ($d['end_date'] && $today>$d['end_date'])) json_err('Code expired',410);
    json_ok($d);
  });
}
