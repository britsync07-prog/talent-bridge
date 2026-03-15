const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  // Try with no-verify in the string itself
  const dbUrl = process.env.DATABASE_URL + '&sslmode=no-verify';
  
  const client = new Client({
    connectionString: dbUrl.replace('sslmode=require', ''), // Avoid conflicts
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Testing with SSL bypass...');
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Success! Connection established at:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('Final connection test failed:', err.message);
    process.exit(1);
  }
}

testConnection();
