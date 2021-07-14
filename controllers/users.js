const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const CastError = require('../errors/CastError');
const DublicateError = require('../errors/DublicateError');
const UnauthorizedError = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = (req, res, next) => {
  const { email, password, name } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => {
      res.status(201).send({
        name: user.name,
        _id: user._id,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные при создании пользователя');
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new DublicateError('Пользователь с таким email уже существует');
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password, name } = req.body;

  return User.findUserByCredentials(email, password, name)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'secret-slovo',
        {
          expiresIn: '7d',
        },
      );
      return res.send({ token });
    })
    .catch(() => {
      throw new UnauthorizedError('Неправильные почта или пароль');
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  return User.findOne({ _id })
    .orFail(new NotFoundError('Нет пользователя с таким _id'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      throw new NotFoundError(err.message);
    })
    .catch(next);
};

module.exports.updateProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(new NotFoundError('Пользователь с указанным _id не найден'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new CastError('Переданы некорректные данные при обновлении профиля');
      }
      if (err.name === 'MongoError') {
        throw new DublicateError('пользователь с таким email уже существует');
      }
      if (err.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные при обновлении профиля');
      }
      throw new NotFoundError(err.message);
    })
    .catch(next);
};
