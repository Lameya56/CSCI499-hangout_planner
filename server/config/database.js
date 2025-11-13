import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  ssl: {
    require: true,
    rejectUnauthorized: false, // allows self-signed AWS certificates
  },
};

export const pool = new pg.Pool(config);
