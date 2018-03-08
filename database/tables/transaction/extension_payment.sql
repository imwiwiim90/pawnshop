CREATE TABLE transaction_extension_payment (
	id INT AUTO_INCREMENT PRIMARY KEY,
	created_at datetime not null default current_timestamp,
	transaction_id INT,
	payment VARCHAR(50),
	number_of_payments TINYINT,
	FOREIGN KEY (transaction_id)
		REFERENCES transaction(id)
		ON DELETE CASCADE
);