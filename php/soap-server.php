<?php
require_once 'config.php';

class LibraryService {
    private $pdo;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function searchBooksByAuthor($author_name) {
        $stmt = $this->pdo->prepare("SELECT * FROM physical_books WHERE author ILIKE :author");
        $stmt->execute(['author' => '%' . $author_name . '%']);
        $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $xml = new SimpleXMLElement('<BookList/>');
        foreach ($books as $book) {
            $item = $xml->addChild('Book');
            $item->addChild('inventory_number', htmlspecialchars($book['inventory_number']));
            $item->addChild('title', htmlspecialchars($book['title']));
            $item->addChild('author', htmlspecialchars($book['author']));
            $item->addChild('status', htmlspecialchars($book['status']));
        }
        return $xml->asXML();
    }

    public function registerLoan($inventory_number, $reader_card) {
        $xml = new SimpleXMLElement('<LoanResult/>');
        
        $stmt = $this->pdo->prepare("SELECT id, status FROM physical_books WHERE inventory_number = :inv");
        $stmt->execute(['inv' => $inventory_number]);
        $book = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$book) {
            $xml->addChild('success', 'false');
            $xml->addChild('message', 'Книга не найдена');
            return $xml->asXML();
        }

        if ($book['status'] !== 'available') {
            $xml->addChild('success', 'false');
            $xml->addChild('message', 'Книга уже выдана или недоступна');
            return $xml->asXML();
        }

        try {
            $this->pdo->beginTransaction();
            
            $stmtLoan = $this->pdo->prepare("INSERT INTO physical_loans (book_id, reader_card, date_taken) VALUES (:book_id, :reader_card, CURRENT_DATE) RETURNING id, date_taken");
            $stmtLoan->execute(['book_id' => $book['id'], 'reader_card' => $reader_card]);
            $loan = $stmtLoan->fetch(PDO::FETCH_ASSOC);

            $stmtUpdate = $this->pdo->prepare("UPDATE physical_books SET status = 'borrowed' WHERE id = :id");
            $stmtUpdate->execute(['id' => $book['id']]);

            $this->pdo->commit();

            $xml->addChild('success', 'true');
            $xml->addChild('message', 'Книга успешно выдана');
            $xml->addChild('loan_id', $loan['id']);
        } catch (Exception $e) {
            $this->pdo->rollBack();
            $xml->addChild('success', 'false');
            $xml->addChild('message', 'Ошибка БД: ' . $e->getMessage());
        }

        return $xml->asXML();
    }
}

$options = ['uri' => 'http://localhost/php/library.wsdl'];
$server = new SoapServer('library.wsdl', $options);
$server->setClass('LibraryService');
$server->handle();
?>