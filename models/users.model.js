const db = require("../db/connection.js");

const fetchUsers = () => {
  return db.query("select * from users").then(({ rows }) => {
    return rows;
  });
};

const postUser = ({ username, name, area, email, rating, avatar_url }) => {
  return db
    .query(
      "insert into users (username, name, area, email, rating, avatar_url) values ($1,$2,$3,$4,$5,$6) returning *",
      [username, name, area, email, rating, avatar_url]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
module.exports = { fetchUsers, postUser };
