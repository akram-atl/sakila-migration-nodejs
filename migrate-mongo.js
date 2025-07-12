require('dotenv').config(); // Load environment variables from .env file
const { Client } = require('pg'); // Import PostgreSQL client
const { MongoClient } = require('mongodb'); // Import MongoDB client

// Function to migrate data from 'language' table in PostgreSQL to 'languages' collection in MongoDB
async function migrateLanguages(pgClient, mongoDb) {
  const res = await pgClient.query('SELECT * FROM language'); // Get all languages from PostgreSQL
  // Map each row to a MongoDB document format
  const docs = res.rows.map(lang => ({
    language_id: lang.language_id,
    name: lang.name,
    last_update: lang.last_update.toISOString(), // Convert date to ISO string
  }));
  // Insert all documents into MongoDB collection
  const result = await mongoDb.collection('languages').insertMany(docs);
  console.log(`✅ Migrated ${result.insertedCount} languages`);
}

// Function to migrate data from 'category' table to 'categories' collection
async function migrateCategories(pgClient, mongoDb) {
  const res = await pgClient.query('SELECT * FROM category'); // Fetch categories
  const docs = res.rows.map(cat => ({
    category_id: cat.category_id,
    name: cat.name,
    last_update: cat.last_update.toISOString(),
  }));
  const result = await mongoDb.collection('categories').insertMany(docs);
  console.log(`✅ Migrated ${result.insertedCount} categories`);
}

// Function to migrate data from 'actor' table to 'actors' collection
async function migrateActors(pgClient, mongoDb) {
  const res = await pgClient.query('SELECT * FROM actor'); // Fetch actors
  const docs = res.rows.map(actor => ({
    actor_id: actor.actor_id,
    first_name: actor.first_name,
    last_name: actor.last_name,
    last_update: actor.last_update.toISOString(),
  }));
  const result = await mongoDb.collection('actors').insertMany(docs);
  console.log(`✅ Migrated ${result.insertedCount} actors`);
}

// Function to migrate data from 'film' and related 'film_actor' tables to 'films' collection
async function migrateFilms(pgClient, mongoDb) {
  // Fetch all films from PostgreSQL
  const filmsRes = await pgClient.query('SELECT * FROM film');

  // Fetch relationships between films and actors
  const filmActorRes = await pgClient.query('SELECT * FROM film_actor');

  // Build a map of film_id to a list of actor_ids for easy lookup
  const filmActorsMap = new Map();
  filmActorRes.rows.forEach(row => {
    if (!filmActorsMap.has(row.film_id)) filmActorsMap.set(row.film_id, []);
    filmActorsMap.get(row.film_id).push(row.actor_id);
  });

  // Prepare film documents including embedded list of actor_ids
  const filmDocs = filmsRes.rows.map(film => ({
    film_id: film.film_id,
    title: film.title,
    description: film.description,
    release_year: film.release_year,
    language_id: film.language_id,
    rental_duration: film.rental_duration,
    rental_rate: film.rental_rate,
    length: film.length,
    replacement_cost: film.replacement_cost,
    rating: film.rating,
    special_features: film.special_features,
    actor_ids: filmActorsMap.get(film.film_id) || [], // Include actor references
    last_update: film.last_update.toISOString(),
  }));

  // Insert all film documents into MongoDB
  const result = await mongoDb.collection('films').insertMany(filmDocs);
  console.log(`✅ Migrated ${result.insertedCount} films`);
}

async function main() {
  // Initialize PostgreSQL client with connection info from environment variables
  const pgClient = new Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  });

  // Initialize MongoDB client using connection URI from environment variables
  const mongoClient = new MongoClient(process.env.MONGO_URI);

  try {
    await pgClient.connect(); // Connect to PostgreSQL
    await mongoClient.connect(); // Connect to MongoDB

    const db = mongoClient.db('sakila_nosql'); // Use database 'sakila_nosql' in MongoDB

    // Run migration functions sequentially
    await migrateLanguages(pgClient, db);
    await migrateCategories(pgClient, db);
    await migrateActors(pgClient, db);
    await migrateFilms(pgClient, db);

    console.log('🎉 All MongoDB migrations completed!');
  } catch (err) {
    console.error('Migration failed:', err); // Log any errors during migration
  } finally {
    // Close both database connections properly
    await pgClient.end();
    await mongoClient.close();
  }
}

// Run the main migration function
main();
