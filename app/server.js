const express = require('express');
const cors = require('cors');
// const axios = require('axios'); // REMOVED to save memory
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve Frontend

// Initialize DB safely
db.initTables();

// --- 1. INITIAL DATA PROXY ---
app.get('/api/init', async (req, res) => {
    // 1. Capture identification from query or default
    const identification = req.query.identification || "uUwxgWZb1p7hESxnjwGPFQ==:IJCj9arJarPo415Sjjv7gg==";
    const targetUrl = `https://vapi.aesysit.com/api/Data/GetUnionOrPouroList?identification=${identification}`;

    try {
        // 2. Call External API using native fetch (Node 18+)
        const response = await fetch(targetUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 3. SEND RESPONSE IMMEDIATELY (Priority #1: Speed)
        res.json(data);

        // 4. SAVE TO DB ASYNC (Priority #2: Persistence)
        db.safeSaveInit(data);

    } catch (error) {
        // External API Failed?
        console.error("External API Init Failed:", error.message);
        res.status(502).json({ error: "Failed to fetch data from target", details: error.message });
    }
});

// --- 2. SEARCH PROXY ---
app.post('/api/search', async (req, res) => {
    // Expecting body: { Name: "...", DOB: "...", Ward: "..." }
    const targetUrl = "https://vapi.aesysit.com/api/Data/GetVoterInfoListByNameDOBWard";

    // Default Identification if missing
    const payload = {
        ...req.body,
        Identification: req.body.Identification || "uUwxgWZb1p7hESxnjwGPFQ==:IJCj9arJarPo415Sjjv7gg==",
        IsArea: req.body.IsArea || false
    };

    try {
        // 2. Call External API using native fetch
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Modify response if needed
        const finalResponse = {
            ...data,
            _proxy_metadata: {
                timestamp: new Date(),
                status: "served_by_proxy_lite"
            }
        };

        // 3. SEND RESPONSE
        res.json(finalResponse);

        // 4. SAVE TO DB
        db.safeSaveSearch(payload, data);

    } catch (error) {
        console.error("External API Search Failed:", error.message);

        // --- FALLBACK: TRY LOCAL DB ---
        // console.log("Attempting local DB fallback...");
        const fallbackData = await db.searchCache(payload.Name, payload.DOB, payload.Ward);

        if (fallbackData) {
            console.log("Serving from Cache/DB");
            // Optionally mark it as cached
            // fallbackData._proxy_metadata = { status: "served_from_db_cache" };
            // (Note: fallbackData is likely already a JSON object from the DB)
            res.json(fallbackData);
            return;
        }

        // If DB also fails or has no data
        res.status(502).json({ error: "Search failed and no local data found", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`- Init API: http://localhost:${PORT}/api/init`);
    console.log(`- Search API: http://localhost:${PORT}/api/search`);
});
