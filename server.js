const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');

const authRouter = require('./routes/authRoutes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.DB || 'mongodb://127.0.0.1:27017/digitic')
  .then(() => {
    console.log('Connected to MongoDB...');
  })
  .catch((error) => {
    console.log('Error connecting to the database:', error.message);
  });

app.use(bodyParser.json());

app.use('/api/user', authRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}...`);
});
