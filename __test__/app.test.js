const endpoints = require("../endpoints.json");
const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection.js");
const seed = require("../db/seed/seed.js");
const data = require("../db/data/test-data/index.js");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("/api", () => {
  test("GET:200 status - return all endpoints description", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
});
describe("/any", () => {
  test("GET:404 -return msg endpoint does not exist", () => {
    return request(app)
      .get("/hello")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Endpoint does not exist!");
      });
  });
});
describe("/api/items", () => {
  describe("GET -Requests-items", () => {
    test("GET:200 response with an array of all items", () => {
      return request(app)
        .get("/api/items")
        .expect(200)
        .then(({ body }) => {
          expect(body.items).toHaveLength(10);
        });
    });
  });
});
describe("/api/items/:item_id", () => {
  describe("GET-Requests-item-by-id", () => {
    test("GET:200 response with an item object", () => {
      return request(app)
        .get("/api/items/1")
        .expect(200)
        .then(({ body }) => {
          expect(Object.keys(body.item).length).toBe(12);
          expect(body.item.item_id).toBe(1);
        });
    });
  });
});
