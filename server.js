require('dotenv').config();
const express = require('express');
const { Client } = require('@notionhq/client');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Check for API key
if (!process.env.NOTION_API_KEY) {
    console.error('ERROR: NOTION_API_KEY is not set in .env file');
    process.exit(1);
}

// Initialize Notion client
const notion = new Client({
    auth: process.env.NOTION_API_KEY
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Get blocks with children
app.get('/api/notion/blocks/:blockId/children', async (req, res) => {
    try {
        const { blockId } = req.params;
        const { start_cursor } = req.query;
        
        const response = await notion.blocks.children.list({
            block_id: blockId,
            start_cursor: start_cursor || undefined,
            page_size: 100
        });

        // Fetch additional data for tables and other blocks with children
        const enrichedResults = await Promise.all(response.results.map(async (block) => {
            if (block.type === 'table') {
                const children = await notion.blocks.children.list({
                    block_id: block.id
                });
                return { ...block, children: children.results };
            }
            return block;
        }));

        response.results = enrichedResults;
        res.json(response);
    } catch (error) {
        console.error('Error fetching blocks:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create page
app.post('/api/notion/pages', async (req, res) => {
    try {
        const { parent, properties, children } = req.body;
        const page = await notion.pages.create({
            parent,
            properties
        });

        if (children && children.length > 0) {
            await notion.blocks.children.append({
                block_id: page.id,
                children: children
            });
        }

        res.json(page);
    } catch (error) {
        console.error('Error creating page:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Using Notion API Key:', process.env.NOTION_API_KEY ? 'YES' : 'NO');
});