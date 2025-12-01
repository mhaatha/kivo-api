// src/app/index.js
const express = require('express');
const app = express();

// Middleware JSON parser
app.use(express.json());

module.exports = app;