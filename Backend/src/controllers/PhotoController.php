<?php
function register_photo_routes(){
  route('GET','/photos', function(){
  $tourId   = q_int('tour_id', null);
  $page     = q_int('page', 1);
  $pageSize = max(1, min(100, q_int('page_size', 12)));
  $offset   = ($page - 1) * $pageSize;

  $conds = []; $params = [];
  if ($tourId !== null) { $conds[] = 'tour_id = ?'; $params[] = $tourId; }
  $where = $conds ? ('WHERE ' . implode(' AND ', $conds)) : '';

  // Đếm tổng
  $stc = db()->prepare("SELECT COUNT(*) c FROM photos $where");
  $stc->execute($params);
  $total = (int)($stc->fetch()['c'] ?? 0);

  // Lấy trang
  $sql = "SELECT id, tour_id, image_url, caption, is_primary
          FROM photos $where
          ORDER BY is_primary DESC, id DESC
          LIMIT $pageSize OFFSET $offset";
  $st = db()->prepare($sql);
  $st->execute($params);
  $rows = $st->fetchAll();

  json_ok(['items'=>$rows, 'meta'=>meta_pagination($total,$page,$pageSize)]);
});


}
