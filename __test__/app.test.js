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

describe("/api/items", () => {
  describe("GET -Requests", () => {
    test("GET:200response with an array of all items", () => {
      return request(app)
        .get("/api/items")
        .expect(200)
        .then(({ body }) => {
          expect(body.items).toHaveLength(10);
        });
    });
  });
});
