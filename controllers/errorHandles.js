const { request, response } = require("../app");

const customErrorHandler = (err, request, response, next) => {
  if (err.status && err.msg) {
    response.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};
const psqlErrorHandler = (err, request, response, next) => {
  if (err.code === "22P02" || err.code === "23502") {
    response.status(400).send({ msg: "Bad request" });
  }
  next(err);
};

const serverErrorHandler = (err, request, response, next) => {
  console.log(err.stack);
  response.status(500).send({ msg: "internal server Error" });
};

module.exports = { customErrorHandler, psqlErrorHandler, serverErrorHandler };
