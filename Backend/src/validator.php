<?php
function required($arr,$keys){ foreach($keys as $k){ if(!isset($arr[$k]) || $arr[$k]==='') json_err("Missing: $k",422);} }
