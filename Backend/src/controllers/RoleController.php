<?php
function register_role_routes(){
  route('GET','/roles', function(){ $q=db()->query("SELECT * FROM roles"); json_ok($q->fetchAll()); }, [require_role(['admin'])]);
}
