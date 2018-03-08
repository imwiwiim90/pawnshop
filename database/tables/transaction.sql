CREATE TABLE transaction (
	id INT AUTO_INCREMENT PRIMARY KEY,
	created_at datetime not null default current_timestamp,
	product_id INT,
	client_id INT,
	execution_date date,
	FOREIGN KEY (product_id)
		REFERENCES product(id)
		ON DELETE CASCADE,
	FOREIGN KEY (client_id)
		REFERENCES client(id)
		ON DELETE CASCADE
);