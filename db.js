/** Database setup for BizTime. */
require('dotenv').config();
const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
    DB_URI = process.env.TEST_DATABASE_URL || "postgresql:///biztime_test";
} else {
    DB_URI = process.env.DATABASE_URL || "postgresql:///biztime";
}

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;

