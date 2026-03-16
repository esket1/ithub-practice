СУБД PostgreSQL

host=localhost port=5432 dbname=library user=baykov_administrator password=password

Сущность physical_books (id, inventory_number, title, author, year, location, status);
Сущность physical_loans (id, book_id, reader_card, date_taken, date_returned)