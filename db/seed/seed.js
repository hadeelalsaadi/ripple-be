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
              image_url VARCHAR
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
              collection_state BOOLEAN,
              location gis.geography(POINT) not null
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
        "INSERT INTO categories (category_name,description, image_url) VALUES %L;",
        categoriesData.map(({ category_name, description, image_url }) => [
          category_name,
          description,
          image_url,
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
        "INSERT INTO items (item_name, category_id, user_id, description, image_url,collection_point, date_of_expire, date_listed, reserved_for_id, reserve_status, collection_state,location ) VALUES %L;",
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
            location,
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
            location,
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
    })
    .then(() => {
      return db.query(`create index items_geo_index
  on items
  using GIST (location);`);
    })
    .then(() => {
      return db.query(`create or replace function st_y(geo gis.geometry) 
              returns float
              language sql 
              as $$  
              SELECT ST_Y(geo);
              $$;
              create or replace function st_x(geo gis.geometry) 
              returns float
              language sql 
              as $$  
              SELECT ST_X(geo);
              $$;
            

`);
    })
    .then(() => {
      return db.query(`create or replace function nearby_items(lat float, long float)
                      returns table (item_id items.item_id%TYPE, item_name items.item_name%TYPE, lat float, long float, dist_meters float)
                      language sql
                      as $$
                      select item_id,  item_name, st_y(location::gis.geometry) as lat, st_x(location::gis.geometry)
                      as long, gis.st_distance(location::gis.geometry, POINT(long, lat)::gis.geometry) as dist_meters
                      from items
                      order by location::gis.geometry <-> POINT(long, lat)::gis.geometry;
        $$;`);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = seed;
