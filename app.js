require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//const { errors } = require('celebrate');
const auth = require('./middlewares/auth');
// const { errors } = require('celebrate');

// const { requestLogger, errorLogger } = require('./middlewares/logger');

const { DB_ADDRESS = 'mongodb://localhost:27017/diplomadb', PORT = 3000 } = process.env;

const app = express();
app.use(cors());
const { login, createUser } = require('./controllers/users');
const userRouter = require('./routes/users');

app.use(bodyParser.json());
mongoose.connect(DB_ADDRESS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.post('/signin', login);
app.post('/signup', createUser);

app.use('/users', auth, userRouter);



/* app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
}); */

/* app.use('/users', auth, userRouter);
app.use('/cards', auth, cardsRouter); */

/* app.use(errors()); */

/* app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
}); */
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
