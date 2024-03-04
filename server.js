const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const dbConnect = require('./config/dbConnect');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const blogRoutes = require('./routes/blogRoutes');
const prodCategoryRoutes = require('./routes/prodCategoryRoutes');
const blogCategoryRoutes = require('./routes/blogCategoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const couponRoutes = require('./routes/couponRoutes');
const cartRoutes = require('./routes/cartRoutes');
const colorRoutes = require('./routes/colorRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { swaggerDocs, options } = require('./config/swaggerConfig');

const PORT = process.env.PORT || 4000;
dbConnect();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/user', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/prodCategory', prodCategoryRoutes);
app.use('/api/blogCategory', blogCategoryRoutes);
app.use('/api/brand', brandRoutes);
app.use('/api/coupon', couponRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/color', colorRoutes);
app.use('/api/order', orderRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, options));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}...`);
});
