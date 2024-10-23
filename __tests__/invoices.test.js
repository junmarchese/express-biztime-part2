const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeEach(async () => {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
    await db.query("ALTER SEQUENCE invoices_id_seq RESTART WITH 1");
    await db.query("INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple Computer', 'Maker of OSX.')");
    await db.query("INSERT INTO invoices(comp_code, amt, paid, paid_date) VALUES ('apple', 100, false, null)");
});

afterAll(async () => {
    await db.end();
});

describe("GET /invoices", () => {
    test("It should return a list of invoices", async () => {
        const res = await request(app).get("/invoices");
        expect(res.statusCode).toBe(200);
        expect(res.body.invoices.length).toBeGreaterThan(0);
        expect(res.body.invoices).toBeInstanceOf(Array);
    });
});

describe("GET /invoices/:id", () => {
    test("It should return a specific invoice", async () => {
        const res = await request(app).get("/invoices/1");
        expect(res.statusCode).toBe(200);
        expect(res.body.invoice).toHaveProperty("id");
        expect(res.body.invoice).toHaveProperty("amt");
    });

    test("It should return 404 if invoice does not exist", async () => {
        const res = await request(app).get("/invoices/55");
        expect(res.statusCode).toBe(404);
    });
});


describe("POST /invoices", () => {
    test("It should add a new invoice", async () => {
        const res = await request(app).post("/invoices").send({ comp_code: "apple", amt: 1000 });
        expect(res.statusCode).toBe(201);
        expect(res.body.invoice).toHaveProperty("id");
        expect(res.body.invoice.amt).toBe(1000);
    });
});


describe("PUT /invoices/:id", () => {
    test("It should update an existing invoice", async () => {
        const res = await request(app).put("/invoices/1").send({ amt: 1200 });
        expect(res.statusCode).toBe(200);
        expect(res.body.invoice.amt).toBe(1200);
    });

    test("It should return 404 if invoice does not exist", async () => {
        const res = await request(app).put("/invoices/55").send({ amt: 500 });
        expect(res.statusCode).toBe(404);
    });
});


describe("Delete /invoices/:id", () => {
    test("It should delete an existing invoice", async () => {
        const res = await request(app).delete("/invoices/1");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" });
    });

    test("It should return 404 if attempting to delete nonexistent invoice", async () => {
        const res = await request(app).delete("/invoices/55");
        expect(res.statusCode).toBe(404);
    });
});

