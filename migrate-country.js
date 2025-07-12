require('dotenv').config(); // Load environment variables from .env
const { Client } = require('pg'); // Import PostgreSQL client
const redis = require('redis'); // Import Redis client

// Initialize PostgreSQL client with environment variables
const pgClient = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

// Initialize Redis client with environment variables for host and port
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Log environment variable status to help with debugging
console.log("🔍 ENV CHECK:");
console.log("PG_USER:", process.env.PG_USER);
console.log("PG_PASSWORD:", process.env.PG_PASSWORD ? 'Loaded ✅' : 'Missing ❌');

// Main migration function to transfer countries from PostgreSQL to Redis
async function migrateCountries() {
  try {
    await pgClient.connect();    // Connect to PostgreSQL database
    await redisClient.connect(); // Connect to Redis server

    // Query all country_id and country names from PostgreSQL
    const res = await pgClient.query('SELECT country_id, country FROM country');

    // For each row, set a Redis key-value pair with key "country:<id>" and value "<country name>"
    for (let row of res.rows) {
      await redisClient.set(`country:${row.country_id}`, row.country);
      console.log(`✅ country:${row.country_id} => ${row.country}`);
    }

    console.log('✅ Migration finished!');
  } catch (err) {
    console.error('❌ Error:', err); // Log any errors
  } finally {
    // Clean up connections after migration
    await pgClient.end();
    await redisClient.disconnect();
  }
}

// Run the migration
migrateCountries();
