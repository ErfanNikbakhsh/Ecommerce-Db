const mongoose = require('mongoose');

const dbConnect = () => {
  mongoose
    .connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/digitic')
    .then(() => {
      console.log('Connected to MongoDB...');
    })
    .catch((error) => {
      console.log('Error connecting to the database:', error.message);
    });
};

module.exports = dbConnect;
