# kivo-api
API for Kivo hackathon project by IMPHNEN (Ingin Menjadi Programmer Handal Namun Enggan Ngoding)

## Enabling MongoDB ACID Transactions

To enable ACID features in MongoDB, you must run MongoDB as a **replica set**, even if it's a single-node setup.

### Steps

1. Start the services:

```bash
docker compose up -d
```

2. Initialize the replica set:

```bash
docker exec -it kivo-mongo mongosh --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] })"
```

Once the replica set is active, full ACID transactions will be available for your MongoDB operations.
