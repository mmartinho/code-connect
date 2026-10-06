-- Database used by the API e2e tests (runs only on the first container start)
CREATE DATABASE IF NOT EXISTS code_connect_test
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON code_connect_test.* TO 'code_connect'@'%';
FLUSH PRIVILEGES;
