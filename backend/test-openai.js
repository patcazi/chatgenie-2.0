import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test function
async function testConnection() {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "Hello, are you there?" }],
      model: "gpt-3.5-turbo",
    });
    console.log("Connection successful!");
    console.log("Response:", completion.choices[0].message);
  } catch (error) {
    console.error("Error:", error);
  }
}

testConnection();