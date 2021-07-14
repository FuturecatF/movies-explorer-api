const Movie = require('../models/movie');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const CastError = require('../errors/CastError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movie) => {
      res.status(200).send(movie);
    })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  })
    .then((movie) => res.status(200).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError('Переданы некорректные данные при создании карточки');
      }
    })
    .catch(next);
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(new NotFoundError('Карточка с указанным _id не найдена'))
    .then((movie) => {
      const movieOwner = movie.owner.toString();
      if (movieOwner !== req.user._id) {
        next(new ForbiddenError('Нельзя удалить карточку другого пользователя'));
      } else {
        Movie.findByIdAndDelete(req.params.movieId).then(() => {
          res.status(200).send({ message: 'Карточка удалена' });
        });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new CastError('Некорректный _id'));
      }
      throw new NotFoundError(err.message);
    })
    .catch(next);
};
