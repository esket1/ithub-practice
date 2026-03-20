<?php
require_once 'config.php'; 

header('Content-Type: application/xml; charset=utf-8');

echo '<?xml version="1.0" encoding="UTF-8"?>';
if (!isset($_GET['raw'])) {
    echo '<?xml-stylesheet type="text/xsl" href="report.xsl"?>';
}

$stmt = $pdo->query("
    SELECT l.id, b.inventory_number, b.title, l.reader_card, l.date_taken
    FROM physical_loans l
    JOIN physical_books b ON l.book_id = b.id
    WHERE l.date_returned IS NULL
"); 
$loans = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo '<OverdueReport>';
foreach ($loans as $loan) {
    echo '<Loan>';
    echo '<LoanId>' . $loan['id'] . '</LoanId>';
    echo '<InventoryNumber>' . htmlspecialchars($loan['inventory_number']) . '</InventoryNumber>';
    echo '<Title>' . htmlspecialchars($loan['title']) . '</Title>';
    echo '<ReaderCard>' . htmlspecialchars($loan['reader_card']) . '</ReaderCard>';
    echo '<DateTaken>' . $loan['date_taken'] . '</DateTaken>';
    echo '</Loan>';
}
echo '</OverdueReport>';