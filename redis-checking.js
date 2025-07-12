require('dotenv').config(); // Load environment variables from .env
const redis = require('redis'); // Import Redis client

// Initialize Redis client
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

async function checkRedis() {
  try {
    await redisClient.connect();

    // Get all keys for countries
    const countryKeys = await redisClient.keys('country:*');
    console.log(`✅ Total countries in Redis: ${countryKeys.length}`);

    // Print a sample
    if (countryKeys.length > 0) {
      const sampleCountry = await redisClient.get(countryKeys[0]);
      console.log(`🧪 Sample country: ${countryKeys[0]} => ${sampleCountry}`);
    }

    // Get all keys for cities
    const cityKeys = await redisClient.keys('city:*');
    console.log(`✅ Total cities in Redis: ${cityKeys.length}`);

    // Print a sample
    if (cityKeys.length > 0) {
      const sampleCity = await redisClient.get(cityKeys[0]);
      console.log(`🧪 Sample city: ${cityKeys[0]} => ${sampleCity}`);
    }

    console.log('🎉 Redis country and city check completed successfully!');
  } catch (err) {
    console.error('❌ Error while checking Redis:', err);
  } finally {
    await redisClient.disconnect();
  }
}

checkRedis();
