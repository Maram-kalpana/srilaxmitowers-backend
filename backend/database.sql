-- Srilaxmi ERP Database Schema
CREATE DATABASE IF NOT EXISTS srilaxmi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE srilaxmi;

-- Users (authentication)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NULL UNIQUE,
  phone VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  role ENUM('admin', 'employee', 'user') NOT NULL DEFAULT 'user',
  employee_ref_id INT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_users_role (role),
  INDEX idx_users_deleted (deleted_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_user (user_id),
  INDEX idx_refresh_expires (expires_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reset_user (user_id)
) ENGINE=InnoDB;

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  manager_id INT NULL,
  manager_name VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_projects_start_date (start_date),
  INDEX idx_projects_deleted (deleted_at),
  INDEX idx_projects_manager (manager_id)
) ENGINE=InnoDB;

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_name VARCHAR(255) NOT NULL,
  insurance_date DATE NOT NULL,
  road_tax_expiry_date DATE NOT NULL,
  total_permit_expiry_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_vehicles_deleted (deleted_at)
) ENGINE=InnoDB;

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  employee_id VARCHAR(50) NOT NULL UNIQUE,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  dob DATE NULL,
  designation VARCHAR(150) NULL,
  aadhar VARCHAR(12) NULL,
  monthly_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  project_id INT NULL,
  vehicle_id INT NULL,
  route VARCHAR(255) NULL,
  training_start DATE NULL,
  training_end DATE NULL,
  pass_photo_url VARCHAR(500) NULL,
  aadhar_card_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  INDEX idx_employees_employee_id (employee_id),
  INDEX idx_employees_deleted (deleted_at)
) ENGINE=InnoDB;

ALTER TABLE projects
  ADD CONSTRAINT fk_projects_manager
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE users
  ADD CONSTRAINT fk_users_employee
  FOREIGN KEY (employee_ref_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Machines
CREATE TABLE IF NOT EXISTS machines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_type ENUM('in', 'out') NOT NULL,
  machine_name VARCHAR(255) NOT NULL,
  serial_no VARCHAR(100) NOT NULL,
  model VARCHAR(150) NOT NULL,
  project_id INT NULL,
  return_or_repair ENUM('return', 'repair') NOT NULL DEFAULT 'return',
  record_date DATE NOT NULL,
  handover_name VARCHAR(150) NULL,
  handover_designation VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  INDEX idx_machines_entry (entry_type),
  INDEX idx_machines_date (record_date),
  INDEX idx_machines_deleted (deleted_at)
) ENGINE=InnoDB;

-- Expenses (advances)
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  employee_name VARCHAR(150) NOT NULL,
  advance_type ENUM('petrol', 'ta-da', 'others') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_expenses_date (expense_date),
  INDEX idx_expenses_employee (employee_id),
  INDEX idx_expenses_deleted (deleted_at)
) ENGINE=InnoDB;

-- Work details
CREATE TABLE IF NOT EXISTS work_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_date DATE NOT NULL,
  name VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_work_date (work_date),
  INDEX idx_work_status (status),
  INDEX idx_work_deleted (deleted_at)
) ENGINE=InnoDB;

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('present', 'absent') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uk_attendance_emp_date (employee_id, attendance_date),
  INDEX idx_attendance_date (attendance_date),
  INDEX idx_attendance_deleted (deleted_at)
) ENGINE=InnoDB;

-- Uploads log
CREATE TABLE IF NOT EXISTS uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  upload_type ENUM('image', 'pdf', 'document') NOT NULL,
  uploaded_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Seed admin (password: admin123) - bcrypt hash generated at runtime by init script
-- INSERT handled by src/scripts/initDb.js
