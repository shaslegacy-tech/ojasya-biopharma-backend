// test/mr.test.ts
import request from "supertest";
import app from "../src/server";

describe("MR module", () => {
  let adminToken = "";
  let mrUserId = "";

  beforeAll(async () => {
    await request(app).post("/api/v1/auth/register").send({ name: "Admin", email: "admin2@example.com", password: "Password123!", role: "admin" });
    const login = await request(app).post("/api/v1/auth/login").send({ email: "admin2@example.com", password: "Password123!" });
    const cookies = login.headers["set-cookie"];
    if (cookies) {
      const rawCookies = Array.isArray(cookies) ? cookies : [cookies];
      const tokenCookie = rawCookies.find((c: string) => c.startsWith("token="));
      if (tokenCookie) adminToken = tokenCookie.split(";")[0].split("=")[1];
    }
    // create an MR user account (role=mr)
    const userResp = await request(app).post("/api/v1/auth/register").send({ name: "MR User", email: "mr@example.com", password: "Password123!", role: "mr" });
    mrUserId = userResp.body.user.id || userResp.body.user._id || userResp.body.user;
  });

  it("admin creates MR profile", async () => {
    const res = await request(app)
      .post("/api/v1/mrs")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ userId: mrUserId, territories: ["Mumbai"], phone: "9999999999" })
      .expect(201);

    expect(res.body).toHaveProperty("_id");
    expect(res.body.userId).toBeDefined();
  });

  it("get list of MR profiles", async () => {
    const res = await request(app)
      .get("/api/v1/mrs")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});