const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");


// GET /industries: List all industries and the company(s) associated with each industry
router.get("/", async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT i.code, i.industry, ARRAY_AGG(ci.comp_code) AS companies
            FROM industries AS i
            LEFT JOIN companies_industries AS ci ON i.code = ci.industry_code
            GROUP BY i.code, i.industry`);
        return res.json({ industries: result.rows });
    } catch (err) {
        return next(err);
    }
});

// POST /industries: Adds a new industry
router.post("/", async (req, res, next) => {
    try {
        const { code, industry } = req.body;
        const result = await db.query("INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry", [code, industry]);
        return res.status(201).json({ industry: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

// POST /industries/[industry_code]/companies: Associate an industry to a company
router.post("/:industry_code/companies", async (req, res, next) => {
    try {
        const { industry_code } = req.params;
        const { comp_code } = req.body;

        // Check if association already exists
        const checkResult = await db.query(`SELECT * FROM companies_industries WHERE comp_code=$1 AND industry_code=$2`, [comp_code, industry_code]
        );

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: `Association between industry '${industry_code}' and company '${comp_code}' already exists.` });
        }

        const result = await db.query(`INSERT INTO companies_industries (comp_code, industry_code) VALUES ($1, $2) RETURNING comp_code, industry_code`, [comp_code, industry_code]);

        return res.status(201).json({ association: `Industry ${industry_code} is associated with Company ${comp_code}` });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;