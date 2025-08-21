<?php
function register_photo_routes(){
  route('POST','/tours/{id}/photos', function($p){
    $b=body(); required($b,['image_url']);
    db()->prepare("INSERT INTO photos(tour_id,image_url,caption,is_primary) VALUES(?,?,?,?)")
      ->execute([$p['id'],$b['image_url'],$b['caption']??null,$b['is_primary']??0]);
    json_ok(['id'=>db()->lastInsertId()],'Created',201);
  }, [require_role(['admin'])]);
  route('PUT','/photos/{pid}', function($p){
    $b=body(); db()->prepare("UPDATE photos SET image_url=?,caption=?,is_primary=? WHERE id=?")
      ->execute([$b['image_url'],$b['caption']??null,$b['is_primary']??0,$p['pid']]);
    json_ok(null,'Updated');
  }, [require_role(['admin'])]);
  route('DELETE','/photos/{pid}', function($p){
    db()->prepare("DELETE FROM photos WHERE id=?")->execute([$p['pid']]); json_ok(null,'Deleted');
  }, [require_role(['admin'])]);
route('GET','/tours/{id}/photos', function($p){
  $page=q_int('page',1); $pageSize=q_int('page_size',12);
  $stc = db()->prepare("SELECT COUNT(*) c FROM photos WHERE tour_id=?");
  $stc->execute([$p['id']]); $total=(int)$stc->fetch()['c'];

  $offset = ($page-1)*$pageSize;
  $st = db()->prepare("SELECT * FROM photos WHERE tour_id=? ORDER BY is_primary DESC, id DESC LIMIT $pageSize OFFSET $offset");
  $st->execute([$p['id']]); $rows=$st->fetchAll();

  json_ok(['items'=>$rows,'meta'=>meta_pagination($total,$page,$pageSize)]);
});

}
