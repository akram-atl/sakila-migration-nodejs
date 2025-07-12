const redis = require('redis'); // Import Redis client

async function checkRedis() {
  // Create Redis client using host and port from environment variables
  const redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  });

  // Handle Redis connection errors
  redisClient.on('error', (err) => console.error('Redis Client Error', err));

  await redisClient.connect(); // Connect to Redis server

  // Retrieve the value of the key 'country:1' to check if data is migrated
  const country1 = await redisClient.get('country:1');
  console.log('Country 1 in Redis:', country1);

  await redisClient.disconnect(); // Disconnect from Redis server
}

// Run the Redis data check function
checkRedis();
