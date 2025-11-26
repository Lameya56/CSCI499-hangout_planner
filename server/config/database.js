import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const isLocal = process.env.LOCAL === "TRUE";

const config = {
  user: isLocal ? process.env.PGUSER : process.env.PGUSERBUILD,
  password: isLocal ? process.env.PGPASSWORD : process.env.PGPASSWORDBUILD,
  host: isLocal ? process.env.PGHOST : process.env.PGHOSTBUILD,
  port: isLocal ? process.env.PGPORT : process.env.PGPORTBUILD,
  database: isLocal ? process.env.PGDATABASE : process.env.PGDATABASEBUILD,
  ssl: isLocal ? false : { rejectUnauthorized: false },
};

export const pool = new pg.Pool(config);
