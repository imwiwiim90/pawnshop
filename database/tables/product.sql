CREATE TABLE product (
	id INT AUTO_INCREMENT PRIMARY KEY,
	created_at datetime not null default current_timestamp,
	inventory_id VARCHAR(100),
	name VARCHAR(50),
	description VARCHAR(140),
	state TINYINT,
	INDEX (inventory_id)
);