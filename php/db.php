<?php

$dbconn = pg_connect("host=localhost port=5432 dbname=library user=baykov_administrator password=password");
if ($dbconn) {
   print "Успешно подключились к : " . pg_host($dbconn);
} else {
   print "Ошибка с подключением";
   exit;
}

$query = 'SELECT * FROM physical_books';
$res = pg_query($dbconn, $query);

if ($res) {
    while ($row = pg_fetch_assoc($res)) {
        print_r($row);
        echo "<br>";
        }
} else {
    print "Ошибка при выполнении запроса";
    exit;
}
?>