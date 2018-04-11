CREATE TABLE transaction_close (
	id INT AUTO_INCREMENT PRIMARY KEY,
	created_at datetime not null default current_timestamp,
	transaction_id INT,
	payment VARCHAR(50),
	FOREIGN KEY (transaction_id)
		REFERENCES transaction(id)
		ON DELETE CASCADE
);