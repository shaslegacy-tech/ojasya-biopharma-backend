// test/product.test.ts
import request from "supertest";
import app from "../src/server";
import User from "../src/models/User";

describe("Products", () => {
  let token = "";

  beforeAll(async () => {
    // create admin and get token
    await request(app).post("/api/v1/auth/register").send({ name: "Admin", email: "admin@example.com", password: "Password123!", role: "admin" });
    const login = await request(app).post("/api/v1/auth/login").send({ email: "admin@example.com", password: "Password123!" });
    // token might be in cookie or response body — try cookie first
    const cookies = login.headers["set-cookie"];
    const cookieArray: string[] = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
    if (cookieArray.length) {
      const tokenCookie = cookieArray.find((c: string) => c.startsWith("token="));
      if (tokenCookie) token = tokenCookie.split(";")[0].split("=")[1];
    }
    if (!token && login.body.token) token = login.body.token;
  });

  it("creates a product", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Product", category: "Medicine", mrp: 100, unit: "box" })
      .expect(201);

    expect(res.body.name).toBe("Test Product");
  });

  it("lists products", async () => {
    const res = await request(app).get("/api/v1/products").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});