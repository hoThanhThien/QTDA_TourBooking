INSERT IGNORE INTO roles (id,name) VALUES (1,'admin'),(2,'customer');
INSERT IGNORE INTO users(username,email,phone,password_hash,role_id)
VALUES ('admin','admin@example.com','0900000000',SHA2('admin123',256),1);
