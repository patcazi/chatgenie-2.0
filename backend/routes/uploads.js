import express from 'express';
import multer from 'multer';
import path from 'path';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone (disabled for now)
let pinecone = null;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir('./uploads', { recursive: true });
      cb(null, './uploads/');
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueSuffix = `${timestamp}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `doc-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.txt', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  }
});

// Improved text chunking with overlap
function chunkText(text, maxChunkSize = 1000, overlap = 100) {
  // Normalize whitespace and remove excessive newlines
  text = text.replace(/\s+/g, ' ').trim();
  
  const sentences = text.split(/[.!?]+\s+/);
  const chunks = [];
  let currentChunk = '';
  let lastChunkEnd = '';

  for (const sentence of sentences) {
    const potentialChunk = currentChunk + ' ' + sentence;
    
    if (potentialChunk.length <= maxChunkSize) {
      currentChunk = potentialChunk.trim();
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        // Keep the overlap from the previous chunk
        currentChunk = lastChunkEnd + ' ' + sentence;
        if (currentChunk.length > maxChunkSize) {
          currentChunk = sentence;
        }
      } else {
        // Handle cases where a single sentence exceeds maxChunkSize
        chunks.push(sentence.slice(0, maxChunkSize));
        currentChunk = sentence.slice(maxChunkSize);
      }
    }
    
    // Store the end of the current chunk for overlap
    lastChunkEnd = currentChunk.split(' ').slice(-overlap/10).join(' ');
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.map(chunk => chunk.trim()).filter(chunk => chunk.length > 0);
}

// Extract text from file based on type
async function extractText(file) {
  const fileBuffer = await fs.readFile(file.path);
  const ext = path.extname(file.originalname).toLowerCase();

  switch (ext) {
    case '.pdf':
      // PDF processing temporarily disabled
      throw new Error('PDF processing temporarily unavailable');
    case '.txt':
      return fileBuffer.toString('utf-8');
    case '.doc':
    case '.docx':
      throw new Error('DOC/DOCX parsing not implemented yet');
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

// Generate embeddings for chunks
async function generateEmbeddings(chunks, filename) {
  return Promise.all(
    chunks.map(async (chunk, i) => {
      try {
        const embedding = await openai.embeddings.create({
          input: chunk,
          model: "text-embedding-ada-002"
        });

        return {
          id: `${filename}-chunk-${i}`,
          values: embedding.data[0].embedding,
          metadata: {
            text: chunk,
            source: filename,
            chunk_index: i,
            timestamp: Date.now()
          }
        };
      } catch (error) {
        console.error(`Error generating embedding for chunk ${i}:`, error);
        throw error;
      }
    })
  );
}

// Add a function to check Pinecone index status
async function checkPineconeIndexes() {
  try {
    const primaryIndex = pinecone.Index(process.env.PINECONE_INDEX);
    const secondaryIndex = pinecone.Index(process.env.PINECONE_INDEX_TWO);
    
    const [primaryStats, secondaryStats] = await Promise.all([
      primaryIndex.describeIndexStats(),
      secondaryIndex.describeIndexStats()
    ]);

    return {
      primary: primaryStats,
      secondary: secondaryStats
    };
  } catch (error) {
    console.error('Error checking Pinecone indexes:', error);
    throw error;
  }
}

// Handle file uploads
router.post('/', upload.array('files', 5), async (req, res) => {
  const processingResults = [];
  const errors = [];

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Process each file
    for (const file of req.files) {
      try {
        // Extract text
        const text = await extractText(file);
        
        // Chunk text
        const chunks = chunkText(text);
        
        // Generate embeddings
        const embeddings = await generateEmbeddings(chunks, file.filename);

        processingResults.push({
          filename: file.originalname,
          chunks: chunks.length,
          success: true,
          message: 'File processed successfully (Pinecone storage temporarily disabled)'
        });

        // Clean up uploaded file
        await fs.unlink(file.path);

      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message
        });
        
        // Clean up file even if processing failed
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
    }

    // Return response
    if (errors.length === 0) {
      res.json({
        success: true,
        message: 'All files processed successfully',
        results: processingResults
      });
    } else if (processingResults.length === 0) {
      res.status(500).json({
        success: false,
        message: 'All files failed to process',
        errors
      });
    } else {
      res.status(207).json({
        success: true,
        message: 'Some files processed successfully',
        results: processingResults,
        errors
      });
    }

  } catch (error) {
    console.error('Error in file upload handler:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file processing',
      error: error.message
    });
  }
});

// Add a route to check index status
router.get('/status', async (req, res) => {
  try {
    const indexStats = await checkPineconeIndexes();
    res.json({
      success: true,
      indexes: {
        primary: {
          name: process.env.PINECONE_INDEX,
          stats: indexStats.primary
        },
        secondary: {
          name: process.env.PINECONE_INDEX_TWO,
          stats: indexStats.secondary
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking index status',
      error: error.message
    });
  }
});

export default router;