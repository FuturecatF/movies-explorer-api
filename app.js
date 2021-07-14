require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const limiter = require('./middlewares/limiter');
const router = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const { DB_ADDRESS = 'mongodb://localhost:27017/diplomadb', PORT = 3000 } = process.env;

const app = express();
app.use(helmet());
app.use(cors());

app.use(bodyParser.json());
mongoose.connect(DB_ADDRESS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger);
app.use(limiter);
app.use('/', router);
app.use(errorLogger);

app.use(errors());

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
