import express from 'express';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone (disabled for now)
let pinecone = null;

// Chat endpoint
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        
        // For now, just use OpenAI directly without context
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: message }],
            model: "gpt-3.5-turbo",
        });

        res.json({
            success: true,
            response: completion.choices[0].message.content,
            message: "Note: Context retrieval temporarily disabled"
        });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;