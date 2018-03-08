CREATE TABLE client (
	id INT AUTO_INCREMENT PRIMARY KEY,
	created_at datetime not null default current_timestamp,
	name VARCHAR(100),
	cc VARCHAR(50),
	phone VARCHAR(100),
	INDEX (cc)
);