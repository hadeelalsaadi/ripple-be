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


const fetchUserByUsername = (username)=>{
  return db.query("select * from users where username = $1",[username]).then(({rows})=>{
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "user not found" });
    }
    return rows[0]
  })

}
module.exports = { fetchUsers, postUser, fetchUserByUsername };
