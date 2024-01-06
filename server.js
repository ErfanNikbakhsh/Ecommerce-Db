const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

mongoose
  .connect(process.env.DB || 'mongodb://127.0.0.1:27017/digitic')
  .then(() => {
    console.log('Connected to MongoDB...');
  })
  .catch((error) => {
    console.log('Error connecting to the database:', error.message);
  });

const PORT = process.env.PORT || 4000;

app.use('/', (req, res) => {
  res.send('Hello from the server');
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}...`);
});
