-- Runs once, when the Postgres container is first created.
-- Separate database for the server's database integration tests (npm run test:db).
CREATE DATABASE songs_test;
