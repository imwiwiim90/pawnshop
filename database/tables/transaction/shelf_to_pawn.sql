CREATE TABLE transaction_shelf_to_pawn (
	id INT AUTO_INCREMENT PRIMARY KEY,
	created_at datetime not null default current_timestamp,
	transaction_id INT,
	FOREIGN KEY (transaction_id)
		REFERENCES transaction(id)
		ON DELETE CASCADE
);
