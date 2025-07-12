# Sakila Migration Project

This project demonstrates how to migrate data from a PostgreSQL relational database (Sakila) to NoSQL databases Redis and MongoDB using Node.js.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Prerequisites](#prerequisites)
* [Setup Steps](#setup-steps)
* [Project Structure and Files](#project-structure-and-files)
* [Running the Migration](#running-the-migration)
* [Checking Migrated Data](#checking-migrated-data)
* [Notes](#notes)

---

## Project Overview

* The Sakila database (originally for MySQL, adapted for PostgreSQL) is migrated partially into:

  * **Redis** (key-value store) for `country` and `city` tables
  * **MongoDB** (document store) for `film`, `actor`, `category`, and `language` tables

* Migration scripts are written in Node.js using the official clients for PostgreSQL, Redis, and MongoDB.

---

## Prerequisites

* Docker & Docker Compose installed on your system
* Node.js (v16+) and npm installed
* Basic familiarity with command line and environment variables

---

## Setup Steps

1. **Create project directory and open in VS Code**

   ```bash
   mkdir sakila-migration
   cd sakila-migration
   code .
   ```

2. **Create `.env` file** with database credentials and connection info:

   ```env
   PG_HOST=localhost
   PG_PORT=5432
   PG_USER=postgres
   PG_PASSWORD=postgres
   PG_DATABASE=sakila

   REDIS_HOST=localhost
   REDIS_PORT=6379

   MONGO_URI=mongodb://localhost:27017
   ```

3. **Create `docker-compose.yml`** to run PostgreSQL, Redis, and MongoDB containers:

   ```yaml
   version: '3.8'

   services:
     postgres:
       image: postgres:13
       container_name: sakila-postgres
       environment:
         POSTGRES_DB: sakila
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
       ports:
         - "5432:5432"
       volumes:
         - ./db:/docker-entrypoint-initdb.d

     redis:
       image: redis:7
       container_name: sakila-redis
       ports:
         - "6379:6379"

     mongodb:
       image: mongo:5
       container_name: sakila-mongo
       ports:
         - "27017:27017"
   ```

4. **Run the Docker containers in detached mode:**

   ```bash
   docker-compose up -d
   ```

5. **Initialize the PostgreSQL Sakila database** by placing `sakila-schema.sql` and `sakila-data.sql` into the `./db` directory (bind-mounted in docker-compose).

---

## Project Structure and Files

| Filename             | Description                                                                       | Main Functions / Purpose                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `migrate-redis.js`   | Migration script from PostgreSQL `country` table to Redis key-value store         | `migrateCountries()` - fetch countries and save in Redis keys                                                                    |
| `migrate-mongo.js`   | Migration script for MongoDB collections: `language`, `category`, `actor`, `film` | Functions like `migrateLanguages()`, `migrateFilms()` etc., migrate relational data to MongoDB documents with relations embedded |
| `redis-checking.js`  | Script to connect to Redis and verify data migration                              | `checkRedis()` - read a sample country key to verify migration                                                                   |
| `mongo-checking.js`  | Script to connect to MongoDB and verify collections document counts               | `checkMongoData()` - count documents in all migrated collections                                                                 |
| `.env`               | Environment variables configuration                                               | Stores connection info for Postgres, Redis, MongoDB                                                                              |
| `docker-compose.yml` | Docker Compose file to spin up Postgres, Redis, MongoDB                           | Sets up necessary containers with ports and volumes                                                                              |

---

## Running the Migration

### 1. Run Redis Migration

```bash
node migrate-redis.js
```

* Connects to PostgreSQL, fetches all countries, and stores each country in Redis with keys like `country:1`, `country:2`, etc.

### 2. Run MongoDB Migration

```bash
node migrate-mongo.js
```

* Migrates `language`, `category`, `actor`, and `film` tables from PostgreSQL to MongoDB collections.
* Handles film-actor relationships by embedding actor IDs inside film documents.

---

## Checking Migrated Data

### Redis Check

```bash
node redis-checking.js
```

* Connects to Redis and retrieves a sample key value (`country:2`) to verify data was stored.

### MongoDB Check

```bash
node mongo-checking.js
```

* Connects to MongoDB and counts documents in each collection to ensure data was migrated.

---

## Notes

* Make sure the `.env` file is properly configured with your Docker container ports and credentials.
* You can reset the MongoDB collections or Redis keys before rerunning migration to avoid duplicate data.
* Use Docker logs and `docker exec` to troubleshoot container issues.
* Ensure you have run `npm install` to install all dependencies (`pg`, `redis`, `mongodb`, `dotenv`).


