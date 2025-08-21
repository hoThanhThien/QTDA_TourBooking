CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT
);
CREATE TABLE tours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  capacity INT DEFAULT 0,
  price DECIMAL(12,2) NOT NULL,
  start_date DATE,
  end_date DATE,
  status ENUM('Available','Full','Cancelled') DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX(category_id), INDEX(status), INDEX(start_date), INDEX(end_date)
);
CREATE TABLE photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tour_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  is_primary TINYINT(1) DEFAULT 0,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tour_id) REFERENCES tours(id),
  INDEX(tour_id)
);
CREATE TABLE discounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) UNIQUE NOT NULL,
  description VARCHAR(255),
  is_percent TINYINT(1) DEFAULT 1,
  discount_amount DECIMAL(12,2) NOT NULL,
  start_date DATE,
  end_date DATE
);
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tour_id INT NOT NULL,
  booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  number_of_people INT NOT NULL,
  status ENUM('Pending','Confirmed','Cancelled') DEFAULT 'Pending',
  total_amount DECIMAL(12,2) NOT NULL,
  discount_id INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (tour_id) REFERENCES tours(id),
  FOREIGN KEY (discount_id) REFERENCES discounts(id),
  INDEX(user_id), INDEX(tour_id), INDEX(status)
);
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('CreditCard','BankTransfer','SePay') DEFAULT 'SePay',
  payment_status ENUM('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  gateway_ref VARCHAR(120),
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  UNIQUE KEY uq_booking (booking_id)
);
