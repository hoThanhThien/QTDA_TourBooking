<?php
function register_booking_routes(){
  route('POST','/bookings', function(){
    $u = current_user_or_401();
    $b=body(); required($b,['tour_id','number_of_people']);
    $t=db()->prepare("SELECT * FROM tours WHERE id=?");
    $t->execute([$b['tour_id']]); $tour=$t->fetch(); if(!$tour) json_err('Tour not found',404);
    if($tour['status']!=='Available') json_err('Tour not available',409);

    $discount_id = null; $discount_value=0;
    if(!empty($b['discount_code'])){
      $d=db()->prepare("SELECT * FROM discounts WHERE code=?"); $d->execute([$b['discount_code']]); $disc=$d->fetch();
      if($disc){
        $today=date('Y-m-d');
        if((!$disc['start_date'] || $today>=$disc['start_date']) && (!$disc['end_date'] || $today<=$disc['end_date'])){
          $discount_id=$disc['id'];
          $discount_value = $disc['is_percent'] ? ($tour['price']*$b['number_of_people']*$disc['discount_amount']/100) : $disc['discount_amount'];
        }
      }
    }
    $gross = $tour['price'] * $b['number_of_people'];
    $total = max(0, $gross - $discount_value);

    db()->prepare("INSERT INTO bookings(user_id,tour_id,number_of_people,status,total_amount,discount_id) VALUES (?,?,?,?,?,?)")
      ->execute([$u['id'],$tour['id'],$b['number_of_people'],'Pending',$total,$discount_id]);
    $bookingId = db()->lastInsertId();

    json_ok(['booking_id'=>$bookingId,'total'=>$total],'Booking created',201);
  }, [require_role(['customer','admin'])]);

  route('GET','/my/bookings', function(){
  $u=current_user_or_401();
  $page=q_int('page',1); $pageSize=q_int('page_size',10);
  $status = $_GET['status'] ?? null;

  $where = ["b.user_id=?"]; $params = [$u['id']];
  if ($status){ $where[]="b.status=?"; $params[]=$status; }
  $whereSql = 'WHERE '.implode(' AND ',$where);

  $stc = db()->prepare("SELECT COUNT(*) c FROM bookings b $whereSql");
  $stc->execute($params); $total = (int)$stc->fetch()['c'];

  $offset = ($page-1)*$pageSize;
  $sql = "SELECT b.*, t.title,t.start_date,t.end_date
          FROM bookings b JOIN tours t ON t.id=b.tour_id
          $whereSql
          ORDER BY b.id DESC
          LIMIT $pageSize OFFSET $offset";
  $st = db()->prepare($sql); $st->execute($params); $rows=$st->fetchAll();
  json_ok(['items'=>$rows,'meta'=>meta_pagination($total,$page,$pageSize)]);
}, [require_role(['customer','admin','super_admin'])]);


  route('GET','/bookings', function(){
  $page=q_int('page',1); $pageSize=q_int('page_size',10);
  $status = $_GET['status'] ?? null;
  $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
  $tourId = isset($_GET['tour_id']) ? (int)$_GET['tour_id'] : null;
  $dateFrom = $_GET['date_from'] ?? null; // YYYY-MM-DD
  $dateTo   = $_GET['date_to'] ?? null;

  $where=[]; $params=[];
  if ($status){ $where[]="b.status=?"; $params[]=$status; }
  if ($userId){ $where[]="b.user_id=?"; $params[]=$userId; }
  if ($tourId){ $where[]="b.tour_id=?"; $params[]=$tourId; }
  if ($dateFrom){ $where[]="DATE(b.booking_date)>=?"; $params[]=$dateFrom; }
  if ($dateTo){ $where[]="DATE(b.booking_date)<=?"; $params[]=$dateTo; }
  $whereSql = $where ? ('WHERE '.implode(' AND ',$where)) : '';

  $stc = db()->prepare("SELECT COUNT(*) c FROM bookings b $whereSql"); $stc->execute($params); $total=(int)$stc->fetch()['c'];

  $offset = ($page-1)*$pageSize;
  $sql = "SELECT b.*, u.username, t.title
          FROM bookings b
          JOIN users u ON u.id=b.user_id
          JOIN tours  t ON t.id=b.tour_id
          $whereSql
          ORDER BY b.id DESC
          LIMIT $pageSize OFFSET $offset";
  $st = db()->prepare($sql); $st->execute($params); $rows=$st->fetchAll();
  json_ok(['items'=>$rows,'meta'=>meta_pagination($total,$page,$pageSize)]);
}, [require_role(['admin','super_admin'])]);

  route('PATCH','/bookings/{id}/status', function($p){
    $b=body(); required($b,['status']);
    db()->prepare("UPDATE bookings SET status=? WHERE id=?")->execute([$b['status'],$p['id']]);
    json_ok(null,'Status updated');
  }, [require_role(['admin'])]);
}
