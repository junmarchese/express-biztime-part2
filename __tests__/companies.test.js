const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeEach(async () => {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
    await db.query("INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple Computer', 'Maker of OSX.')");
});

afterAll(async () => {
    await db.end();
});

describe("GET /companies", () => {
    test("It should return a list of companies", async () => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [{ code: "apple", name: "Apple Computer" }]});
        expect(res.body.companies).toBeInstanceOf(Array);
    });
});

describe("GET /companies/:code", () => {
    test("It should return a specific company", async () => {
        const res = await request(app).get("/companies/apple");
        expect(res.statusCode).toBe(200);
        expect(res.body.company).toHaveProperty("code");
        expect(res.body.company).toHaveProperty("name");
    });

    test("It should return 404 for a non-existing company", async () => {
        const res = await request(app).get("/companies/unknown");
        expect(res.statusCode).toBe(404);
    });
});


describe("POST /companies", () => {
    test("It should add a new company", async () => {
        const res = await request(app).post("/companies").send({ code: "msft", name: "Microsoft", description: "The Original Tech company" });
        expect(res.statusCode).toBe(201);
        expect(res.body.company).toHaveProperty("code");
        expect(res.body.company.code).toBe("msft");
    });
});


describe("PUT /companies/:code", () => {
    test("It should update an existing company", async () => {
        const res = await request(app).put("/companies/apple").send({ name: "Apple Inc.", description: "Updated description for modern Apple." });
        expect(res.statusCode).toBe(200);
        expect(res.body.company.name).toBe("Apple Inc.");
    });

    test("It should return 404 for attempting to update non-existent company", async () => {
        const res = await request(app).put("/companies/nonexistent").send({ name: "Nonexistent", description: "Nonexistent company." });
        expect(res.statusCode).toBe(404);
    });
});


describe("DELETE /companies/:code", () => {
    test("It should delete a company", async () => {
        const res = await request(app).delete("/companies/apple");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" });
    });

    test("It should return 404 if attempting to delete non-existing company", async () => {
        const res = await request(app).delete("/companies/nonexistent");
        expect(res.statusCode).toBe(404);
    });
})


