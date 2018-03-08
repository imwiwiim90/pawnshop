CREATE TABLE transaction_pawn (
	id INT AUTO_INCREMENT PRIMARY KEY,
	created_at datetime not null default current_timestamp,
	transaction_id INT,
	price VARCHAR(50),
	FOREIGN KEY (transaction_id)
		REFERENCES transaction(id)
		ON DELETE CASCADE
);