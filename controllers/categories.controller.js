const fetchCategories = require("../models/categories.model");

const getCategories = (request, response, next) => {
  fetchCategories()
    .then((data) => {
      response.status(200).send({ categories: data });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = getCategories;
