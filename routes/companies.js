const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");
const { __esModule } = require("start");

// GET /companies: Returns list of companies.
router.get("/", async (req, res, next) => {
    try {
        const result = await db.query("SELECT code, name FROM companies");
        return res.json({ companies: result.rows });
    } catch (err) {
        return next(err);
    }
});

// GET /companies/[code]:  Return obj of specific company by its code.  If company not found, return 404 status response
router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const companyResult = await db.query("SELECT code, name, description FROM companies WHERE code=$1", [code]);

        if (companyResult.rows.length === 0) {
            throw new ExpressError("Company not found", 404);
        }

        // updated to include invoices for company
        const invoicesResult = await db.query("SELECT id FROM invoices WHERE comp_code=$1", [code]);

        // updated to include industries for company
        const industriesResult = await db.query(
            `SELECT i.industry
             FROM industries AS i
             JOIN companies_industries AS ci ON i.code = ci.industry_code
             WHERE ci.comp_code = $1`, [code]
        );

        const company = companyResult.rows[0];
        company.invoices = invoicesResult.rows.map(invoice => invoice.id);
        company.industries = industriesResult.rows.map(ind => ind.industry);

        return res.json({ company });
    } catch (err) {
        return next(err);
    }
});

// POST /companies: Adds a new company
router.post("/", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        // Slugify the company name to create a code
        const code = slugify(name, { lower: true, strict: true });

        const result = await db.query("INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description", [code, name, description]
        );

        return res.status(201).json({ company: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

// PUT /companies/[code]: Edits existing company by its code.
router.put("/:code", async (req, res, next) => {
    try {
    const { code } = req.params;
    const { name, description } = req.body;
    const result = await db.query("UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description", [name, description, code]);

    if (result.rows.length === 0) {
        throw new ExpressError("Company not found", 404);
    }

    return res.json({ company: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

// DELETE /companies/[code]:  Deletes company, return 404 if company cannot be found.
router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const result = await db.query("DELETE FROM companies WHERE code=$1 RETURNING code", [code]);

        if (result.rows.length === 0) {
            throw new ExpressError("Company not found", 404);
        }

        return res.json({ status: "deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
