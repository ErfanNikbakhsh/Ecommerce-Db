const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const dbConnect = require('./config/dbConnect');
const authRouter = require('./routes/authRoutes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const PORT = process.env.PORT || 4000;
dbConnect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/user', authRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}...`);
});
