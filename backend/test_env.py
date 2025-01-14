from dotenv import load_dotenv
import os

# Load the .env file
load_dotenv()

# Test accessing the variables
print("Pinecone API Key:", os.getenv("PINECONE_API_KEY"))
print("Primary Pinecone Index:", os.getenv("PINECONE_INDEX"))
print("Secondary Pinecone Index:", os.getenv("PINECONE_INDEX_TWO"))
print("OpenAI API Key Placeholder:", os.getenv("OPENAI_API_KEY"))
print("LangChain API Key Placeholder:", os.getenv("LANGCHAIN_API_KEY"))