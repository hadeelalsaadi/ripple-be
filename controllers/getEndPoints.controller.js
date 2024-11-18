const endpoints = require("../endpoints.json");

const getEndPoints = (request, response, next) => {
  response.status(200).send({ endpoints: endpoints });
};

module.exports = getEndPoints;
