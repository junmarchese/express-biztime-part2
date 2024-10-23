
const { Client } = require("pg");
const fs = require('fs');
const path = require('path');


async function setupTestDb() {
    const client = new Client({
        connectionString: process.env.TEST_DATABASE_URL || 'postgresql:///biztime_test'
    });

    try {
        await client.connect();
        const sql = fs.readFileSync(path.join(__dirname, 'data.sql'), 'utf8');
        await client.query(sql);
        console.log('Test database setup complete');
    } catch (err) {
        console.error('Error setting up test database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}


if (require.main === module) {
    require('dotenv').config();
    setupTestDb();
}

module.exports = setupTestDb;



// const { Client } = require("pg");
// const { connectionString } = require("pg/lib/defaults");

// async function setupTestDb() {
//     const client = new Client({
//         connectionString: process.env.TEST_DATABASE_URL || 'postgresql:///biztime_test'
//     });

//     try {
//         await client.connect();

//         await client.query("DROP TABLE IF EXISTS invoices CASCADE");
//         await client.query("DROP TABLE IF EXISTS companies CASCADE");

//         await client.query(`
//             CREATE TABLE companies (
//                 code text PRIMARY KEY,
//                 name text NOT NULL UNIQUE,
//                 description text
//             )
//         `);

//         await client.query(`
//             CREATE TABLE invoices (
//                 id serial PRIMARY KEY,
//                 comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
//                 amt float NOT NULL,
//                 paid boolean DEFAULT false NOT NULL,
//                 add_date date DEFAULT CURRENT_DATE NOT NULL,
//                 paid_date date
//             )
//         `);
        
//         // Seed companies
//         await client.query("INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple Computer', 'Maker of OSX.')");
//         await client.query("INSERT INTO companies (code, name, description) VALUES ('ibm', 'IBM', 'Big Blue.')");

//         // Seed invoices
//         await client.query("INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('apple', 100, false, null)");
//         await client.query("INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('apple', 200, true, '2018-01-01')");
//         await client.query("INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('ibm', 400, false, null)");

//         console.log('Test database setup complete');
//     } catch (err) {
//         console.error('Error setting up test database:', err);
//         process.exit(1);
//     } finally {
//         await client.end();
//     }
// }

// if (require.main === module) {
//     require('dotenv').config();
//     setupTestDb();
// }

// module.exports = setupTestDb;