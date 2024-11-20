const db = require("../db/connection.js");

const fetchCategories = () => {
  return db.query(`select * from categories`).then(({ rows }) => {
    return rows;
  });
};

module.exports = fetchCategories;
