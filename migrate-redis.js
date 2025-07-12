require('dotenv').config(); // Load environment variables from .env
const { Client } = require('pg'); // Import PostgreSQL client
const redis = require('redis'); // Import Redis client

// Initialize PostgreSQL client
const pgClient = new Client({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

// Initialize Redis client
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Function to migrate countries to Redis
async function migrateCountries() {
  const res = await pgClient.query('SELECT country_id, country FROM country');
  for (let row of res.rows) {
    await redisClient.set(`country:${row.country_id}`, row.country);
    console.log(`✅ country:${row.country_id} => ${row.country}`);
  }
  console.log('✅ Countries migration done!');
}

// Function to migrate cities to Redis
async function migrateCities() {
  const res = await pgClient.query('SELECT city_id, city FROM city');
  for (let row of res.rows) {
    await redisClient.set(`city:${row.city_id}`, row.city);
    console.log(`✅ city:${row.city_id} => ${row.city}`);
  }
  console.log('✅ Cities migration done!');
}

// Main function to run both migrations
async function runMigration() {
  try {
    await pgClient.connect();
    await redisClient.connect();

    await migrateCountries();
    await migrateCities();

    console.log('🎉 All Redis migrations (country + city) completed!');
  } catch (err) {
    console.error('❌ Error during migration:', err);
  } finally {
    await pgClient.end();
    await redisClient.disconnect();
  }
}

runMigration();
