const format = require("pg-format");
const db = require("../connection.js");

const seed = ({ itemsData, messagesData, categoriesData, usersData }) => {
  return db
    .query(`DROP TABLE IF EXISTS items;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS messages;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS categories;`);
    })
    .then(() => {
      const categoriesTablePromise = db.query(`
            CREATE TABLE categories(
              category_id SERIAL PRIMARY KEY,
              category_name VARCHAR,
              description TEXT,
              img_url VARCHAR
            );`);
      const usersTablePromise = db.query(`
                CREATE TABLE users (
                  user_id SERIAL PRIMARY KEY,
                  username VARCHAR NOT NULL,
                  name VARCHAR,
                  area VARCHAR ,
                  email VARCHAR,
                  rating DECIMAL,
                  avatar_url VARCHAR
                );`);

      return Promise.all([categoriesTablePromise, usersTablePromise]);
    })
    .then(() => {
      return db.query(`
            CREATE TABLE items (
              item_id SERIAL PRIMARY KEY,
              item_name VARCHAR NOT NULL,
              category_id INT NOT NULL REFERENCES categories(category_id),
              user_id INT NOT NULL REFERENCES users(user_id),
              description VARCHAR NOT NULL,
              image_url VARCHAR, 
              collection_point VARCHAR,
              date_of_expire TIMESTAMP, 
              date_listed  TIMESTAMP, 
              reserved_for_id INT REFERENCES users(user_id),
              reserve_status BOOLEAN,
              collection_state BOOLEAN
            );`);
    })
    .then(() => {
      return db.query(` CREATE TABLE messages (
             message_id SERIAL PRIMARY KEY,
             sender_id INT NOT NULL REFERENCES users(user_id),
             receiver_id INT NOT NULL REFERENCES users(user_id),
             body VARCHAR NOT NULL,
             sent_at TIMESTAMP
            );`);
    })
    .then(() => {
      const insertCategories = format(
        "INSERT INTO categories (category_name,description, img_url) VALUES %L;",
        categoriesData.map(({ category_name, description, img_url }) => [
          category_name,
          description,
          img_url,
        ])
      );

      const insertUsers = format(
        "INSERT INTO users (username,name, area, email, rating, avatar_url) VALUES %L;",
        usersData.map(({ username, name, area, email, rating, avatar_url }) => [
          username,
          name,
          area,
          email,
          rating,
          avatar_url,
        ])
      );

      const insertCategoriesQuery = db.query(insertCategories);
      const insertUsersQuery = db.query(insertUsers);
      return Promise.all([insertCategoriesQuery, insertUsersQuery]);
    })

    .then(() => {
      const insertitems = format(
        "INSERT INTO items (item_name, category_id, user_id, description, image_url,collection_point, date_of_expire, date_listed, reserved_for_id, reserve_status, collection_state ) VALUES %L;",
        itemsData.map(
          ({
            item_name,
            category_id,
            user_id,
            description,
            image_url,
            collection_point,
            date_of_expire,
            date_listed,
            reserved_for_id,
            reserve_status,
            collection_state,
          }) => [
            item_name,
            category_id,
            user_id,
            description,
            image_url,
            collection_point,
            date_of_expire,
            date_listed,
            reserved_for_id,
            reserve_status,
            collection_state,
          ]
        )
      );
      return db.query(insertitems);
    })
    .then(() => {
      const insertmessages = format(
        "INSERT INTO messages (sender_id, receiver_id, body, sent_at) VALUES %L;",
        messagesData.map(({ sender_id, receiver_id, body, sent_at }) => [
          sender_id,
          receiver_id,
          body,
          sent_at,
        ])
      );
      return db.query(insertmessages);
    });
};

module.exports = seed;
