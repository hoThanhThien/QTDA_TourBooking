<?php
function register_payment_routes(){
  route('POST','/payments/create', function(){
    $u=current_user_or_401();
    $b=body(); required($b,['booking_id']);
    $s=db()->prepare("SELECT * FROM bookings WHERE id=? AND user_id=?");
    $s->execute([$b['booking_id'],$u['id']]); $bk=$s->fetch(); if(!$bk) json_err('Booking not found',404);
    if($bk['status']==='Cancelled') json_err('Booking cancelled',409);

    $pm = db()->prepare("SELECT * FROM payments WHERE booking_id=?");
    $pm->execute([$bk['id']]); $p=$pm->fetch();
    if(!$p){
      db()->prepare("INSERT INTO payments(booking_id,amount,payment_method,payment_status) VALUES (?,?, 'SePay','Pending')")
        ->execute([$bk['id'],$bk['total_amount']]);
    }

    $res = sepay_create_payment($bk['id'],$bk['total_amount']);
    json_ok(['pay_url'=>$res['pay_url']??($res['url']??null),'booking_id'=>$bk['id'],'amount'=>$bk['total_amount']],'SePay created');
  }, [require_role(['customer','admin'])]);

  route('GET','/payment/return', function(){
    echo "Thanh toán đang được xử lý, vui lòng chờ xác nhận!";
    exit;
  });

  route('POST','/payment/callback', function(){
    $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    if(!sepay_verify_callback($data)) json_err('Invalid signature',401);
    $orderId = $data['order_id'] ?? '';
    $bookingId = 0;
    if(preg_match('/^BK(\d+)-/',$orderId,$m)){ $bookingId = intval($m[1]); }
    $status = $data['status'] ?? '';
    if(!$bookingId) json_err('Bad data',400);

    if($status==='paid'){
      db()->prepare("UPDATE payments SET payment_status='Paid', gateway_ref=? ,payment_date=? WHERE booking_id=?")
        ->execute([$data['transaction_id']??null, now(), $bookingId]);
      db()->prepare("UPDATE bookings SET status='Confirmed' WHERE id=?")->execute([$bookingId]);
    }elseif($status==='failed'){
      db()->prepare("UPDATE payments SET payment_status='Failed', gateway_ref=?, payment_date=? WHERE booking_id=?")
        ->execute([$data['transaction_id']??null, now(), $bookingId]);
    }
    json_ok(null,'OK');
  });

  route('GET','/payments/booking/{id}', function($p){
    $u=current_user_or_401();
    $s=db()->prepare("SELECT b.user_id, p.* FROM payments p JOIN bookings b ON b.id=p.booking_id WHERE b.id=?");
    $s->execute([$p['id']]); $row=$s->fetch(); if(!$row) json_err('Not found',404);
    if($u['role_name']!=='admin' && $u['id']!=$row['user_id']) json_err('Forbidden',403);
    unset($row['user_id']); json_ok($row);
  }, [require_role(['customer','admin'])]);
}
