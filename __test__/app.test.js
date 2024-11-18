const endpoints = require("../endpoints.json");
const request = require("supertest");
const app = require("../app.js");

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
