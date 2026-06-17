-- Create application database and role on Vultr VPS PostgreSQL.
-- Run as postgres superuser:
--   sudo -u postgres psql -f deploy/postgres/init-app-db.sql
--
-- Then set DATABASE_URL in production env:
--   postgresql://korea_auto_market:CHANGE_ME@127.0.0.1:5432/korea_auto_market

CREATE USER korea_auto_market WITH PASSWORD 'CHANGE_ME';
CREATE DATABASE korea_auto_market
  OWNER korea_auto_market
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;
GRANT ALL PRIVILEGES ON DATABASE korea_auto_market TO korea_auto_market;

\c korea_auto_market

CREATE EXTENSION IF NOT EXISTS pg_trgm;

GRANT ALL ON SCHEMA public TO korea_auto_market;
