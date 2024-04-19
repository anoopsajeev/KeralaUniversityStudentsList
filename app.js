// app.js

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Choose a port for your proxy server

app.use(express.static(__dirname));

// Proxy endpoint
app.get('/proxy', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'Missing URL parameter' });
        }

        const fetch = (await import('node-fetch')).default;
        const response = await fetch(url);
        const data = await response.text();
        res.send(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy error' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
