// test/auth.test.ts
import request from "supertest";
import app from "../src/server";
import User from "../src/models/User";

describe("Auth", () => {
  const server = app;

  it("should register and login a user", async () => {
    const registerRes = await request(server)
      .post("/api/v1/auth/register")
      .send({ name: "Test", email: "test@example.com", password: "Password123!", role: "admin" })
      .expect(201);

    expect(registerRes.body.user.email).toBe("test@example.com");

    const loginRes = await request(server)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "Password123!" })
      .expect(200);

    expect(loginRes.body.user.email).toBe("test@example.com");
    // token may be in cookie — check cookie header
    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeDefined();
  });
});