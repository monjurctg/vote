const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool to handle 1000-2000 users efficiently
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'voter_data',
    waitForConnections: true,
    connectionLimit: 100, // Adjust based on your MySQL server limits
    queueLimit: 0
});

// Promisify for lighter syntax
const promisePool = pool.promise();

// Initial Table Helper
async function initTables() {
    const createInitData = `
    CREATE TABLE IF NOT EXISTS init_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ward_name VARCHAR(255),
        area_name TEXT,
        full_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    const createSearchData = `
    CREATE TABLE IF NOT EXISTS search_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        voter_name VARCHAR(255),
        voter_id VARCHAR(50),
        dob VARCHAR(50),
        ward VARCHAR(100),
        center_name TEXT,
        full_json JSON,
        request_payload JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    try {
        await promisePool.query(createInitData);
        await promisePool.query(createSearchData);
        console.log("Tables initialized or already exist.");
    } catch (err) {
        console.error("Warning: Could not initialize database tables. App will still run, but saving MIGHT fail.", err.message);
    }
}

// Robust save function that NEVER throws to the main thread
async function safeSaveInit(data) {
    try {
        if (!data || !data.Data || !data.Data.WardOrAreaList) return;

        // We will store the WHOLE JSON for safety
        await promisePool.query(
            "INSERT INTO init_logs (full_json) VALUES (?)",
            [JSON.stringify(data)]
        );
    } catch (err) {
        console.error("DB Save Error (Init):", err.message);
    }
}

async function safeSaveSearch(reqPayload, resData) {
    try {
        // Extract Search Params from Payload
        // Payload keys might be "Name", "DOB", "Ward" based on client
        const vName = reqPayload.Name || '';
        const vDOB = reqPayload.DOB || '';
        const vWard = reqPayload.Ward || '';

        // Check if this search already exists
        const [existing] = await promisePool.query(
            "SELECT id FROM search_logs WHERE voter_name = ? AND dob = ? AND ward = ? LIMIT 1",
            [vName, vDOB, vWard]
        );

        if (existing.length > 0) {
            console.log("Skipping duplicate log save");
            return;
        }

        // We log the request AND the response
        await promisePool.query(
            "INSERT INTO search_logs (voter_name, dob, ward, request_payload, full_json) VALUES (?, ?, ?, ?, ?)",
            [vName, vDOB, vWard, JSON.stringify(reqPayload), JSON.stringify(resData)]
        );

    } catch (err) {
        console.error("DB Save Error (Search):", err.message);
    }
}

async function searchCache(name, dob, ward) {
    try {
        // Search for the MOST RECENT entry matching these details
        const [rows] = await promisePool.query(
            "SELECT full_json FROM search_logs WHERE voter_name = ? AND dob = ? AND ward = ? ORDER BY id DESC LIMIT 1",
            [name, dob, ward]
        );

        if (rows.length > 0) {
            return rows[0].full_json;
        }
        return null;
    } catch (err) {
        console.error("DB Cache Search Error:", err.message);
        return null;
    }
}

module.exports = {
    initTables,
    safeSaveInit,
    safeSaveSearch,
    searchCache
};
