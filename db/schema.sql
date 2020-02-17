DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

USE employees_db;

CREATE TABLE `employees_db`.`department`
(
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR
(30) NOT NULL,
  PRIMARY KEY
(`id`));

CREATE TABLE `employees_db`.`role`
(
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR
(30) NOT NULL,
  `salary` DECIMAL NULL,
  `department_id` INT NULL,
  PRIMARY KEY
(`id`),
CONSTRAINT FK_DEPT FOREIGN KEY
(department_id)
    REFERENCES department
(id)
  ON
DELETE CASCADE
  ON
UPDATE CASCADE
);

CREATE TABLE `employees_db`.`employee`
(
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR
(30) NOT NULL,
  `last_name` VARCHAR
(30) NOT NULL,
  `role_id` INT NULL,
  `manager_id` INT NULL,
  PRIMARY KEY
(`id`),
  CONSTRAINT FK_ROLE FOREIGN KEY
(role_id)
    REFERENCES role
(id)
  ON
DELETE CASCADE
  ON
UPDATE CASCADE
  )
    
COMMENT = 'This table stores the employees information';
