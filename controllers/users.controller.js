const { fetchUsers, postUser, fetchUserByUsername } = require("../models/users.model");

const getUsers = (request, response, next) => {
  fetchUsers()
    .then((data) => {
      response.status(200).send({ users: data });
    })
    .catch((err) => {
      next(err);
    });
};

const addUser = (request, response, next) => {
  const user = request.body;
  postUser(user)
    .then((body) => {
      response.status(201).send({ user: body });
    })
    .catch((err) => {
      next(err);
    });
};
const getUserByUsername=(request, response, next)=>{
  const {username}= request.params
  fetchUserByUsername(username).then((user)=>{
    response.status(200).send({user})

  }).catch((err)=>{
    next(err)
  })
}
module.exports = { getUsers, addUser , getUserByUsername};
