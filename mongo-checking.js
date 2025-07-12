require('dotenv').config(); // Load environment variables from .env
const { MongoClient } = require('mongodb'); // Import MongoDB client

// Use MONGO_URI from env or default to localhost with database 'sakila_nosql'
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sakila_nosql';
const client = new MongoClient(uri);

// Function to check document counts in important collections
async function checkMongoData() {
  try {
    await client.connect(); // Connect to MongoDB server
    const db = client.db(); // Use default database from connection string

    // Collections to check document count for
    const collections = ['languages', 'categories', 'actors', 'films'];

    // Loop through each collection and count documents
    for (const colName of collections) {
      const count = await db.collection(colName).countDocuments();
      console.log(`✅ Collection "${colName}" has ${count} documents`);
    }

    console.log('🎉 MongoDB check completed successfully!');
  } catch (err) {
    console.error('❌ Error while checking MongoDB:', err); // Log errors if any
  } finally {
    await client.close(); // Close connection after checking
  }
}

// Run the data check function
checkMongoData();
