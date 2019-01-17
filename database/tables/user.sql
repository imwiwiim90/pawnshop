CREATE TABLE user (
	id INT AUTO_INCREMENT PRIMARY KEY,
	created_at datetime not null default current_timestamp,
	username VARCHAR(50),
	password VARCHAR(100)
);