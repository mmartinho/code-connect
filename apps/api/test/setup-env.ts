// E2E tests run against a dedicated database, never the development one
process.env.DB_DATABASE = process.env.DB_TEST_DATABASE ?? 'code_connect_test';
