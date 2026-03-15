import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    console.log('Connecting to:', process.env.DATABASE_URL?.split('@')[1]);
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Success!', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

testConnection();
