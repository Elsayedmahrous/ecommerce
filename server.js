const path = require('path');

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');

dotenv.config({ path: 'config.env' });

const ApiError = require('./utils/apiError');
const globalError = require('./middlewera/errorMiddleware');
const dbConnection = require('./config/database');
const mountRoutes = require('./Routes/index')

dbConnection();
// APP Express
const app = express();
// Enable other domains to access your application
app.use(cors());
app.options('*', cors());
// compress all responses
app.use(compression())
// middelwares
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`)
}

// mountRoutes
mountRoutes(app);

app.all('*', (req, res, next) => {
  next(new ApiError(`Can not find this route :${req.originalUrl}`, 400))
});

// Global error handling middleware
app.use(globalError)

const PORT = process.env.PORT || 8000
const server = app.listen(PORT, () => {
    console.log(`App running ${PORT}...`);
})

// Handle rejection outside express
process.on('unhandledRejection', (err) => {
  console.error(`unhandledREjection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error('Shutting down');
    process.exit(1);
  })
    
})