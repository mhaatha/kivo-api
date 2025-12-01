# kivo-api
API for Kivo hackathon project by IMPHNEN (Ingin Menjadi Programmer Handal Namun Enggan Ngoding)

## Prerequisites

- Node.js (Latest LTS)
- Docker & Docker Compose

## Database Setup (MongoDB Replica Set)

This project uses the **Better Auth** feature, which requires **ACID Transactions** support. Therefore, MongoDB must be run in **Replica Set** mode.

Follow these steps to run the database:

1. **Run the Container**
   Run MongoDB using Docker Compose:
   ```bash
   docker compose up -d
   ```
2. **Replica Set initialization**
   Once the container is running, run the following command to enable the transaction feature:
   ```bash
   docker exec -it kivo-mongo mongosh --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] })"
   ```
If the output displays { "ok" : 1 }, it means the database setup was successful.

## Installation & Running
1. **Install Dependencies**
   ```bash
   npm install
   ```
2. **Setup Environment Variables: Copy .env.example to .env and adjust the contents.**
3. **Run the development server:**
   ```bash
   npm run dev
   ```
