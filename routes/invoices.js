const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET /invoices: Return a list of invoices
router.get("/", async (req, res, next) => {
    try {
        const result = await db.query("SELECT id, comp_code FROM invoices");
        return res.json({ invoices: result.rows });
    } catch (err) {
        return next(err);
    }
});

// GET /invoices/[id]: Returns a specific invoice by ID.
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT i.id, 
                    i.amt, 
                    i.paid, 
                    i.add_date, 
                    i.paid_date, 
                    c.code, 
                    c.name, 
                    c.description 
            FROM invoices AS i
            JOIN companies AS c ON i.comp_code = c.code
            WHERE i.id = $1`, [id]);

        if (result.rows.length === 0) {
            throw new ExpressError("Invoice not found", 404)
        }

        const invoice = result.rows[0];

        return res.json({ 
            invoice: {
                id: invoice.id, 
                amt: invoice.amt,
                paid: invoice.paid, 
                add_date: invoice.add_date, 
                paid_date: invoice.paid_date, 
                company: { 
                    code: invoice.code, 
                    name: invoice.name, 
                    description: invoice.description 
                },
            },
        });
    } catch (err) {
        return next(err);
    }
});

// POST /invoices:  Adds a new invoice
router.post("/", async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const result = await db.query("INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date", [comp_code, amt]);

        return res.status(201).json({ invoice: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

//PUT /invoices/[id]: Updates an invoice
router.put("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;

        // Fetch current invoice to determine the state of "paid"
        const currentResult = await db.query(`SELECT paid, paid_date FROM invoices WHERE id = $1`, [id]);

        if (currentResult.rows.length === 0) {
            throw new ExpressError("Invoice not found", 404);
        }

        const currentInvoice = currentResult.rows[0];
        let paidDate;

        // Logic for setting the paid_date based on current and new "paid" states
        if (!currentInvoice.paid && paid) {
            paidDate = new Date();
        } else if (currentInvoice.paid && !paid) {
            paidDate = null;
        } else {
            paidDate = currentInvoice.paid_date;
        }

        const result = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, paidDate, id]);

        return res.json({ invoice: result.rows[0] });
    } catch(err) {
        return next(err);
    }
});

// DELETE /invoices/[id]:  Deletes an invoice
router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query("DELETE FROM invoices WHERE id=$1 RETURNING id", [id]);

        if (result.rows.length === 0) {
            throw new ExpressError("Invoice not found", 404);
        }

        return res.json({ status: "deleted" }); 
    } catch (err) {
        return next(err);
    }
});


module.exports = router;

